import type {
  Profile,
  Contract,
  Violation,
  LedgerEntry,
  AppInfo,
  MockScreenTimeUsage,
} from '../types/domain';

// Mock app catalog (simulating iOS apps)
export const MOCK_APP_CATALOG: AppInfo[] = [
  {
    bundleId: 'com.twitter.ios',
    name: 'X (Twitter)',
    icon: 'MessageCircle',
    category: 'SNS',
  },
  {
    bundleId: 'com.instagram.ios',
    name: 'Instagram',
    icon: 'Camera',
    category: 'SNS',
  },
  {
    bundleId: 'com.tiktok.ios',
    name: 'TikTok',
    icon: 'Play',
    category: 'Entertainment',
  },
  {
    bundleId: 'com.youtube.ios',
    name: 'YouTube',
    icon: 'MonitorPlay',
    category: 'Entertainment',
  },
  {
    bundleId: 'com.facebook.ios',
    name: 'Facebook',
    icon: 'Users',
    category: 'SNS',
  },
  {
    bundleId: 'com.reddit.ios',
    name: 'Reddit',
    icon: 'MessageSquare',
    category: 'SNS',
  },
  {
    bundleId: 'com.netflix.ios',
    name: 'Netflix',
    icon: 'Tv',
    category: 'Entertainment',
  },
  {
    bundleId: 'com.spotify.ios',
    name: 'Spotify',
    icon: 'Music',
    category: 'Music',
  },
  {
    bundleId: 'com.discord.ios',
    name: 'Discord',
    icon: 'Headphones',
    category: 'Communication',
  },
  {
    bundleId: 'com.line.ios',
    name: 'LINE',
    icon: 'MessageCircle',
    category: 'Communication',
  },
  {
    bundleId: 'com.pinterest.ios',
    name: 'Pinterest',
    icon: 'Image',
    category: 'SNS',
  },
  {
    bundleId: 'com.snapchat.ios',
    name: 'Snapchat',
    icon: 'Ghost',
    category: 'SNS',
  },
];

// Helper to generate UUIDs (simple implementation for React Native)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to get today's date string
export function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format seconds to human readable
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// In-memory mock store
class MockStore {
  private profile: Profile | null = null;
  private contracts: Contract[] = [];
  private violations: Violation[] = [];
  private ledgerEntries: LedgerEntry[] = [];
  private screenTimePermission: boolean = false;
  private selectedApps: AppInfo[] = [];
  private mockUsage: MockScreenTimeUsage[] = [];
  private monitoringActive: boolean = false;
  private shieldActive: boolean = false;

