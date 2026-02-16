import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenTime } from '../native/screenTime';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PickApps'>;

export function PickAppsScreen({ navigation }: Props): React.JSX.Element {
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  return (
    <ScreenContainer
      title="制限アプリ選択"
      description="iOS App Picker で対象アプリを選択します。"
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>選択中アプリ</Text>
        <Text style={styles.cardBody}>
          {selectedApps.length > 0
            ? selectedApps.join(', ')
            : 'まだ選択されていません'}
        </Text>
      </View>
      <PrimaryButton
        title="アプリを選択する"
        onPress={async () => {
          const bundleIds = await ScreenTime.presentAppPicker();
          setSelectedApps(bundleIds);
        }}
      />
      <PrimaryButton
        title="次へ"
        disabled={selectedApps.length === 0}
        onPress={() => navigation.navigate('CreateContract')}
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
});
