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
import {
  CardField,
  useStripe,
  CardFieldInput,
} from '@stripe/stripe-react-native';
import { useApp } from '../lib/app-context';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';
import { colors, spacing, borderRadius } from '../lib/theme';

const PENALTY_PER_DAY = 500;
const CONTRACT_DAYS = 7;
const DEPOSIT_TOTAL = PENALTY_PER_DAY * CONTRACT_DAYS;

export function PaymentScreen(): React.JSX.Element {
  const { setPaymentCompleted, setStep } = useApp();
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCardComplete = cardDetails?.complete ?? false;

  const handleSubmit = async () => {
    if (!isCardComplete) {
      setError('カード情報を正しく入力してください');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get the current session for auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError('ログインが必要です');
        return;
      }

      // Call backend to create PaymentIntent
      const response = await fetch(
        `${env.supabaseUrl}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            amount: DEPOSIT_TOTAL,
            currency: 'jpy',
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Payment] Backend error:', errorData);
        setError(errorData.error || '決済の準備に失敗しました');
        return;
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await confirmPayment(
        clientSecret,
        { paymentMethodType: 'Card' },
      );

      if (confirmError) {
        console.error('[Payment] Stripe error:', confirmError);
        setError(confirmError.message ?? '決済エラーが発生しました');
        return;
      }

      console.log('[Payment] Success:', {
        id: paymentIntent?.id,
        amount: paymentIntent?.amount,
        status: paymentIntent?.status,
      });

      setPaymentCompleted(true);
      setStep('create-contract');
    } catch (e) {
      setError('決済処理中にエラーが発生しました');
      console.error('[Payment] Error:', e);
    } finally {
      setIsProcessing(false);
    }
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
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isProcessing}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>支払い方法</Text>
          <Text style={styles.description}>
            デポジット{' '}
            <Text style={styles.highlight}>
              {DEPOSIT_TOTAL.toLocaleString()}円
            </Text>{' '}
            の支払い情報を入力してください。
          </Text>
        </View>

        {/* Test mode notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            テストモード: 実際の請求は行われません
          </Text>
        </View>

        {/* Payment form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>カード情報</Text>
            <View style={styles.cardFieldContainer}>
              <CardField
                postalCodeEnabled={false}
                autofocus
                style={styles.cardField}
                onCardChange={cardInfo => {
                  setCardDetails(cardInfo);
                  if (error) setError(null);
                }}
                disabled={isProcessing}
                cardStyle={{
                  textColor: colors.text,
                  fontSize: 16,
                  placeholderColor: colors.textLight,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: borderRadius.md,
                }}
              />
            </View>
          </View>

          {/* Security note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityNoteText}>
              🔒 カード情報は暗号化されてStripeを通じて安全に処理されます
            </Text>
          </View>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!isCardComplete || isProcessing) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isCardComplete || isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.surface} />
              <Text style={styles.buttonText}>処理中...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {DEPOSIT_TOTAL.toLocaleString()}円を支払う
            </Text>
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
  highlight: {
    fontWeight: '600',
    color: colors.text,
  },
  notice: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  cardFieldContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  cardField: {
    height: 56,
    width: '100%',
  },
  securityNote: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  securityNoteText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
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
});
