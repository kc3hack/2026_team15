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
import { ScreenTime } from '../native/screenTime';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateContract'>;

const PENALTY_PER_DAY = 500;
const CONTRACT_DAYS = 7;
const DEPOSIT_TOTAL = PENALTY_PER_DAY * CONTRACT_DAYS;

const TIME_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180];

export function CreateContractScreen({
  navigation,
}: Props): React.JSX.Element {
  const [step, setStep] = useState<1 | 2>(1);
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(60);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分`;
    if (mins === 0) return `${hours}時間`;
    return `${hours}時間${mins}分`;
  };

  const handleCreateContract = async () => {
    // TODO: Supabaseへ contracts/ledger_entries 作成
    await ScreenTime.startMonitoring({
      dailyLimitSeconds: dailyLimitMinutes * 60,
      selectedBundleIds: ['com.apple.MobileSMS'],
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}></Text>
          </View>
          <Text style={styles.title}>契約を作成</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? '1週間の使用制限契約を設定します' : '支払い方法を登録'}
          </Text>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View
              style={[
                styles.stepCircle,
                step === 1 ? styles.stepActive : styles.stepCompleted,
              ]}
            >
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View
              style={[
                styles.stepCircle,
                step === 2 ? styles.stepActive : styles.stepInactive,
              ]}
            >
              <Text style={styles.stepNumber}>2</Text>
            </View>
          </View>
        </View>

        {step === 1 ? (
          <>
            {/* Settings Card */}
            <View style={styles.card}>
              {/* Daily Limit Time */}
              <View style={styles.settingSection}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingIcon}></Text>
                  <Text style={styles.settingLabel}>1日の上限時間</Text>
                </View>

                {/* Time Selector */}
                <View style={styles.timeSelector}>
                  {TIME_OPTIONS.map(option => (
                    <Pressable
                      key={option}
                      style={({ pressed }) => [
                        styles.timeOption,
                        dailyLimitMinutes === option && styles.timeOptionSelected,
                        pressed && styles.timeOptionPressed,
                      ]}
                      onPress={() => setDailyLimitMinutes(option)}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          dailyLimitMinutes === option &&
                            styles.timeOptionTextSelected,
                        ]}
                      >
                        {formatTime(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Contract Period */}
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Text style={styles.settingRowIcon}></Text>
                  <Text style={styles.settingRowLabel}>契約期間</Text>
                </View>
                <Text style={styles.settingRowValue}>7日間</Text>
              </View>

              {/* Penalty Per Day */}
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Text style={styles.settingRowIcon}></Text>
                  <Text style={styles.settingRowLabel}>超過時ペナルティ</Text>
                </View>
                <Text style={styles.settingRowValue}>
                  {`¥${PENALTY_PER_DAY}/日`}
                </Text>
              </View>
            </View>

            {/* Deposit Info */}
            <View style={styles.depositCard}>
              <Text style={styles.depositTitle}>デポジット総額</Text>
              <Text style={styles.depositAmount}>
                {`¥${DEPOSIT_TOTAL.toLocaleString()}`}
              </Text>
              <Text style={styles.depositDescription}>
                契約開始時にデポジットを預け入れます。上限を超過した日数分のペナルティが差し引かれ、残額は契約終了時に返金されます。
              </Text>
            </View>

            {/* Warning */}
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                契約期間中は1ユーザー1件のみ。契約は途中キャンセルできません。1日1回の違反まで記録されます。
              </Text>
            </View>

            {/* Next Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryButtonText}>
                次へ：支払い方法を登録
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Back Button */}
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={() => setStep(1)}
            >
              <Text style={styles.backButtonIcon}></Text>
              <Text style={styles.backButtonText}>契約設定に戻る</Text>
            </Pressable>

            {/* Payment Card */}
            <View style={styles.card}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentIcon}></Text>
                <Text style={styles.paymentTitle}>クレジットカード情報</Text>
              </View>
              <View style={styles.paymentInputPlaceholder}>
                <Text style={styles.paymentPlaceholderText}>
                  カード情報を入力（MVPではモック）
                </Text>
              </View>
              <Text style={styles.paymentHint}>
                MVPでは決済処理をスキップします
              </Text>
            </View>

            {/* Charge Info */}
            <View style={styles.chargeCard}>
              <Text style={styles.chargeLabel}>請求金額</Text>
              <Text style={styles.chargeAmount}>
                {`¥${DEPOSIT_TOTAL.toLocaleString()}`}
              </Text>
              <Text style={styles.chargeDescription}>
                デポジットとして一時的にお預かりします
              </Text>
            </View>

            {/* Create Contract Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleCreateContract}
            >
              <Text style={styles.primaryButtonText}>
                支払いを確定して契約開始
              </Text>
            </Pressable>

            {/* Security Info */}
            <View style={styles.securityCard}>
              <Text style={styles.securityText}>
                MVPでは決済処理をスキップし、{'\n'}直接契約が作成されます
              </Text>
            </View>
          </>
        )}
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#4F46E5',
  },
  stepCompleted: {
    backgroundColor: '#22C55E',
  },
  stepInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingSection: {
    gap: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  timeOptionPressed: {
    opacity: 0.8,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timeOptionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingRowIcon: {
    fontSize: 16,
  },
  settingRowLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  settingRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  depositCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  depositTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  depositAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  depositDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  backButtonText: {
    fontSize: 15,
    color: '#6B7280',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  paymentIcon: {
    fontSize: 18,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentInputPlaceholder: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  paymentPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  paymentHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chargeCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  chargeLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  chargeAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  chargeDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  securityCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
