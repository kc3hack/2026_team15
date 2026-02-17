import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { colors, spacing, borderRadius } from '../lib/theme';

const PENALTY_PER_DAY = 500;
const CONTRACT_DAYS = 7;
const DEPOSIT_TOTAL = PENALTY_PER_DAY * CONTRACT_DAYS;

export function PaymentScreen(): React.JSX.Element {
  const { setPaymentCompleted, setStep } = useApp();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    if (errors.expiryDate) {
      setErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  const handleCvcChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 4);
    setCvc(cleaned);
    if (errors.cvc) {
      setErrors(prev => ({ ...prev, cvc: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cardDigits = cardNumber.replace(/\s/g, '');
    if (!cardDigits || cardDigits.length < 15) {
      newErrors.cardNumber = 'カード番号を正しく入力してください';
    }

    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = '有効期限を入力してください';
    } else {
      const [month] = expiryDate.split('/');
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = '有効な月を入力してください';
      }
    }

    if (!cvc || cvc.length < 3) {
      newErrors.cvc = 'セキュリティコードを入力してください';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'カード名義人を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    console.log('[MVP] Mock payment processed', {
      cardLast4: cardNumber.slice(-4),
      amount: DEPOSIT_TOTAL,
    });

    setPaymentCompleted(true);
    setIsProcessing(false);
    setStep('create-contract');
  };

  const handleBack = () => {
    setStep('pick-apps');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isProcessing}>
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

        {/* Mock notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            MVP: 実際の決済は行われません
          </Text>
        </View>

        {/* Payment form */}
        <View style={styles.form}>
          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>カード番号</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              editable={!isProcessing}
              maxLength={19}
              placeholderTextColor={colors.textLight}
            />
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>

          {/* Expiry and CVC */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>有効期限</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.expiryDate && styles.inputError,
                ]}
                value={expiryDate}
                onChangeText={handleExpiryChange}
                placeholder="MM/YY"
                keyboardType="numeric"
                editable={!isProcessing}
                maxLength={5}
                placeholderTextColor={colors.textLight}
              />
              {errors.expiryDate && (
                <Text style={styles.errorText}>{errors.expiryDate}</Text>
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVC</Text>
              <TextInput
                style={[styles.input, errors.cvc && styles.inputError]}
                value={cvc}
                onChangeText={handleCvcChange}
                placeholder="123"
                keyboardType="numeric"
                editable={!isProcessing}
                maxLength={4}
                placeholderTextColor={colors.textLight}
              />
              {errors.cvc && (
                <Text style={styles.errorText}>{errors.cvc}</Text>
              )}
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>カード名義人</Text>
            <TextInput
              style={[
                styles.input,
                errors.cardholderName && styles.inputError,
              ]}
              value={cardholderName}
              onChangeText={text => {
                setCardholderName(text);
                if (errors.cardholderName) {
                  setErrors(prev => ({ ...prev, cardholderName: '' }));
                }
              }}
              placeholder="TARO YAMADA"
              autoCapitalize="characters"
              editable={!isProcessing}
              placeholderTextColor={colors.textLight}
            />
            {errors.cardholderName && (
              <Text style={styles.errorText}>{errors.cardholderName}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isProcessing}
          activeOpacity={0.7}>
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
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
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
