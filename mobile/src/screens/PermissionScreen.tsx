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

type Props = NativeStackScreenProps<RootStackParamList, 'Permission'>;

export function PermissionScreen({ navigation }: Props): React.JSX.Element {
  const [authorized, setAuthorized] = useState(false);

  const handleRequestPermission = async () => {
    await ScreenTime.requestAuthorization();
    setAuthorized(true);
  };

  const handleContinue = () => {
    navigation.navigate('PickApps');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}></Text>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.header}>
          <Text style={styles.title}>Screen Timeの許可</Text>
          <Text style={styles.description}>
            アプリの使用時間を監視し、設定した上限を超えた場合に制限をかけるため、Screen
            Time APIへのアクセス許可が必要です。
          </Text>
        </View>

        {/* Permission List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>この許可により：</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.checkIcon}></Text>
              <Text style={styles.listText}>アプリごとの使用時間を監視</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.checkIcon}></Text>
              <Text style={styles.listText}>上限超過時に自動ロック</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.checkIcon}></Text>
              <Text style={styles.listText}>契約に基づく使用制限</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.footer}>
          {!authorized ? (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleRequestPermission}
            >
              <Text style={styles.primaryButtonText}>許可をリクエスト</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.grantedContainer}>
                <Text style={styles.grantedIcon}></Text>
                <Text style={styles.grantedText}>許可されました</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
                onPress={handleContinue}
              >
                <Text style={styles.primaryButtonText}>次へ</Text>
              </Pressable>
            </>
          )}
        </View>
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
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  footer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
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
  grantedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  grantedIcon: {
    fontSize: 18,
  },
  grantedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16A34A',
  },
});
