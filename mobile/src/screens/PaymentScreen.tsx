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
import { colors, spacing, borderRadius } from '../lib/theme';

export function PaymentScreen(): React.JSX.Element {
  const {
    pendingContractData,
    setPendingPaymentMethodId,
    setPaymentCompleted,
    setStep,
  } = useApp();
  const { createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCardComplete = cardDetails?.complete ?? false;
  const depositTotal = pendingContractData?.depositTotal ?? 0;

  const handleSubmit = async () => {
    if (!pendingContractData) {
      setError('先に契約内容を設定してください');
      return;
    }
    if (!isCardComplete) {
      setError('カード情報を正しく入力してください');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { paymentMethod, error: paymentMethodError } =
        await createPaymentMethod({
          paymentMethodType: 'Card',
        });

      if (paymentMethodError || !paymentMethod?.id) {
        setError(
          paymentMethodError?.message ?? 'カード情報の保存に失敗しました',
        );
        return;
      }

      setPendingPaymentMethodId(paymentMethod.id);
      setPaymentCompleted(true);
      setStep('confirm-contract');
    } catch (e) {
      setError('カード情報の処理中にエラーが発生しました');
      console.error('[Payment] Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setStep('create-contract');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isProcessing}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>支払い方法</Text>
          <Text style={styles.description}>
            デポジット{' '}
            <Text style={styles.highlight}>
              {depositTotal.toLocaleString()}円
            </Text>{' '}
            の支払いに使うカード情報を入力してください。
          </Text>
        </View>

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

          <View style={styles.securityNote}>
            <Text style={styles.securityNoteText}>
              🔒 カード情報は暗号化されてStripeを通じて安全に処理されます
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
            <Text style={styles.buttonText}>契約内容の確認へ進む</Text>
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
