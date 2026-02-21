import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

const WARNING_THRESHOLDS = [0.5, 0.8] as const;
const STORAGE_PREFIX = 'usage-warning';

type NotifyIfThresholdReachedParams = {
  contractId: string;
  localDate: string;
  usageSeconds: number;
  dailyLimitSeconds: number;
};

function buildDedupeKey(
  contractId: string,
  localDate: string,
  threshold: number,
): string {
  const thresholdPercent = Math.round(threshold * 100);
  return `${STORAGE_PREFIX}:${contractId}:${localDate}:${thresholdPercent}`;
}

function buildNotificationId(contractId: string, threshold: number): string {
  const thresholdPercent = Math.round(threshold * 100);
  return `${contractId}-${thresholdPercent}-${Date.now()}`;
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const result = await PushNotificationIOS.requestPermissions({
    alert: true,
    badge: false,
    sound: true,
  });
  return Boolean(result.alert || result.sound || result.badge);
}

export async function notifyIfThresholdReached({
  contractId,
  localDate,
  usageSeconds,
  dailyLimitSeconds,
}: NotifyIfThresholdReachedParams): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }
  if (dailyLimitSeconds <= 0) {
    return;
  }

  const usageRatio = usageSeconds / dailyLimitSeconds;
  const reachedThreshold = [...WARNING_THRESHOLDS]
    .reverse()
    .find(threshold => usageRatio >= threshold);
  if (!reachedThreshold) {
    return;
  }

  const dedupeKey = buildDedupeKey(contractId, localDate, reachedThreshold);
  const alreadyNotified = await AsyncStorage.getItem(dedupeKey);
  if (alreadyNotified) {
    return;
  }

  const thresholdPercent = Math.round(reachedThreshold * 100);
  PushNotificationIOS.addNotificationRequest({
    id: buildNotificationId(contractId, reachedThreshold),
    title: '利用時間の上限が近づいています',
    body: `今日の利用時間が${thresholdPercent}%に到達しました。`,
    threadId: `usage-warning-${contractId}`,
    userInfo: {
      contractId,
      localDate,
      thresholdPercent,
    },
  });
  await AsyncStorage.setItem(dedupeKey, new Date().toISOString());
}
