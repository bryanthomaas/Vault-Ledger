import { Platform } from 'react-native';

export const colors = {
  // Deep editorial dark canvas
  background: '#090A0C',
  canvas: '#090A0C',

  // Surfaces: restrained, low contrast
  surface: '#111317',
  surfaceSubtle: '#16191F',
  surfaceHighlight: '#1F232B',

  // Hairline borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  // Typography
  textPrimary: '#F4F5F6',
  textSecondary: '#8E95A2',
  textTertiary: '#5A6270',

  // Refined functional accents (WCAG AA compliant)
  accent: '#00D2E0', // Calm, elegant cyan
  accentSubtle: 'rgba(0, 210, 224, 0.12)',
  positive: '#10B981', // Emerald
  positiveSubtle: 'rgba(16, 185, 129, 0.12)',
  negative: '#F43F5E', // Rose
  negativeSubtle: 'rgba(244, 63, 94, 0.12)',
  warning: '#F59E0B',
  warningSubtle: 'rgba(245, 158, 11, 0.12)',
};

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }),
  fontFamilyMono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  }),
  tabular: {
    fontVariant: ['tabular-nums'] as const,
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
