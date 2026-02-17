import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

type ContractStatus = 'active' | 'completed';

// Mock data
const CONTRACT_DATA = {
  daysRemaining: 4,
  totalDays: 7,
  dailyLimitMinutes: 60,
  violationCount: 2,
  balance: 2500,
  depositTotal: 3500,
  penaltyPerDay: 500,
  selectedAppsCount: 5,
  todayUsedMinutes: 45,
};

export function DashboardScreen({ navigation }: Props): React.JSX.Element {
  const [status, setStatus] = useState<ContractStatus>('active');
  const [todayViolated, setTodayViolated] = useState(false);

  const handleNewContract = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleSimulateViolation = () => {
    setTodayViolated(true);
  };

  const progressPercent =
    ((CONTRACT_DATA.totalDays - CONTRACT_DATA.daysRemaining) /
      CONTRACT_DATA.totalDays) *
    100;
  const usagePercent =
    (CONTRACT_DATA.todayUsedMinutes / CONTRACT_DATA.dailyLimitMinutes) * 100;
  const successRate = Math.round(
    ((CONTRACT_DATA.totalDays - CONTRACT_DATA.violationCount) /
      CONTRACT_DATA.totalDays) *
      100,
  );

  if (status === 'active') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ダッシュボード</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>契約実行中</Text>
            </View>
          </View>

          {/* Contract Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}></Text>
              <Text style={styles.cardTitle}>契約情報</Text>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>契約進捗</Text>
                <Text style={styles.progressValue}>
                  残り{CONTRACT_DATA.daysRemaining}日
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progressPercent}%` }]}
                />
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>日次上限</Text>
                <Text style={styles.statValue}>
                  {CONTRACT_DATA.dailyLimitMinutes}分
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>制限アプリ</Text>
                <Text style={styles.statValue}>
                  {CONTRACT_DATA.selectedAppsCount}個
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIconClock}></Text>
              <Text style={styles.cardTitle}>今日の状態</Text>
            </View>

            {!todayViolated ? (
              <>
                <View style={styles.successAlert}>
                  <Text style={styles.successIcon}></Text>
                  <View style={styles.alertContent}>
                    <Text style={styles.successTitle}>順調です！</Text>
                    <Text style={styles.successDescription}>
                      今日はまだ上限を超過していません
                    </Text>
                  </View>
                </View>

                <View style={styles.usageSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>今日の使用時間</Text>
                    <Text style={styles.progressValue}>
                      {CONTRACT_DATA.todayUsedMinutes} /{' '}
                      {CONTRACT_DATA.dailyLimitMinutes}分
                    </Text>
                  </View>
                  <View style={styles.usageBar}>
                    <View
                      style={[
                        styles.usageFill,
                        { width: `${usagePercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.usageRemain}>
                    残り{' '}
                    {CONTRACT_DATA.dailyLimitMinutes -
                      CONTRACT_DATA.todayUsedMinutes}
                    分
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.errorAlert}>
                <Text style={styles.errorIcon}></Text>
                <View style={styles.alertContent}>
                  <Text style={styles.errorTitle}>上限超過</Text>
                  <Text style={styles.errorDescription}>
                    今日は既に上限を超過しました（
                    {`\¥${CONTRACT_DATA.penaltyPerDay}`}のペナルティ）
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Weekly Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIconTrending}></Text>
              <Text style={styles.cardTitle}>今週のサマリー</Text>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItemRed}>
                <Text style={styles.summaryLabel}>失敗日数</Text>
                <Text style={styles.summaryValueRed}>
                  {CONTRACT_DATA.violationCount}日
                </Text>
              </View>
              <View style={styles.summaryItemBlue}>
                <Text style={styles.summaryLabel}>現在の残高</Text>
                <Text style={styles.summaryValueBlue}>
                  {`\¥${CONTRACT_DATA.balance.toLocaleString()}`}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>デポジット総額</Text>
              <Text style={styles.summaryRowValue}>
                {`\¥${CONTRACT_DATA.depositTotal.toLocaleString()}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>累計ペナルティ</Text>
              <Text style={styles.summaryRowValueRed}>
                {`-\¥${(
                  CONTRACT_DATA.violationCount * CONTRACT_DATA.penaltyPerDay
                ).toLocaleString()}`}
              </Text>
            </View>
          </View>

          {/* Debug Buttons */}
          <View style={styles.debugButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.outlineButton,
                todayViolated && styles.outlineButtonDisabled,
                pressed && !todayViolated && styles.outlineButtonPressed,
              ]}
              onPress={handleSimulateViolation}
              disabled={todayViolated}
            >
              <Text style={styles.outlineButtonText}>違反をシミュレート</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.outlineButton,
                pressed && styles.outlineButtonPressed,
              ]}
              onPress={() => setStatus('completed')}
            >
              <Text style={styles.outlineButtonText}>契約完了を表示</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Completed State
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Completed Header */}
        <View style={styles.completedHeader}>
          <View style={styles.completedIconCircle}>
            <Text style={styles.completedIcon}></Text>
          </View>
          <Text style={styles.completedTitle}>契約完了</Text>
          <Text style={styles.completedSubtitle}>
            1週間の契約が終了しました
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitleLarge}>最終結果</Text>

          {/* Success Rate */}
          <View style={styles.successRateCard}>
            <Text style={styles.successRateLabel}>成功率</Text>
            <Text style={styles.successRateValue}>{successRate}%</Text>
            <Text style={styles.successRateDetail}>
              {CONTRACT_DATA.totalDays - CONTRACT_DATA.violationCount}日/
              {CONTRACT_DATA.totalDays}日 達成
            </Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItemRed}>
              <Text style={styles.detailLabel}>失敗日数</Text>
              <Text style={styles.detailValueRed}>
                {CONTRACT_DATA.violationCount}日
              </Text>
            </View>
            <View style={styles.detailItemAmber}>
              <Text style={styles.detailLabel}>総ペナルティ</Text>
              <Text style={styles.detailValueAmber}>
                {`\¥${(
                  CONTRACT_DATA.violationCount * CONTRACT_DATA.penaltyPerDay
                ).toLocaleString()}`}
              </Text>
            </View>
          </View>

          {/* Final Balance */}
          <View style={styles.finalBalanceCard}>
            <Text style={styles.finalBalanceLabel}>最終残高</Text>
            <Text style={styles.finalBalanceValue}>
              {`\¥${CONTRACT_DATA.balance.toLocaleString()}`}
            </Text>
            <Text style={styles.finalBalanceDetail}>
              デポジット {`\¥${CONTRACT_DATA.depositTotal.toLocaleString()}`}{' '}
              から返金
            </Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {CONTRACT_DATA.violationCount <= 2
              ? '素晴らしい結果です！余白を保つことができました。'
              : '次回はもっと余白を作れるよう、頑張りましょう。'}
          </Text>
        </View>

        {/* New Contract Button */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={handleNewContract}
        >
          <Text style={styles.primaryButtonText}>新しい契約を開始</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardIconClock: {
    fontSize: 22,
  },
  cardIconTrending: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
    gap: 12,
  },
  successIcon: {
    fontSize: 22,
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
  },
  successDescription: {
    fontSize: 14,
    color: '#15803D',
  },
  usageSection: {
    gap: 8,
  },
  usageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  usageRemain: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 12,
  },
  errorIcon: {
    fontSize: 22,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991B1B',
  },
  errorDescription: {
    fontSize: 14,
    color: '#B91C1C',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryItemRed: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  summaryItemBlue: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValueRed: {
    fontSize: 28,
    fontWeight: '700',
    color: '#DC2626',
  },
  summaryValueBlue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryRowValueRed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  debugButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  outlineButtonPressed: {
    backgroundColor: '#F9FAFB',
  },
  outlineButtonDisabled: {
    opacity: 0.5,
  },
  outlineButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  // Completed State Styles
  completedHeader: {
    alignItems: 'center',
    gap: 12,
  },
  completedIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 48,
  },
  completedTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#4B5563',
  },
  successRateCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  successRateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  successRateValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 8,
  },
  successRateDetail: {
    fontSize: 14,
    color: '#374151',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailItemRed: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  detailItemAmber: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValueRed: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
  },
  detailValueAmber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D97706',
  },
  finalBalanceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  finalBalanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  finalBalanceValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 8,
  },
  finalBalanceDetail: {
    fontSize: 14,
    color: '#374151',
  },
  messageCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
