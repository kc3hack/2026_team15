export type ContractStatus = 'active' | 'completed' | 'canceled';

export type Contract = {
  id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  daily_limit_seconds: number;
  penalty_per_day: number;
  deposit_total: number;
  status: ContractStatus;
  selected_apps: string[];
};

export type Violation = {
  id: string;
  contract_id: string;
  user_id: string;
  date: string;
  exceeded_at: string;
  penalty_amount: number;
};

export type LedgerEntryType = 'deposit' | 'penalty' | 'refund_mock';

export type LedgerEntry = {
  id: string;
  user_id: string;
  contract_id: string;
  type: LedgerEntryType;
  amount: number;
  local_date: string;
  note: string | null;
  created_at: string;
};
