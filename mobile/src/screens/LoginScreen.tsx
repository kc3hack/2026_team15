import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/PrimaryButton';
import {ScreenContainer} from '../components/ScreenContainer';
import {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props): React.JSX.Element {
  return (
    <ScreenContainer
      title="YOHAKU"
      description="Sign in with Apple 後に、プロフィール作成と初期設定へ進みます。">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Apple ログイン</Text>
        <Text style={styles.cardBody}>
          MVPではログイン成功後に `profiles` の存在確認・作成を実行します。
        </Text>
      </View>
      <PrimaryButton
        title="Sign in with Apple（Mock）"
        onPress={() => navigation.navigate('Permission')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
});
