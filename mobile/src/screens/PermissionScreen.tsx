import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenTime } from '../native/screenTime';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Permission'>;

export function PermissionScreen({ navigation }: Props): React.JSX.Element {
  const [authorized, setAuthorized] = useState(false);

  return (
    <ScreenContainer
      title="権限設定"
      description="Screen Time API の使用許可を取得します。"
    >
      <View style={styles.card}>
        <Text style={styles.statusLabel}>現在の状態</Text>
        <Text style={styles.statusValue}>
          {authorized ? '許可済み' : '未許可'}
        </Text>
      </View>
      <PrimaryButton
        title="Screen Time 許可をリクエスト"
        onPress={async () => {
          await ScreenTime.requestAuthorization();
          setAuthorized(true);
        }}
      />
      <PrimaryButton
        title="次へ"
        disabled={!authorized}
        onPress={() => navigation.navigate('PickApps')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
});
