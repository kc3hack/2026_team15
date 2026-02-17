import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppStep, AppInfo, Contract, Profile } from '../types/domain';
import { mockStore } from './mock-store';

interface AppContextType {
  step: AppStep;
  setStep: (step: AppStep) => void;
  profile: Profile | null;
  login: () => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>('login');
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

  const login = useCallback(() => {
    const p = mockStore.login('mock_apple_user_001');
    setProfile(p);

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

  const logout = useCallback(() => {
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

  return (
    <AppContext.Provider
      value={{
        step,
        setStep,
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
      }}>
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
