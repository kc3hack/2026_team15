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

type Props = NativeStackScreenProps<RootStackParamList, 'PickApps'>;

// Mock app data for display
const MOCK_APPS = [
  { id: 'com.instagram.app', name: 'Instagram', icon: '' },
  { id: 'com.twitter.app', name: 'Twitter', icon: '' },
  { id: 'com.tiktok.app', name: 'TikTok', icon: '' },
  { id: 'com.youtube.app', name: 'YouTube', icon: '' },
  { id: 'com.facebook.app', name: 'Facebook', icon: '' },
  { id: 'com.reddit.app', name: 'Reddit', icon: '' },
  { id: 'com.netflix.app', name: 'Netflix', icon: '' },
  { id: 'com.games.app', name: 'Game Center', icon: '' },
];

export function PickAppsScreen({ navigation }: Props): React.JSX.Element {
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const toggleApp = (appId: string) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId],
    );
  };

  const handleOpenNativePicker = async () => {
    const bundleIds = await ScreenTime.presentAppPicker();
    if (bundleIds && bundleIds.length > 0) {
      setSelectedApps(bundleIds);
    }
  };

  const handleContinue = () => {
    if (selectedApps.length > 0) {
      navigation.navigate('CreateContract');
    }
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
          <Text style={styles.title}>制限するアプリを選択</Text>
          <Text style={styles.subtitle}>
            使用時間を制限したいアプリを選んでください
          </Text>
        </View>

        {/* Native Picker Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nativePickerButton,
            pressed && styles.nativePickerButtonPressed,
          ]}
          onPress={handleOpenNativePicker}
        >
          <Text style={styles.nativePickerButtonText}>
            iOSアプリピッカーを開く
          </Text>
        </Pressable>

        {/* Selected Apps Display */}
        {selectedApps.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>選択済みアプリ</Text>
            <View style={styles.selectedList}>
              {selectedApps.map(appId => (
                <View key={appId} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{appId}</Text>
                  <Pressable onPress={() => toggleApp(appId)}>
                    <Text style={styles.removeIcon}> </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mock App List for Preview */}
        <View style={styles.appList}>
          {MOCK_APPS.map(app => {
            const isSelected = selectedApps.includes(app.id);
            return (
              <Pressable
                key={app.id}
                style={({ pressed }) => [
                  styles.appItem,
                  isSelected && styles.appItemSelected,
                  pressed && styles.appItemPressed,
                ]}
                onPress={() => toggleApp(app.id)}
              >
                <View style={styles.checkbox}>
                  {isSelected && <Text style={styles.checkboxIcon}></Text>}
                </View>
                <Text style={styles.appIcon}>{app.icon}</Text>
                <Text style={styles.appName}>{app.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Selection Count */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedApps.length > 0
              ? `${selectedApps.length}個のアプリを選択中`
              : 'アプリを選択してください'}
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            selectedApps.length === 0 && styles.continueButtonDisabled,
            pressed && selectedApps.length > 0 && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={selectedApps.length === 0}
        >
          <Text style={styles.continueButtonText}>次へ</Text>
        </Pressable>
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
    backgroundColor: '#EFF6FF',
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
  nativePickerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nativePickerButtonPressed: {
    opacity: 0.8,
  },
  nativePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  selectedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  selectedChipText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  removeIcon: {
    fontSize: 14,
    color: '#1E40AF',
  },
  appList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  appItemPressed: {
    backgroundColor: '#F9FAFB',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxIcon: {
    fontSize: 12,
    color: '#2563EB',
  },
  appIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonPressed: {
    opacity: 0.8,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
