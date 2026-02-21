import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native';
import { useApp } from '../lib/app-context';
import { formatSeconds } from '../lib/mock-store';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';
import { colors, spacing, borderRadius } from '../lib/theme';

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

export function ConfirmContractScreen(): React.JSX.Element {
  const {
    pendingContractData,
    pendingPaymentMethodId,
    selectedApps,
    createContract,
    setStep,
  } = useApp();
  const { confirmPayment } = useStripe();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    setStep('payment');
  };

  const handleConfirm = async () => {
    if (!pendingContractData) {
      setError('契約内容が見つかりません。最初から設定してください。');
      return;
    }
    if (!pendingPaymentMethodId) {
      setError('支払い方法が未設定です。カード情報を入力してください。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('ログインが必要です');
        console.error('[ConfirmContract] Missing access token in session');
        return;
      }

      const paymentIntentResponse = await fetch(
        `${env.supabaseUrl}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: env.supabaseAnonKey,
          },
          body: JSON.stringify({
            amount: pendingContractData.depositTotal,
            currency: 'jpy',
          }),
        },
      );

      if (!paymentIntentResponse.ok) {
        let errorData: Record<string, unknown> | null = null;
        try {
          errorData = (await paymentIntentResponse.json()) as Record<
            string,
            unknown
          >;
        } catch {
          errorData = null;
        }

        const details =
          (typeof errorData?.error === 'string' && errorData.error) ||
          (typeof errorData?.message === 'string' && errorData.message) ||
          (typeof errorData?.code === 'string' && errorData.code) ||
          paymentIntentResponse.statusText;

        console.error('[ConfirmContract] create-payment-intent failed', {
          status: paymentIntentResponse.status,
          details,
          errorData,
        });
        setError(
          details
            ? `決済の準備に失敗しました: ${details}`
            : '決済の準備に失敗しました',
        );
        return;
      }

      const { clientSecret } = await paymentIntentResponse.json();

      const { error: confirmError } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          paymentMethodId: pendingPaymentMethodId,
        },
      });

      if (confirmError) {
        setError(confirmError.message ?? '決済エラーが発生しました');
        return;
      }

      const created = await createContract(
        pendingContractData.dailyLimitSeconds,
        pendingContractData.penaltyPerDay,
      );

      if (!created) {
        setError(
          '決済は成功しましたが契約作成に失敗しました。管理者に連絡してください。',
        );
      }
    } catch (e) {
      setError('処理中にエラーが発生しました');
      console.error('[ConfirmContract] Error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pendingContractData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>契約内容が未設定です</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep('create-contract')}
          >
            <Text style={styles.buttonText}>契約内容の設定へ戻る</Text>
          </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isSubmitting}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>契約内容の確認</Text>
          <Text style={styles.description}>
            内容と支払い金額を確認し、契約を確定してください。
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
            value={formatSeconds(pendingContractData.dailyLimitSeconds)}
          />
          <View style={styles.divider} />
          <SummaryRow
            label="ペナルティ"
            value={`${pendingContractData.penaltyPerDay.toLocaleString()}円/日`}
          />
          <View style={styles.divider} />
          <SummaryRow label="契約期間" value="7日間" />
          <View style={styles.divider} />
          <SummaryRow
            label="デポジット"
            value={`${pendingContractData.depositTotal.toLocaleString()}円`}
            highlight
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.surface} />
              <Text style={styles.buttonText}>決済と契約作成中...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>契約を確定する</Text>
          )}
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
  errorContainer: {
    marginTop: spacing.lg,
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
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
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.text,
  },
});
