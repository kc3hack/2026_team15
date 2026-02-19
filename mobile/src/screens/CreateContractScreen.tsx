import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { formatSeconds } from '../lib/mock-store';
import { colors, spacing, borderRadius } from '../lib/theme';

const PENALTY_PER_DAY = 500;
const CONTRACT_DAYS = 7;
const DEPOSIT_TOTAL = PENALTY_PER_DAY * CONTRACT_DAYS;
const MIN_LIMIT_SECONDS = 1800;
const MAX_LIMIT_SECONDS = 18000;
const LIMIT_STEP_SECONDS = 300;

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
  const [sliderWidth, setSliderWidth] = useState(0);

  const limitRatio =
    (selectedLimit - MIN_LIMIT_SECONDS) /
    (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);

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

  const updateLimitBySliderPosition = (positionX: number) => {
    if (sliderWidth <= 0) return;
    const clampedX = Math.max(0, Math.min(sliderWidth, positionX));
    const ratio = clampedX / sliderWidth;
    const rawLimit =
      MIN_LIMIT_SECONDS + ratio * (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);
    const snappedLimit =
      Math.round(rawLimit / LIMIT_STEP_SECONDS) * LIMIT_STEP_SECONDS;
    const boundedLimit = Math.max(
      MIN_LIMIT_SECONDS,
      Math.min(MAX_LIMIT_SECONDS, snappedLimit),
    );
    setSelectedLimit(boundedLimit);
  };

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  if (showConfirm) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.confirmScrollContent}
        >
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

            <View style={styles.summaryCard}>
              <SummaryRow
                label="日次上限"
                value={formatSeconds(selectedLimit)}
              />
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>契約を作成</Text>
          <Text style={styles.description}>
            1週間の自己制限契約を設定します。
          </Text>
        </View>

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

        <View style={styles.limitSection}>
          <View style={styles.limitHeader}>
            <Text style={styles.sectionLabel}>1日あたりの使用上限</Text>
            <Text style={styles.limitValue}>
              {formatSeconds(selectedLimit)}
            </Text>
          </View>
          <View
            style={styles.sliderTrack}
            onLayout={handleSliderLayout}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={event =>
              updateLimitBySliderPosition(event.nativeEvent.locationX)
            }
            onResponderMove={event =>
              updateLimitBySliderPosition(event.nativeEvent.locationX)
            }
          >
            <View
              style={[styles.sliderProgress, { width: `${limitRatio * 100}%` }]}
            />
            <View
              style={[styles.sliderThumb, { left: `${limitRatio * 100}%` }]}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {formatSeconds(MIN_LIMIT_SECONDS)}
            </Text>
            <Text style={styles.sliderStepText}>5分刻みで調整</Text>
            <Text style={styles.sliderLabel}>
              {formatSeconds(MAX_LIMIT_SECONDS)}
            </Text>
          </View>
        </View>

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
    paddingBottom: spacing.xxl,
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
    width: '100%',
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
    borderWidth: 1,
    borderColor: colors.border,
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
  sliderTrack: {
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    marginLeft: -12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sliderStepText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    width: '100%',
  },
  buttonGhost: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
  confirmContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  confirmScrollContent: {
    paddingBottom: spacing.xl,
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  confirmIconText: {
    fontSize: 32,
    fontWeight: '500',
    color: colors.surface,
  },
  confirmText: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    marginTop: spacing.lg,
  },
});