  // Auth
  login(appleUserId: string): Profile {
    if (this.profile) return this.profile;
    this.profile = {
      id: generateId(),
      appleUserId,
      stripeCustomerId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.profile;
  }

  getProfile(): Profile | null {
    return this.profile;
  }

  isLoggedIn(): boolean {
    return this.profile !== null;
  }

  logout(): void {
    this.profile = null;
    this.contracts = [];
    this.violations = [];
    this.ledgerEntries = [];
    this.screenTimePermission = false;
    this.selectedApps = [];
    this.mockUsage = [];
    this.monitoringActive = false;
    this.shieldActive = false;
  }

  // Screen Time Permission (mock)
  requestScreenTimePermission(): boolean {
    this.screenTimePermission = true;
    return true;
  }

  hasScreenTimePermission(): boolean {
    return this.screenTimePermission;
  }

  // App selection
  setSelectedApps(apps: AppInfo[]): void {
    this.selectedApps = apps;
  }

  getSelectedApps(): AppInfo[] {
    return this.selectedApps;
  }

  // Contract
  getActiveContract(): Contract | null {
    return this.contracts.find(c => c.status === 'active') || null;
  }

  getLatestContract(): Contract | null {
    if (this.contracts.length === 0) return null;
    return this.contracts[this.contracts.length - 1];
  }

  createContract(dailyLimitSeconds: number): Contract {
    const existing = this.getActiveContract();
    if (existing) throw new Error('Active contract already exists');
    if (!this.profile) throw new Error('Not logged in');

    const now = new Date();
    const endAt = new Date(now);
    endAt.setDate(endAt.getDate() + 7);

    const penaltyPerDay = 500;
    const depositTotal = penaltyPerDay * 7;

    const contract: Contract = {
      id: generateId(),
      userId: this.profile.id,
      startAt: now.toISOString(),
      endAt: endAt.toISOString(),
      dailyLimitSeconds,
      penaltyPerDay,
      depositTotal,
      status: 'active',
      selectedApps: [...this.selectedApps],
      selectedCategories: null,
    };

    this.contracts.push(contract);

    // Create deposit ledger entry
    this.ledgerEntries.push({
      id: generateId(),
      userId: this.profile.id,
      contractId: contract.id,
      type: 'deposit',
      amount: depositTotal,
      localDate: getLocalDate(),
      note: 'Contract deposit',
      createdAt: new Date().toISOString(),
    });

    this.monitoringActive = true;
    return contract;
  }

  // Set contract from DB (for syncing with Supabase)
  setContractFromDB(contract: Contract): void {
    // Remove any existing contract with the same id
    this.contracts = this.contracts.filter(c => c.id !== contract.id);
    // Add the contract from DB
    this.contracts.push(contract);
    this.monitoringActive = contract.status === 'active';
  }

  completeContract(contractId: string): void {
    const contract = this.contracts.find(c => c.id === contractId);
    if (contract) {
      contract.status = 'completed';
      this.monitoringActive = false;
      this.shieldActive = false;

      // Refund remaining balance
      const balance = this.getContractBalance(contractId);
      if (balance > 0 && this.profile) {
        this.ledgerEntries.push({
          id: generateId(),
          userId: this.profile.id,
          contractId,
          type: 'refund_mock',
          amount: 0, // just a marker, balance is calculated from sum
          localDate: getLocalDate(),
          note: 'Contract completed - mock refund',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // Violations
  recordViolation(contractId: string): Violation | null {
    const today = getLocalDate();
    const existing = this.violations.find(
      v => v.contractId === contractId && v.date === today,
    );
    if (existing) return null; // idempotent: 1 violation per day

    if (!this.profile) return null;
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) return null;

    const violation: Violation = {
      id: generateId(),
      contractId,
      userId: this.profile.id,
      date: today,
      exceededAt: new Date().toISOString(),
      penaltyAmount: contract.penaltyPerDay,
    };

    this.violations.push(violation);

    // Deduct from ledger
    this.ledgerEntries.push({
      id: generateId(),
      userId: this.profile.id,
      contractId,
      type: 'penalty',
      amount: -contract.penaltyPerDay,
      localDate: today,
      note: `Violation penalty - ${today}`,
      createdAt: new Date().toISOString(),
    });

    this.shieldActive = true;
    return violation;
  }

  getViolationsForContract(contractId: string): Violation[] {
    return this.violations.filter(v => v.contractId === contractId);
  }

  getTodayViolation(contractId: string): Violation | null {
    const today = getLocalDate();
    return (
      this.violations.find(
        v => v.contractId === contractId && v.date === today,
      ) || null
    );
  }

  // Ledger
  getContractBalance(contractId: string): number {
    return this.ledgerEntries
      .filter(e => e.contractId === contractId)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getLedgerEntries(contractId: string): LedgerEntry[] {
    return this.ledgerEntries.filter(e => e.contractId === contractId);
  }

  // Mock Screen Time
  simulateUsage(appBundleId: string, additionalSeconds: number): void {
    const today = getLocalDate();
    const existing = this.mockUsage.find(
      u => u.appBundleId === appBundleId && u.date === today,
    );
    if (existing) {
      existing.usedSeconds += additionalSeconds;
    } else {
      this.mockUsage.push({
        appBundleId,
        usedSeconds: additionalSeconds,
        date: today,
      });
    }
  }

  getTodayTotalUsage(): number {
    const today = getLocalDate();
    const contract = this.getActiveContract();
    if (!contract) return 0;

    const monitoredBundleIds = contract.selectedApps.map(a => a.bundleId);
    return this.mockUsage
      .filter(
        u => u.date === today && monitoredBundleIds.includes(u.appBundleId),
      )
      .reduce((sum, u) => sum + u.usedSeconds, 0);
  }

  getAppUsageToday(): MockScreenTimeUsage[] {
    const today = getLocalDate();
    return this.mockUsage.filter(u => u.date === today);
  }

  isMonitoring(): boolean {
    return this.monitoringActive;
  }

  isShieldActive(): boolean {
    return this.shieldActive;
  }

  resetDailyShield(): void {
    this.shieldActive = false;
  }

  // Check if contract has expired
  checkContractExpiry(): void {
    const contract = this.getActiveContract();
    if (contract && new Date() >= new Date(contract.endAt)) {
      this.completeContract(contract.id);
    }
  }

  // Get days remaining
  getDaysRemaining(): number {
    const contract = this.getActiveContract();
    if (!contract) return 0;
    const now = new Date();
    const end = new Date(contract.endAt);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Get violation days count
  getViolationDaysCount(contractId: string): number {
    return this.violations.filter(v => v.contractId === contractId).length;
  }

  // Get total penalty
  getTotalPenalty(contractId: string): number {
    return this.ledgerEntries
      .filter(e => e.contractId === contractId && e.type === 'penalty')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  }
}

// Singleton
export const mockStore = new MockStore();
