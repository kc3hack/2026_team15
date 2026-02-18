import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../lib/app-context';
import { colors, spacing, borderRadius } from '../lib/theme';

function PermissionItem({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <View style={styles.permissionItem}>
      <Text style={styles.permissionLabel}>{label}</Text>
      <Text style={styles.permissionDescription}>{description}</Text>
    </View>
  );
}

export function PermissionScreen(): React.JSX.Element {
  const { grantPermission } = useApp();
  const [isGranting, setIsGranting] = useState(false);
  const [granted, setGranted] = useState(false);

  const handleGrant = async () => {
    setIsGranting(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    setGranted(true);
    setIsGranting(false);

    await new Promise<void>(resolve => setTimeout(resolve, 600));
    grantPermission();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{granted ? '✓' : '◯'}</Text>
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Screen Time 許可</Text>
          <Text style={styles.description}>
            アプリの使用時間を監視し、制限を適用するために{'\n'}
            Screen Time APIへのアクセスが必要です。
          </Text>
        </View>

        {/* Permission details */}
        <View style={styles.permissionsCard}>
          <PermissionItem
            label="使用時間の読み取り"
            description="対象アプリの利用時間を取得"
          />
          <View style={styles.divider} />
          <PermissionItem
            label="制限の適用"
            description="制限超過時にアプリをロック"
          />
          <View style={styles.divider} />
          <PermissionItem
            label="アプリ一覧の取得"
            description="制限対象アプリを選択可能に"
          />
        </View>

        {/* Action */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              (isGranting || granted) && styles.buttonGranted,
            ]}
            onPress={handleGrant}
            disabled={isGranting || granted}
            activeOpacity={0.7}
          >
            {isGranting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.surface} />
                <Text style={styles.buttonText}>許可を取得中...</Text>
              </View>
            ) : granted ? (
              <View style={styles.grantedContainer}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.buttonText}>許可されました</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>許可する</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.disclaimer}>MVP: モックで許可をシミュレート</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconText: {
    fontSize: 32,
    color: colors.textSecondary,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  permissionItem: {
    paddingVertical: spacing.xs,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonGranted: {
    backgroundColor: colors.success,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grantedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkmark: {
    fontSize: 16,
    color: colors.surface,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.surface,
  },
  disclaimer: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textLight,
  },
});
