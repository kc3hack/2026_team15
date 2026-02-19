import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { mockStore, formatSeconds } from '../lib/mock-store';
import { colors, spacing, borderRadius } from '../lib/theme';
import type { Contract } from '../types/domain';

function InfoCell({
  label,
  value,
  highlight = false,
  danger = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          danger && styles.infoValueDanger,
          highlight && styles.infoValueHighlight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SimButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.simButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.simButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActiveDashboard({
  contract,
  simulateUsage,
  triggerViolation,
  resetDailyShield,
  advanceMockDay,
  logout,
}: {
  contract: Contract;
  simulateUsage: (bundleId: string, seconds: number) => void;
  triggerViolation: () => boolean;
  resetDailyShield: () => void;
  advanceMockDay: () => void;
  logout: () => void;
}) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const daysRemaining = mockStore.getDaysRemaining();
  const todayUsage = mockStore.getTodayTotalUsage();
  const todayViolation = mockStore.getTodayViolation(contract.id);
  const violationDays = mockStore.getViolationDaysCount(contract.id);
  const balance = mockStore.getContractBalance(contract.id);
  const totalPenalty = mockStore.getTotalPenalty(contract.id);
  const isShielded = mockStore.isShieldActive();
  const mockLocalDate = mockStore.getMockLocalDate();
  const usagePercent = Math.min(
    100,
    (todayUsage / contract.dailyLimitSeconds) * 100,
  );
  const remainingSeconds = Math.max(0, contract.dailyLimitSeconds - todayUsage);

  const handleSimulateUsage = useCallback(
    (minutes: number) => {
      if (contract.selectedApps.length > 0) {
        const randomApp =
          contract.selectedApps[
            Math.floor(Math.random() * contract.selectedApps.length)
          ];
        simulateUsage(randomApp.bundleId, minutes * 60);

        const newUsage = mockStore.getTodayTotalUsage();
        if (newUsage >= contract.dailyLimitSeconds && !todayViolation) {
          triggerViolation();
        }
      }
    },
    [contract, simulateUsage, todayViolation, triggerViolation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>ヨハク</Text>
            <Text style={styles.headerSubtitle}>契約中</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>

        {/* Shield alert */}
        {isShielded && (
          <View style={styles.shieldAlert}>
            <Text style={styles.shieldTitle}>制限中</Text>
            <Text style={styles.shieldText}>
              本日は上限を超過しました。対象アプリはロックされています。
            </Text>
          </View>
        )}

        {/* Contract info card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>契約情報</Text>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>残り {daysRemaining}日</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoCell
              label="日次上限"
              value={formatSeconds(contract.dailyLimitSeconds)}
            />
            <InfoCell
              label="対象アプリ"
              value={`${contract.selectedApps.length}個`}
            />
          </View>

          <View style={styles.appTags}>
            {contract.selectedApps.map(app => (
              <View key={app.bundleId} style={styles.appTag}>
                <Text style={styles.appTagText}>{app.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>今日</Text>
            {todayViolation ? (
              <View style={styles.statusBadgeDanger}>
                <Text style={styles.statusBadgeDangerText}>違反</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeSuccess}>
                <Text style={styles.statusBadgeSuccessText}>順調</Text>
              </View>
            )}
          </View>

          <View style={styles.usageSection}>
            <View style={styles.usageLabels}>
              <Text style={styles.usageLabelText}>
                使用: {formatSeconds(todayUsage)}
              </Text>
              <Text style={styles.usageLabelText}>
                上限: {formatSeconds(contract.dailyLimitSeconds)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  usagePercent >= 100 && styles.progressFillDanger,
                  { width: `${usagePercent}%` },
                ]}
              />
            </View>
          </View>

          {!todayViolation && (
            <View style={styles.remainingTime}>
              <Text style={styles.remainingLabel}>残り</Text>
              <Text style={styles.remainingValue}>
                {formatSeconds(remainingSeconds)}
              </Text>
            </View>
          )}
        </View>

        {/* Weekly section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>今週</Text>

          <View style={styles.infoGrid}>
            <InfoCell
              label="違反日数"
              value={`${violationDays}日`}
              danger={violationDays > 0}
            />
            <InfoCell
              label="残高"
              value={`${balance.toLocaleString()}円`}
              highlight
            />
          </View>
          <View style={styles.penaltyRow}>
            <Text style={styles.penaltyLabel}>支払額</Text>
            <Text
              style={[
                styles.penaltyValue,
                totalPenalty > 0
                  ? styles.penaltyValueDanger
                  : styles.penaltyValueNormal,
              ]}
            >
              {`${totalPenalty.toLocaleString()}円`}
            </Text>
          </View>
        </View>

        {/* Mock simulator */}
        <View style={styles.simulatorSection}>
          <TouchableOpacity
            style={styles.simulatorToggle}
            onPress={() => setShowSimulator(v => !v)}
          >
            <Text style={styles.simulatorToggleText}>
              {showSimulator
                ? 'シミュレーターを閉じる'
                : 'シミュレーターを開く'}
            </Text>
          </TouchableOpacity>

          {showSimulator && (
            <View style={styles.simulatorCard}>
              <Text style={styles.simulatorTitle}>
                MVP: 使用時間をシミュレート
              </Text>
              <View style={styles.simButtons}>
                <SimButton
                  label="+15分"
                  onPress={() => handleSimulateUsage(15)}
                />
                <SimButton
                  label="+30分"
                  onPress={() => handleSimulateUsage(30)}
                />
                <SimButton
                  label="+60分"
                  onPress={() => handleSimulateUsage(60)}
                />
              </View>
              <View style={styles.dayProgressSection}>
                <Text style={styles.dayProgressLabel}>
                  シミュレーション日付: {mockLocalDate}
                </Text>
                <TouchableOpacity
                  style={styles.dayAdvanceButton}
                  onPress={advanceMockDay}
                >
                  <Text style={styles.dayAdvanceText}>次の日へ進める</Text>
                </TouchableOpacity>
              </View>
              {isShielded && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetDailyShield}
                >
                  <Text style={styles.resetText}>日次リセット</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CompletedDashboard({
  contract,
  onNewContract,
  logout,
}: {
  contract: Contract;
  onNewContract: () => void;
  logout: () => void;
}) {
  const violationDays = mockStore.getViolationDaysCount(contract.id);
  const totalPenalty = mockStore.getTotalPenalty(contract.id);
  const finalBalance = mockStore.getContractBalance(contract.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.completedContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>ヨハク</Text>
            <Text style={styles.headerSubtitle}>契約完了</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>

        {/* Completion badge */}
        <View style={styles.completionCard}>
          <View style={styles.completionIcon}>
            <Text style={styles.completionIconText}>完</Text>
          </View>
          <Text style={styles.completionTitle}>契約が完了しました</Text>
          <Text style={styles.completionSubtitle}>
            1週間の取り組み、お疲れさまでした。
          </Text>
        </View>

        {/* Results */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>結果サマリー</Text>
          <View style={styles.infoGrid}>
            <InfoCell
              label="違反日数"
              value={`${violationDays}日 / 7日`}
              danger={violationDays > 0}
            />
            <InfoCell label="成功日数" value={`${7 - violationDays}日 / 7日`} />
          </View>
          <View style={styles.divider} />
          <View style={styles.infoGrid}>
            <InfoCell
              label="総ペナルティ"
              value={`-${totalPenalty.toLocaleString()}円`}
              danger={totalPenalty > 0}
            />
            <InfoCell
              label="最終残高"
              value={`${finalBalance.toLocaleString()}円`}
              highlight
            />
          </View>
          <Text style={styles.resultNote}>
            MVP: 実際の返金処理は行われません
          </Text>
        </View>

        {/* New contract */}
        <TouchableOpacity
          style={styles.button}
          onPress={onNewContract}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>新しい契約を開始する</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function DashboardScreen(): React.JSX.Element {
  const {
    activeContract,
    refreshContract,
    simulateUsage,
    triggerViolation,
    resetDailyShield,
    advanceMockDay,
    logout,
    setStep,
  } = useApp();

  const [, setTick] = useState(0);

  useEffect(() => {
    refreshContract();
    const interval = setInterval(() => {
      refreshContract();
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [refreshContract]);

  const contract = activeContract || mockStore.getLatestContract();

  if (!contract) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>契約が見つかりません</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep('pick-apps')}
          >
            <Text style={styles.buttonText}>新しい契約を作成</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = contract.status === 'active';

  if (isActive) {
    return (
      <ActiveDashboard
        contract={contract}
        simulateUsage={simulateUsage}
        triggerViolation={triggerViolation}
        resetDailyShield={resetDailyShield}
        advanceMockDay={advanceMockDay}
        logout={logout}
      />
    );
  }

  return (
    <CompletedDashboard
      contract={contract}
      onNewContract={() => setStep('pick-apps')}
      logout={logout}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 48,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  logoutText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Shield alert
  shieldAlert: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  shieldTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  shieldText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  daysBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  daysBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  // Info grid
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoCell: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  infoValueDanger: {
    color: colors.danger,
  },
  infoValueHighlight: {
    fontWeight: '600',
  },
  // App tags
  appTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  appTag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  appTagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Status badges
  statusBadgeSuccess: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeSuccessText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
  },
  statusBadgeDanger: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeDangerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.danger,
  },
  // Progress bar
  usageSection: {
    gap: spacing.sm,
  },
  usageLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageLabelText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressFillDanger: {
    backgroundColor: colors.danger,
  },
  // Remaining time
  remainingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  remainingLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  remainingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  // Simulator
  simulatorSection: {
    gap: spacing.xs,
  },
  simulatorToggle: {
    paddingVertical: spacing.sm,
  },
  simulatorToggleText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  simulatorCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.md,
  },
  simulatorTitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  simButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  simButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  simButtonText: {
    fontSize: 13,
    color: colors.text,
  },
  penaltyRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  penaltyLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  penaltyValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  penaltyValueNormal: {
    color: colors.textSecondary,
  },
  penaltyValueDanger: {
    color: colors.danger,
  },
  dayProgressSection: {
    gap: spacing.sm,
  },
  dayProgressLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dayAdvanceButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayAdvanceText: {
    fontSize: 13,
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    fontSize: 13,
    color: colors.text,
  },
  // Completed dashboard
  completedContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
  },
  completionIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionIconText: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.surface,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  completionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  resultNote: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  // Empty state
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  // Button
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
});
