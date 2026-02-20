import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import type {
  AppStep,
  AppInfo,
  Contract,
  LedgerEntry,
  Profile,
  Violation,
} from '../types/domain';
import { mockStore } from './mock-store';
import { supabase } from './supabase';
import { notifyIfThresholdReached } from './usage-warning-notifier';
import { env } from '../config/env';

interface AppContextType {
  step: AppStep;
  setStep: (step: AppStep) => void;
  isAuthInitializing: boolean;
  profile: Profile | null;
  login: () => Promise<void>;
  logout: () => void;
  grantPermission: () => void;
  hasPermission: boolean;
  selectedApps: AppInfo[];
  setSelectedApps: (apps: AppInfo[]) => void;
  paymentCompleted: boolean;
  setPaymentCompleted: (completed: boolean) => void;
  pendingContractData: {
    dailyLimitSeconds: number;
    depositTotal: number;
  } | null;
  setPendingContractData: (data: {
    dailyLimitSeconds: number;
    depositTotal: number;
  }) => void;
  createContract: (dailyLimitSeconds: number) => Promise<void>;
  activeContract: Contract | null;
  refreshContract: () => void;
  simulateUsage: (bundleId: string, seconds: number) => void;
  triggerViolation: () => Promise<boolean>;
  resetDailyShield: () => void;
  advanceMockDay: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>('login');
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedApps, setSelectedAppsState] = useState<AppInfo[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [pendingContractData, setPendingContractData] = useState<{
    dailyLimitSeconds: number;
    depositTotal: number;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setRefreshKey] = useState(0);

  const syncStepFromMockState = useCallback(() => {
    // Check if there's already an active contract
    const existing = mockStore.getActiveContract();
    if (existing) {
      setActiveContract(existing);
      setHasPermission(true);
      setSelectedAppsState(existing.selectedApps);
      setStep('dashboard');
    } else if (mockStore.hasScreenTimePermission()) {
      setHasPermission(true);
      const apps = mockStore.getSelectedApps();
      if (apps.length > 0) {
        setSelectedAppsState(apps);
        setStep('create-contract');
      } else {
        setStep('pick-apps');
      }
    } else {
      setStep('permission');
    }
  }, []);

  const ensureAuthenticatedProfile = useCallback(async (): Promise<Profile> => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }

    let session = sessionData.session;
    if (session) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        // Stored session can be stale after project/key changes; recreate it.
        await supabase.auth.signOut();
        session = null;
      }
    }
    if (!session) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInAnonymously();
      if (signInError) {
        throw signInError;
      }
      session = signInData.session;
    }

    const user = session?.user;
    if (!user) {
      throw new Error('Supabase session user is missing');
    }

    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        apple_user_id: null,
      },
      { onConflict: 'id' },
    );
    if (upsertError) {
      throw upsertError;
    }

    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('id, apple_user_id, stripe_customer_id, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) {
      throw profileError;
    }

    const now = new Date().toISOString();
    return {
      id: profileRow?.id ?? user.id,
      appleUserId: profileRow?.apple_user_id ?? null,
      stripeCustomerId: profileRow?.stripe_customer_id ?? null,
      createdAt: profileRow?.created_at ?? now,
      updatedAt: profileRow?.updated_at ?? now,
    };
  }, []);

  const login = useCallback(async () => {
    setIsAuthInitializing(true);
    try {
      const authenticatedProfile = await ensureAuthenticatedProfile();
      setProfile(authenticatedProfile);
      mockStore.login(authenticatedProfile.id);
      syncStepFromMockState();
    } finally {
      setIsAuthInitializing(false);
    }
  }, [ensureAuthenticatedProfile, syncStepFromMockState]);

  useEffect(() => {
    void login().catch(error => {
      console.error('Failed to initialize auth session:', error);
      setProfile(null);
      setStep('login');
      setIsAuthInitializing(false);
    });
  }, [login]);

  const logout = useCallback(() => {
    void supabase.auth.signOut().catch(error => {
      console.warn('Failed to sign out from Supabase:', error);
    });
    mockStore.logout();
    setProfile(null);
    setHasPermission(false);
    setSelectedAppsState([]);
    setActiveContract(null);
    setPaymentCompleted(false);
    setPendingContractData(null);
    setStep('login');
  }, []);

  const grantPermission = useCallback(() => {
    mockStore.requestScreenTimePermission();
    setHasPermission(true);
    setStep('pick-apps');
  }, []);

  const setSelectedApps = useCallback((apps: AppInfo[]) => {
    mockStore.setSelectedApps(apps);
    setSelectedAppsState(apps);
  }, []);

  const createContract = useCallback(
    async (dailyLimitSeconds: number) => {
      if (selectedApps.length === 0) {
        console.error('[createContract] No selected apps');
        return;
      }

      // Calculate deposit total (500 yen/day * 7 days)
      const depositTotal = 500 * 7;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          console.error('[createContract] No session');
          return;
        }

        const response = await fetch(
          `${env.supabaseUrl}/functions/v1/create-contract`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              dailyLimitSeconds,
              depositTotal,
              selectedApps: selectedApps.map(app => ({
                bundleId: app.bundleId,
                name: app.name,
                category: app.category,
              })),
              contractDays: 7,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[createContract] Error:', errorData);
          return;
        }

        const { contract } = await response.json();

        // Update local state with the created contract
        const newContract: Contract = {
          id: contract.id,
          userId: profile?.id ?? '',
          startAt: contract.startAt,
          endAt: contract.endAt,
          dailyLimitSeconds: contract.dailyLimitSeconds,
          penaltyPerDay: 500,
          depositTotal: contract.depositTotal,
          status: contract.status,
          selectedApps: contract.selectedApps,
          selectedCategories: null,
        };

        // Also save to mockStore for compatibility with existing dashboard logic
        mockStore.setContractFromDB(newContract);

        setActiveContract(newContract);
        setPaymentCompleted(false);
        setPendingContractData(null);
        setStep('dashboard');
      } catch (error) {
        console.error('[createContract] Error:', error);
      }
    },
    [selectedApps, profile?.id],
  );

  const refreshContract = useCallback(() => {
    mockStore.checkContractExpiry();
    const contract = mockStore.getActiveContract();
    setActiveContract(contract);
    setRefreshKey(k => k + 1);
  }, []);

  const fetchViolations = useCallback(
    async (contractId: string): Promise<Violation[]> => {
      const { data, error } = await supabase
        .from('violations')
        .select(
          'id, contract_id, user_id, date, exceeded_at, penalty_amount, created_at',
        )
        .eq('contract_id', contractId)
        .order('date', { ascending: false });
      if (error) {
        throw error;
      }

      return (data ?? []).map(row => ({
        id: row.id,
        contractId: row.contract_id,
        userId: row.user_id,
        date: row.date,
        exceededAt: row.exceeded_at,
        penaltyAmount: row.penalty_amount,
      }));
    },
    [],
  );

  const fetchLedgerEntries = useCallback(
    async (contractId: string): Promise<LedgerEntry[]> => {
      const { data, error } = await supabase
        .from('ledger_entries')
        .select(
          'id, user_id, contract_id, type, amount, local_date, note, created_at',
        )
        .eq('contract_id', contractId)
        .order('created_at', { ascending: true });
      if (error) {
        throw error;
      }

      return (data ?? []).map(row => ({
        id: row.id,
        userId: row.user_id,
        contractId: row.contract_id,
        type: row.type,
        amount: row.amount,
        localDate: row.local_date,
        note: row.note ?? '',
        createdAt: row.created_at,
      }));
    },
    [],
  );

  const syncContractFinancials = useCallback(
    async (contractId: string) => {
      const [violations, ledgerEntries] = await Promise.all([
        fetchViolations(contractId),
        fetchLedgerEntries(contractId),
      ]);
      mockStore.replaceViolationsForContract(contractId, violations);
      mockStore.replaceLedgerEntriesForContract(contractId, ledgerEntries);
      mockStore.syncShieldState(contractId);
    },
    [fetchLedgerEntries, fetchViolations],
  );

  const simulateUsage = useCallback(
    (bundleId: string, seconds: number) => {
      mockStore.simulateUsage(bundleId, seconds);
      const contract = mockStore.getActiveContract();
      if (contract) {
        void notifyIfThresholdReached({
          contractId: contract.id,
          localDate: mockStore.getMockLocalDate(),
          usageSeconds: mockStore.getTodayTotalUsage(),
          dailyLimitSeconds: contract.dailyLimitSeconds,
        }).catch(error => {
          console.warn('Failed to send usage warning notification:', error);
        });
      }
      refreshContract();
    },
    [refreshContract],
  );

  const triggerViolation = useCallback(async (): Promise<boolean> => {
    if (!activeContract) return false;

    const exceededAt = new Date().toISOString();
    const localDate = mockStore.getMockLocalDate();

    try {
      await ensureAuthenticatedProfile();

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error('Supabase access token is missing');
      }

      const { data, error } = await supabase.functions.invoke<{
        ok: boolean;
        result?: { violation_applied?: boolean };
      }>('record-violation', {
        body: {
          contractId: activeContract.id,
          exceededAt,
          localDate,
        },
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });

      if (error) {
        throw error;
      }

      await syncContractFinancials(activeContract.id);
      refreshContract();
      return Boolean(data?.result?.violation_applied);
    } catch (error) {
      if (error instanceof FunctionsHttpError) {
        let details: unknown = null;
        try {
          details = await error.context.json();
        } catch {
          details = null;
        }
        console.warn('record-violation returned non-2xx:', {
          status: error.context.status,
          statusText: error.context.statusText,
          details,
        });
      } else {
        console.warn('Failed to record violation via Edge Function:', error);
      }
      const result = mockStore.recordViolation(activeContract.id);
      console.warn('Falling back to local mock violation record');
      refreshContract();
      return result !== null;
    }
  }, [
    activeContract,
    ensureAuthenticatedProfile,
    refreshContract,
    syncContractFinancials,
  ]);

  const resetDailyShield = useCallback(() => {
    mockStore.resetDailyShield();
    refreshContract();
  }, [refreshContract]);

  const advanceMockDay = useCallback(() => {
    mockStore.advanceToNextDay();
    refreshContract();
  }, [refreshContract]);

  return (
    <AppContext.Provider
      value={{
        step,
        setStep,
        isAuthInitializing,
        profile,
        login,
        logout,
        grantPermission,
        hasPermission,
        selectedApps,
        setSelectedApps,
        paymentCompleted,
        setPaymentCompleted,
        pendingContractData,
        setPendingContractData,
        createContract,
        activeContract,
        refreshContract,
        simulateUsage,
        triggerViolation,
        resetDailyShield,
        advanceMockDay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
