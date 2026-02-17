import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { MOCK_APP_CATALOG } from '../lib/mock-store';
import { colors, spacing, borderRadius } from '../lib/theme';
import type { AppInfo } from '../types/domain';

export function PickAppsScreen(): React.JSX.Element {
  const { setSelectedApps, setStep } = useApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleApp = (bundleId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(bundleId)) {
        next.delete(bundleId);
      } else {
        next.add(bundleId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const apps: AppInfo[] = MOCK_APP_CATALOG.filter(a =>
      selected.has(a.bundleId),
    );
    setSelectedApps(apps);
    setStep('payment');
  };

  // Group apps by category
  const categories = Array.from(new Set(MOCK_APP_CATALOG.map(a => a.category)));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>制限するアプリを選択</Text>
          <Text style={styles.description}>
            使用時間を制限したいアプリを選んでください。
          </Text>
        </View>

        {/* App list */}
        <View style={styles.appList}>
          {categories.map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryLabel}>{category}</Text>
              <View style={styles.categoryApps}>
                {MOCK_APP_CATALOG.filter(a => a.category === category).map(
                  app => {
                    const isSelected = selected.has(app.bundleId);
                    return (
                      <TouchableOpacity
                        key={app.bundleId}
                        style={[
                          styles.appItem,
                          isSelected && styles.appItemSelected,
                        ]}
                        onPress={() => toggleApp(app.bundleId)}
                        activeOpacity={0.7}>
                        <View
                          style={[
                            styles.appIndicator,
                            isSelected && styles.appIndicatorSelected,
                          ]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <View style={styles.appInfo}>
                          <Text
                            style={[
                              styles.appName,
                              isSelected && styles.appNameSelected,
                            ]}>
                            {app.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            selected.size === 0 && styles.buttonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={selected.size === 0}
          activeOpacity={0.7}>
          <Text style={styles.buttonText}>
            {selected.size > 0
              ? `${selected.size}個のアプリを選択`
              : 'アプリを選択してください'}
          </Text>
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
  appList: {
    gap: spacing.xl,
  },
  categorySection: {
    gap: spacing.sm,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  categoryApps: {
    gap: spacing.xs,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  appItemSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  appIndicator: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIndicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.surface,
    fontWeight: '600',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  appNameSelected: {
    color: colors.text,
    fontWeight: '500',
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
    backgroundColor: colors.border,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
});
