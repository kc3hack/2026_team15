import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { formatSeconds } from '../lib/mock-store';
import { colors, spacing, borderRadius } from '../lib/theme';

const CONTRACT_DAYS = 7;
const MIN_LIMIT_SECONDS = 1800;
const MAX_LIMIT_SECONDS = 18000;
const LIMIT_STEP_SECONDS = 300;
const MIN_PENALTY_PER_DAY = 500;
const MAX_PENALTY_PER_DAY = 2000;
const PENALTY_STEP = 100;

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
  const {
    selectedApps,
    setPendingContractData,
    setPendingPaymentMethodId,
    setPaymentCompleted,
    paymentCompleted,
    setStep,
  } = useApp();
  const [selectedLimit, setSelectedLimit] = useState(3600);
  const [selectedPenaltyPerDay, setSelectedPenaltyPerDay] =
    useState(MIN_PENALTY_PER_DAY);
  const limitSliderWidthRef = useRef(0);
  const limitThumbPosition = useRef(new Animated.Value(0)).current;
  const lastSnappedLimit = useRef(3600);
  const limitInitialTouchX = useRef(0);
  const limitInitialThumbX = useRef(0);
  const penaltySliderWidthRef = useRef(0);
  const penaltyThumbPosition = useRef(new Animated.Value(0)).current;
  const lastSnappedPenalty = useRef(MIN_PENALTY_PER_DAY);
  const penaltyInitialTouchX = useRef(0);
  const penaltyInitialThumbX = useRef(0);

  const limitRatio =
    (selectedLimit - MIN_LIMIT_SECONDS) /
    (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);
  const penaltyRatio =
    (selectedPenaltyPerDay - MIN_PENALTY_PER_DAY) /
    (MAX_PENALTY_PER_DAY - MIN_PENALTY_PER_DAY);
  const depositTotal = selectedPenaltyPerDay * CONTRACT_DAYS;

  const invalidatePaymentSelection = () => {
    if (paymentCompleted) {
      setPaymentCompleted(false);
      setPendingPaymentMethodId(null);
    }
  };

  const updateLimitFromPosition = (positionX: number) => {
    const width = limitSliderWidthRef.current;
    if (width <= 0) return;

    const thumbRadius = 14;
    const minX = thumbRadius;
    const maxX = width - thumbRadius;
    const clampedX = Math.max(minX, Math.min(maxX, positionX));
    const ratio = (clampedX - thumbRadius) / (width - thumbRadius * 2);
    const rawLimit =
      MIN_LIMIT_SECONDS + ratio * (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);
    const snappedLimit =
      Math.round(rawLimit / LIMIT_STEP_SECONDS) * LIMIT_STEP_SECONDS;
    const boundedLimit = Math.max(
      MIN_LIMIT_SECONDS,
      Math.min(MAX_LIMIT_SECONDS, snappedLimit),
    );

    if (boundedLimit !== lastSnappedLimit.current) {
      lastSnappedLimit.current = boundedLimit;
      setSelectedLimit(boundedLimit);
      invalidatePaymentSelection();
    }

    limitThumbPosition.setValue(clampedX);
  };

  const updatePenaltyFromPosition = (positionX: number) => {
    const width = penaltySliderWidthRef.current;
    if (width <= 0) return;

    const thumbRadius = 14;
    const minX = thumbRadius;
    const maxX = width - thumbRadius;
    const clampedX = Math.max(minX, Math.min(maxX, positionX));
    const ratio = (clampedX - thumbRadius) / (width - thumbRadius * 2);
    const rawPenalty =
      MIN_PENALTY_PER_DAY + ratio * (MAX_PENALTY_PER_DAY - MIN_PENALTY_PER_DAY);
    const snappedPenalty = Math.round(rawPenalty / PENALTY_STEP) * PENALTY_STEP;
    const boundedPenalty = Math.max(
      MIN_PENALTY_PER_DAY,
      Math.min(MAX_PENALTY_PER_DAY, snappedPenalty),
    );

    if (boundedPenalty !== lastSnappedPenalty.current) {
      lastSnappedPenalty.current = boundedPenalty;
      setSelectedPenaltyPerDay(boundedPenalty);
      invalidatePaymentSelection();
    }

    penaltyThumbPosition.setValue(clampedX);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        limitInitialTouchX.current = event.nativeEvent.pageX;
        limitInitialThumbX.current = event.nativeEvent.locationX;
        updateLimitFromPosition(event.nativeEvent.locationX);
      },
      onPanResponderMove: event => {
        const deltaX = event.nativeEvent.pageX - limitInitialTouchX.current;
        const newX = limitInitialThumbX.current + deltaX;
        updateLimitFromPosition(newX);
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const penaltyPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        penaltyInitialTouchX.current = event.nativeEvent.pageX;
        penaltyInitialThumbX.current = event.nativeEvent.locationX;
        updatePenaltyFromPosition(event.nativeEvent.locationX);
      },
      onPanResponderMove: event => {
        const deltaX = event.nativeEvent.pageX - penaltyInitialTouchX.current;
        const newX = penaltyInitialThumbX.current + deltaX;
        updatePenaltyFromPosition(newX);
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const handleLimitSliderLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && limitSliderWidthRef.current !== width) {
      limitSliderWidthRef.current = width;
      const thumbRadius = 14;
      const ratio =
        (selectedLimit - MIN_LIMIT_SECONDS) /
        (MAX_LIMIT_SECONDS - MIN_LIMIT_SECONDS);
      const initialX = thumbRadius + ratio * (width - thumbRadius * 2);
      limitThumbPosition.setValue(initialX);
    }
  };

  const handlePenaltySliderLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && penaltySliderWidthRef.current !== width) {
      penaltySliderWidthRef.current = width;
      const thumbRadius = 14;
      const ratio =
        (selectedPenaltyPerDay - MIN_PENALTY_PER_DAY) /
        (MAX_PENALTY_PER_DAY - MIN_PENALTY_PER_DAY);
      const initialX = thumbRadius + ratio * (width - thumbRadius * 2);
      penaltyThumbPosition.setValue(initialX);
    }
  };

  const handleProceedToPayment = () => {
    setPendingContractData({
      dailyLimitSeconds: selectedLimit,
      penaltyPerDay: selectedPenaltyPerDay,
      depositTotal,
    });
    setStep('payment');
  };

  const handleBack = () => {
    setStep('pick-apps');
  };

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
            onLayout={handleLimitSliderLayout}
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
                  transform: [{ translateX: limitThumbPosition }],
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

        <View style={styles.penaltySection}>
          <View style={styles.limitHeader}>
            <Text style={styles.sectionLabel}>1日あたりのペナルティ</Text>
            <Text style={styles.limitValue}>
              {selectedPenaltyPerDay.toLocaleString()}円
            </Text>
          </View>
          <View
            style={styles.sliderContainer}
            onLayout={handlePenaltySliderLayout}
            {...penaltyPanResponder.panHandlers}
          >
            <View style={styles.sliderTrack} pointerEvents="none">
              <View
                style={[
                  styles.sliderProgress,
                  { width: `${penaltyRatio * 100}%` },
                ]}
              />
            </View>
            <Animated.View
              style={[
                styles.sliderThumb,
                {
                  transform: [{ translateX: penaltyThumbPosition }],
                },
              ]}
              pointerEvents="none"
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {MIN_PENALTY_PER_DAY.toLocaleString()}円
            </Text>
            <Text style={styles.sliderStepText}>100円刻みで調整</Text>
            <Text style={styles.sliderLabel}>
              {MAX_PENALTY_PER_DAY.toLocaleString()}円
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
              value={`${selectedPenaltyPerDay.toLocaleString()}円/日`}
            />
            <View style={styles.divider} />
            <SummaryRow
              label="デポジット総額"
              value={`${depositTotal.toLocaleString()}円`}
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
          onPress={handleProceedToPayment}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>支払い方法の入力へ進む</Text>
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
    marginBottom: spacing.xxl,
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
  selectedAppsSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  selectedAppsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  appTag: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appTagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  limitSection: {
    marginBottom: spacing.xl,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  limitValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sliderContainer: {
    position: 'relative',
    justifyContent: 'center',
    height: 28,
    marginBottom: spacing.sm,
  },
  sliderTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
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
    color: colors.textLight,
  },
  penaltySection: {
    marginBottom: spacing.xl,
  },
  contractSummary: {
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  summaryValueHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  contractNote: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textMuted,
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
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
});
