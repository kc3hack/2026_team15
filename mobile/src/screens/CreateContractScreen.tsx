import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  PanResponder,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
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
  const sliderWidthRef = useRef(0);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const lastSnappedValue = useRef(3600);
  const initialTouchX = useRef(0);
  const initialThumbX = useRef(0);

  const updateLimitFromPosition = (positionX: number) => {
    const width = sliderWidthRef.current;
    if (width <= 0) return;
    // Clamp position to keep thumb within bounds (thumb radius is 14px)
    const thumbRadius = 14;
    const minX = thumbRadius;
    const maxX = width - thumbRadius;
    const clampedX = Math.max(minX, Math.min(maxX, positionX));
    // Adjust ratio calculation for the reduced range
    const ratio = (clampedX - thumbRadius) / (width - thumbRadius * 2);
    const rawLimit =
      MIN_LIMIT_SECONDS + ratio * (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);
    const snappedLimit =
      Math.round(rawLimit / LIMIT_STEP_SECONDS) * LIMIT_STEP_SECONDS;
    const boundedLimit = Math.max(
      MIN_LIMIT_SECONDS,
      Math.min(MAX_LIMIT_SECONDS, snappedLimit),
    );

    // Only update and vibrate when value changes
    if (boundedLimit !== lastSnappedValue.current) {
      lastSnappedValue.current = boundedLimit;
      setSelectedLimit(boundedLimit);
      // iOS native haptic feedback
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: true,
      });
    }

    thumbPosition.setValue(clampedX);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        initialTouchX.current = event.nativeEvent.pageX;
        initialThumbX.current = event.nativeEvent.locationX;
        updateLimitFromPosition(event.nativeEvent.locationX);
      },
      onPanResponderMove: event => {
        // Calculate new position based on movement from initial touch
        const deltaX = event.nativeEvent.pageX - initialTouchX.current;
        const newX = initialThumbX.current + deltaX;
        updateLimitFromPosition(newX);
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const limitRatio =
    (selectedLimit - MIN_LIMIT_SECONDS) /
    (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);

  const handleCreateContract = async () => {
    setIsCreating(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    await createContract(selectedLimit);
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

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && sliderWidthRef.current !== width) {
      sliderWidthRef.current = width;
      // Calculate initial thumb position based on selectedLimit
      const thumbRadius = 14;
      const ratio =
        (selectedLimit - MIN_LIMIT_SECONDS) /
        (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);
      const initialX = thumbRadius + ratio * (width - thumbRadius * 2);
      thumbPosition.setValue(initialX);
    }
  };

  if (showConfirm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmContent}>
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
            style={styles.sliderContainer}
            onLayout={handleSliderLayout}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderTrack} pointerEvents="none">
              <View
                style={[
                  styles.sliderProgress,
                  { width: `${limitRatio * 100}%` },
                ]}
              />
            </View>
            <Animated.View
              style={[
                styles.sliderThumb,
                {
                  transform: [{ translateX: thumbPosition }],
                },
              ]}
              pointerEvents="none"
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
    alignItems: 'center',
  },
  selectedAppsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
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
    marginBottom: spacing.md,
  },
  limitValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  sliderContainer: {
    height: 64,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: -14,
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
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  summaryValueHighlight: {
    fontWeight: '600',
    color: colors.primary,
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
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
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
