import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AppStep, AppInfo, Contract, Profile } from '../types/domain';
import { mockStore } from './mock-store';
import { supabase } from './supabase';
import { notifyIfThresholdReached } from './usage-warning-notifier';

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
  createContract: (dailyLimitSeconds: number) => void;
  activeContract: Contract | null;
  refreshContract: () => void;
  simulateUsage: (bundleId: string, seconds: number) => void;
  triggerViolation: () => boolean;
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

  const createContract = useCallback((dailyLimitSeconds: number) => {
    const contract = mockStore.createContract(dailyLimitSeconds);
    setActiveContract(contract);
    setStep('dashboard');
  }, []);

  const refreshContract = useCallback(() => {
    mockStore.checkContractExpiry();
    const contract = mockStore.getActiveContract();
    setActiveContract(contract);
    setRefreshKey(k => k + 1);
  }, []);

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

  const triggerViolation = useCallback((): boolean => {
    if (!activeContract) return false;
    const result = mockStore.recordViolation(activeContract.id);
    refreshContract();
    return result !== null;
  }, [activeContract, refreshContract]);

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
