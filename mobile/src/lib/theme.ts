/**
 * YOHAKU Theme
 * 温かみのある白を基調とした、シンプルで落ち着いたカラーパレット
 */

export const colors = {
  // 背景色 - クリームがかった温かい白
  background: '#FAF8F4',
  backgroundAlt: '#F5F2EC',

  // カード・表面
  surface: '#FFFDF8',
  surfaceAlt: '#F8F5F0',

  // テキスト
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
  textLight: '#A8A8A8',

  // ボーダー
  border: '#E5E2DC',
  borderLight: '#EEECE8',

  // アクション
  primary: '#2A2A2A',
  primaryLight: '#4A4A4A',

  // ステート
  success: '#4A7C59',
  warning: '#8B7355',
  danger: '#8B5A5A',

  // その他
  overlay: 'rgba(26, 26, 26, 0.5)',
  divider: '#E8E5E0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 9999,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
};
