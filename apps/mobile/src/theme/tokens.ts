import { Platform } from 'react-native';

export const colors = {
  // Warm Desert Dune & Travertine Canvas
  background: '#F4EFEA',
  canvas: '#F4EFEA',
  canvasMuted: '#EDE5DC',

  // Surfaces: Stoneware Ceramic & Alabaster Clay
  surface: '#FAF7F2',
  surfaceSubtle: '#F2EBE1',
  surfaceHighlight: '#EAE1D5',
  surfaceElevated: '#FFFFFF',

  // Wood & Sand Accent Tones
  sand: '#EDE5DC',
  sandSubtle: '#C5B8A8',
  sandMuted: '#968D84',
  woodWarm: '#54463A',

  // Hairline borders with warm desert sand tone
  border: 'rgba(32, 30, 27, 0.08)',
  borderStrong: 'rgba(32, 30, 27, 0.16)',

  // Typography - High-contrast charcoal slate and warm earthy taupe
  textPrimary: '#201E1B',
  textSecondary: '#635C54',
  textTertiary: '#968D84',

  // Lush Botanical & Forest Moss Green Accents
  accent: '#285430', // Deep botanical evergreen / forest moss
  accentHover: '#1E432A', // Deep pine forest
  accentSubtle: 'rgba(40, 84, 48, 0.12)',
  positive: '#2D6A4F', // Lush leaf green
  positiveSubtle: 'rgba(45, 106, 79, 0.12)',
  negative: '#B94A3E', // Earthy terracotta clay
  negativeSubtle: 'rgba(185, 74, 62, 0.12)',
  warning: '#C47B27', // Warm amber ochre
  warningSubtle: 'rgba(196, 123, 39, 0.12)',
};

export const leafRadius = {
  asymmetric: {
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
  },
  pill: 9999,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const typography = {
  fontFamily: Platform.select({
    ios: 'Plus Jakarta Sans, System',
    android: 'sans-serif',
    default: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }),
  fontFamilySerif: Platform.select({
    ios: 'Fraunces, Georgia, serif',
    android: 'serif',
    default: '"Fraunces", "Playfair Display", Georgia, serif',
  }),
  fontFamilyMono: Platform.select({
    ios: 'JetBrains Mono, Courier',
    android: 'monospace',
    default: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
