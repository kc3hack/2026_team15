import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { formatSeconds } from '../lib/mock-store';
import { colors, spacing, borderRadius } from '../lib/theme';

const PENALTY_PER_DAY = 500;
const CONTRACT_DAYS = 7;
const DEPOSIT_TOTAL = PENALTY_PER_DAY * CONTRACT_DAYS;

const LIMIT_OPTIONS = [
  { value: 1800, label: '30分' },
  { value: 2700, label: '45分' },
  { value: 3600, label: '1時間' },
  { value: 5400, label: '1.5時間' },
  { value: 7200, label: '2時間' },
  { value: 10800, label: '3時間' },
  { value: 14400, label: '4時間' },
  { value: 18000, label: '5時間' },
];

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}
      >
        {value}
      </Text>
    </View>
  );
}

export function CreateContractScreen(): React.JSX.Element {
  const { selectedApps, paymentCompleted, createContract, setStep } = useApp();
  const [selectedLimit, setSelectedLimit] = useState(3600);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateContract = async () => {
    setIsCreating(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    createContract(selectedLimit);
    setIsCreating(false);
  };

  const handleProceedToConfirm = () => {
    if (!paymentCompleted) {
      setStep('payment');
    } else {
      setShowConfirm(true);
    }
  };

  const handleBack = () => {
    setStep('payment');
  };

  if (showConfirm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmContent}>
          <View style={styles.confirmIcon}>
            <Text style={styles.confirmIconText}>契</Text>
          </View>

          <View style={styles.confirmText}>
            <Text style={styles.confirmTitle}>契約を確定しますか？</Text>
            <Text style={styles.confirmDescription}>
              一度開始すると、1週間の契約期間中は解除できません。
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <SummaryRow label="日次上限" value={formatSeconds(selectedLimit)} />
            <View style={styles.divider} />
            <SummaryRow
              label="ペナルティ"
              value={`${PENALTY_PER_DAY.toLocaleString()}円/日`}
            />
            <View style={styles.divider} />
            <SummaryRow label="契約期間" value={`${CONTRACT_DAYS}日間`} />
            <View style={styles.divider} />
            <SummaryRow
              label="デポジット"
              value={`${DEPOSIT_TOTAL.toLocaleString()}円`}
              highlight
            />
          </View>

          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateContract}
              disabled={isCreating}
              activeOpacity={0.7}
            >
              {isCreating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.surface} />
                  <Text style={styles.buttonText}>契約を作成中...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>契約を確定する</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonGhost}
              onPress={() => setShowConfirm(false)}
              disabled={isCreating}
            >
              <Text style={styles.buttonGhostText}>戻る</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>契約を作成</Text>
          <Text style={styles.description}>
            1週間の自己制限契約を設定します。
          </Text>
        </View>

        {/* Selected apps summary */}
        <View style={styles.selectedAppsSection}>
          <Text style={styles.sectionLabel}>制限対象アプリ</Text>
          <View style={styles.selectedAppsTags}>
            {selectedApps.map(app => (
              <View key={app.bundleId} style={styles.appTag}>
                <Text style={styles.appTagText}>{app.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily limit selector */}
        <View style={styles.limitSection}>
          <View style={styles.limitHeader}>
            <Text style={styles.sectionLabel}>1日あたりの使用上限</Text>
            <Text style={styles.limitValue}>
              {formatSeconds(selectedLimit)}
            </Text>
          </View>
          <View style={styles.limitOptions}>
            {LIMIT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.limitOption,
                  selectedLimit === option.value && styles.limitOptionSelected,
                ]}
                onPress={() => setSelectedLimit(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.limitOptionText,
                    selectedLimit === option.value &&
                      styles.limitOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contract summary */}
        <View style={styles.contractSummary}>
          <Text style={styles.sectionLabel}>契約内容</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="契約期間" value={`${CONTRACT_DAYS}日間`} />
            <View style={styles.divider} />
            <SummaryRow
              label="超過ペナルティ"
              value={`${PENALTY_PER_DAY.toLocaleString()}円/日`}
            />
            <View style={styles.divider} />
            <SummaryRow
              label="デポジット総額"
              value={`${DEPOSIT_TOTAL.toLocaleString()}円`}
              highlight
            />
          </View>
          <Text style={styles.contractNote}>
            デポジットは仮預かりです。違反がなければ全額返金されます。
          </Text>
        </View>
      </ScrollView>

      {/* Create button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleProceedToConfirm}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {paymentCompleted ? '契約内容を確認する' : '支払い方法を入力する'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  selectedAppsSection: {
    marginBottom: spacing.xl,
  },
  selectedAppsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  appTag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  appTagText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  limitSection: {
    marginBottom: spacing.xl,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  limitValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  limitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  limitOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  limitOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  limitOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  limitOptionTextSelected: {
    color: colors.surface,
  },
  contractSummary: {
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  summaryValueHighlight: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  contractNote: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGhost: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGhostText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Confirmation screen styles
  confirmContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  confirmIconText: {
    fontSize: 32,
    fontWeight: '500',
    color: colors.surface,
  },
  confirmText: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmButtons: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
});
