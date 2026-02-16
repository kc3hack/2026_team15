import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/PrimaryButton';
import {ScreenContainer} from '../components/ScreenContainer';
import {ScreenTime} from '../native/screenTime';
import {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateContract'>;

const PENALTY_PER_DAY = 500;
const CONTRACT_DAYS = 7;
const DEPOSIT_TOTAL = PENALTY_PER_DAY * CONTRACT_DAYS;

export function CreateContractScreen({navigation}: Props): React.JSX.Element {
  return (
    <ScreenContainer
      title="契約作成"
      description="日次上限時間と固定ペナルティで1週間契約を作成します。">
      <View style={styles.card}>
        <Text style={styles.cardLine}>日次上限時間: 3,600 秒（仮）</Text>
        <Text style={styles.cardLine}>固定ペナルティ: {PENALTY_PER_DAY} 円/日</Text>
        <Text style={styles.cardLine}>デポジット総額: {DEPOSIT_TOTAL} 円</Text>
      </View>
      <PrimaryButton
        title="契約作成して監視開始"
        onPress={async () => {
          // TODO: Supabaseへ contracts/ledger_entries 作成
          await ScreenTime.startMonitoring({
            dailyLimitSeconds: 3600,
            selectedBundleIds: ['com.apple.MobileSMS'],
          });
          navigation.reset({
            index: 0,
            routes: [{name: 'Dashboard'}],
          });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  cardLine: {
    fontSize: 15,
    color: '#0F172A',
  },
});
