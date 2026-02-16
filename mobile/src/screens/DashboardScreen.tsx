import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/PrimaryButton';
import {ScreenContainer} from '../components/ScreenContainer';
import {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

type ContractStatus = 'active' | 'completed';

export function DashboardScreen({navigation}: Props): React.JSX.Element {
  const [status, setStatus] = useState<ContractStatus>('active');
  const display = useMemo(
    () =>
      status === 'active'
        ? {
            title: '契約進行中',
            today: '未超過',
            weeklyFailures: 1,
            balance: 3000,
          }
        : {
            title: '契約完了',
            today: '完了',
            weeklyFailures: 2,
            balance: 2500,
          },
    [status],
  );

  return (
    <ScreenContainer
      title="Dashboard"
      description="契約状態（active/completed）に応じて表示を切り替えます。">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>契約情報</Text>
        <Text style={styles.text}>{display.title}</Text>
        <Text style={styles.text}>残り日数: 4日（仮）</Text>
        <Text style={styles.text}>日次上限: 3,600 秒</Text>
        <Text style={styles.text}>対象アプリ: com.apple.MobileSMS</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日</Text>
        <Text style={styles.text}>状態: {display.today}</Text>
        <Text style={styles.text}>残り時間: 900 秒（仮）</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今週</Text>
        <Text style={styles.text}>失敗日数: {display.weeklyFailures}</Text>
        <Text style={styles.text}>残高: {display.balance} 円</Text>
      </View>

      {status === 'completed' ? (
        <PrimaryButton
          title="新しい契約を開始"
          onPress={() => navigation.reset({index: 0, routes: [{name: 'Login'}]})}
        />
      ) : (
        <PrimaryButton
          title="契約完了をシミュレート"
          onPress={() => setStatus('completed')}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#334155',
  },
});
