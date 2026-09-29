export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  border: string;
  borderBold: string;
  text: string;
  textMuted: string;
  textInverse: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  badgeBg: string;
  badgeText: string;
  solarGold: string;
}

export const lightTheme: ThemeColors = {
  primary: '#0D6EFD',
  primaryLight: '#E7F1FF',
  primaryDark: '#0A58CA',
  secondary: '#495057',
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  card: '#FFFFFF',
  border: '#D8DEE4',
  borderBold: '#8C959F',
  text: '#1F2328',
  textMuted: '#57606A',
  textInverse: '#FFFFFF',
  success: '#1A7F37',
  successLight: '#DAFBE1',
  warning: '#9A6700',
  warningLight: '#FFF8C5',
  danger: '#CF222E',
  dangerLight: '#FFEBE9',
  badgeBg: '#EAEFF5',
  badgeText: '#24292F',
  solarGold: '#D97706',
};

// High-Contrast Sunlight Mode for Roof Engineers
export const highContrastTheme: ThemeColors = {
  primary: '#0047BA',
  primaryLight: '#CCE3FF',
  primaryDark: '#002B70',
  secondary: '#000000',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  card: '#FFFFFF',
  border: '#000000',
  borderBold: '#000000',
  text: '#000000',
  textMuted: '#222222',
  textInverse: '#FFFFFF',
  success: '#006400',
  successLight: '#C3F7C3',
  warning: '#7A4700',
  warningLight: '#FFE4A0',
  danger: '#A30000',
  dangerLight: '#FFCCCC',
  badgeBg: '#E0E0E0',
  badgeText: '#000000',
  solarGold: '#B45309',
};

export const darkTheme: ThemeColors = {
  primary: '#388BFD',
  primaryLight: '#162235',
  primaryDark: '#1F6FEB',
  secondary: '#8B949E',
  background: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#21262D',
  card: '#161B22',
  border: '#30363D',
  borderBold: '#6E7681',
  text: '#C9D1D9',
  textMuted: '#8B949E',
  textInverse: '#0D1117',
  success: '#3FB950',
  successLight: '#1B3B24',
  warning: '#D29922',
  warningLight: '#3D2F0E',
  danger: '#F85149',
  dangerLight: '#431718',
  badgeBg: '#30363D',
  badgeText: '#F0F6FC',
  solarGold: '#F59E0B',
};

export const typography = {
  headingXL: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  headingLg: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  headingMd: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
  button: { fontSize: 16, fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  touchTargetMin: 48, // 48dp minimum for reliable tap on roofs
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};
