import { NativeModules } from 'react-native';

type StartMonitoringParams = {
  dailyLimitSeconds: number;
  selectedBundleIds: string[];
};

type ScreenTimeModule = {
  requestAuthorization(): Promise<boolean>;
  presentAppPicker(): Promise<string[]>;
  startMonitoring(params: StartMonitoringParams): Promise<void>;
  clearShield(): Promise<void>;
};

const module = NativeModules.ScreenTimeModule as ScreenTimeModule | undefined;

function requireModule(): ScreenTimeModule {
  if (!module) {
    throw new Error(
      'ScreenTimeModule is not linked. Implement native Swift module in ios/mobile.',
    );
  }
  return module;
}

export const ScreenTime = {
  async requestAuthorization(): Promise<boolean> {
    if (!module) {
      return true;
    }
    return requireModule().requestAuthorization();
  },
  async presentAppPicker(): Promise<string[]> {
    if (!module) {
      return ['com.apple.MobileSMS'];
    }
    return requireModule().presentAppPicker();
  },
  async startMonitoring(params: StartMonitoringParams): Promise<void> {
    if (!module) {
      return;
    }
    await requireModule().startMonitoring(params);
  },
  async clearShield(): Promise<void> {
    if (!module) {
      return;
    }
    await requireModule().clearShield();
  },
};
