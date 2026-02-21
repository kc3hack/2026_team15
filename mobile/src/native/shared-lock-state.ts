import { NativeModules } from 'react-native';

type LockStatePayload = {
  syncEnabled: boolean;
  dailyLimitSeconds: number;
  todayUsageSeconds: number;
  isBlocked: boolean;
  localDate: string;
  updatedAt: string;
};

type SharedLockStateModule = {
  saveLockState(payload: LockStatePayload): Promise<void>;
};

const module = NativeModules.SharedLockStateModule as
  | SharedLockStateModule
  | undefined;

export const SharedLockState = {
  async save(payload: LockStatePayload): Promise<void> {
    if (!module) {
      return;
    }
    await module.saveLockState(payload);
  },
};
