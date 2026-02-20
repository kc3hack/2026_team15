import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
  notifyIfThresholdReached,
  requestPermission,
} from '../src/lib/usage-warning-notifier';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
  requestPermissions: jest.fn(),
  addNotificationRequest: jest.fn(),
}));

describe('usage-warning-notifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns permission result when requesting notification permission', async () => {
    (PushNotificationIOS.requestPermissions as jest.Mock).mockResolvedValue({
      alert: true,
      sound: false,
      badge: false,
    });

    const granted = await requestPermission();

    expect(granted).toBe(true);
    expect(PushNotificationIOS.requestPermissions).toHaveBeenCalledWith({
      alert: true,
      badge: false,
      sound: true,
    });
  });

  it('does not notify under threshold', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await notifyIfThresholdReached({
      contractId: 'contract-1',
      localDate: '2026-02-20',
      usageSeconds: 790,
      dailyLimitSeconds: 1000,
    });

    expect(PushNotificationIOS.addNotificationRequest).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('sends one notification at 80% and deduplicates on same day', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('already-sent');

    await notifyIfThresholdReached({
      contractId: 'contract-1',
      localDate: '2026-02-20',
      usageSeconds: 800,
      dailyLimitSeconds: 1000,
    });
    await notifyIfThresholdReached({
      contractId: 'contract-1',
      localDate: '2026-02-20',
      usageSeconds: 850,
      dailyLimitSeconds: 1000,
    });

    expect(PushNotificationIOS.addNotificationRequest).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(
      1,
      'usage-warning:contract-1:2026-02-20:80',
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('sends one notification at 90%', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await notifyIfThresholdReached({
      contractId: 'contract-1',
      localDate: '2026-02-20',
      usageSeconds: 900,
      dailyLimitSeconds: 1000,
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      'usage-warning:contract-1:2026-02-20:90',
    );
    expect(PushNotificationIOS.addNotificationRequest).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('notifies again when date changes', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await notifyIfThresholdReached({
      contractId: 'contract-1',
      localDate: '2026-02-20',
      usageSeconds: 800,
      dailyLimitSeconds: 1000,
    });
    await notifyIfThresholdReached({
      contractId: 'contract-1',
      localDate: '2026-02-21',
      usageSeconds: 800,
      dailyLimitSeconds: 1000,
    });

    expect(PushNotificationIOS.addNotificationRequest).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(
      1,
      'usage-warning:contract-1:2026-02-20:80',
    );
    expect(AsyncStorage.getItem).toHaveBeenNthCalledWith(
      2,
      'usage-warning:contract-1:2026-02-21:80',
    );
  });
});
