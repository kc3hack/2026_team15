// Profile
export type Profile = {
  id: string;
  appleUserId: string;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
};

// App Info (for app catalog)
export type AppInfo = {
  bundleId: string;
  name: string;
  icon: string;
  category: string;
};

// Contract
export type ContractStatus = 'active' | 'completed' | 'canceled';

export type Contract = {
  id: string;
  userId: string;
  startAt: string;
  endAt: string;
  dailyLimitSeconds: number;
  penaltyPerDay: number;
  depositTotal: number;
  status: ContractStatus;
  selectedApps: AppInfo[];
  selectedCategories: string[] | null;
};

// Violation
export type Violation = {
  id: string;
  contractId: string;
  userId: string;
  date: string;
  exceededAt: string;
  penaltyAmount: number;
};

// Ledger Entry
export type LedgerEntryType = 'deposit' | 'penalty' | 'refund_mock';

export type LedgerEntry = {
  id: string;
  userId: string;
  contractId: string;
  type: LedgerEntryType;
  amount: number;
  localDate: string;
  note: string;
  createdAt: string;
};

// App Step (navigation flow)
export type AppStep =
  | 'login'
  | 'permission'
  | 'pick-apps'
  | 'create-contract'
  | 'payment'
  | 'dashboard';

// Mock Screen Time Usage
export type MockScreenTimeUsage = {
  appBundleId: string;
  usedSeconds: number;
  date: string;
};
