import { Platform } from 'react-native';

export const colors = {
  // Deep organic dark wood & earthy timber canvas
  background: '#14110F',
  canvas: '#14110F',

  // Surfaces: Warm earthenware ceramic & stoneware clay
  surface: '#1F1A16',
  surfaceSubtle: '#26201B',
  surfaceHighlight: '#332B24',

  // Wood & Sand Tones
  woodGrain: '#2B231C',
  woodDark: '#191410',
  sand: '#EAE1D6',
  sandSubtle: '#B8ABA0',
  sandMuted: '#6B6055',

  // Hairline borders with warm sandy ceramic tone
  border: 'rgba(234, 225, 214, 0.12)',
  borderStrong: 'rgba(234, 225, 214, 0.24)',

  // Typography - Warm ceramic bone and desert linen
  textPrimary: '#FAF6F0',
  textSecondary: '#C5B9AC',
  textTertiary: '#7E7266',

  // Lush Botanical & Forest Green Accents
  accent: '#2EAE60', // Deep botanical emerald / forest moss
  accentSubtle: 'rgba(46, 174, 96, 0.16)',
  positive: '#22C55E', // Lush leaf green
  positiveSubtle: 'rgba(34, 197, 94, 0.16)',
  negative: '#E25C50', // Earthy terracotta clay
  negativeSubtle: 'rgba(226, 92, 80, 0.16)',
  warning: '#E09B3D', // Warm amber resin
  warningSubtle: 'rgba(224, 155, 61, 0.16)',
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
