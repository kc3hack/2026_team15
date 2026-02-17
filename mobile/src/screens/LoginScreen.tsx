import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const handleAppleLogin = () => {
    navigation.navigate('Permission');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo and Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>余</Text>
            </View>
          </View>
          <Text style={styles.title}>ヨハク</Text>
          <Text style={styles.subtitle}>時間と心の余白を取り戻す</Text>
        </View>

        {/* Login Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.appleButton,
              pressed && styles.appleButtonPressed,
            ]}
            onPress={handleAppleLogin}
          >
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.appleButtonText}>Sign in with Apple</Text>
          </Pressable>

          <Text style={styles.description}>
            スマホ利用を契約構造と金銭的コミットメントで制御し、{'\n'}
            本当に欲しい余白を手に入れましょう
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 56,
    width: '100%',
    gap: 12,
  },
  appleButtonPressed: {
    opacity: 0.8,
  },
  appleIcon: {
    fontSize: 20,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
