import { Platform } from 'react-native';

export const lightColors = {
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
  accentBorder: 'rgba(40, 84, 48, 0.28)',
  positive: '#2D6A4F', // Lush leaf green
  positiveSubtle: 'rgba(45, 106, 79, 0.12)',
  positiveBorder: 'rgba(45, 106, 79, 0.28)',
  negative: '#B94A3E', // Earthy terracotta clay
  negativeSubtle: 'rgba(185, 74, 62, 0.12)',
  negativeBorder: 'rgba(185, 74, 62, 0.28)',
  warning: '#C47B27', // Warm amber ochre
  warningSubtle: 'rgba(196, 123, 39, 0.12)',
  warningBorder: 'rgba(196, 123, 39, 0.28)',
};

export const darkColors = {
  // Deep Warm Obsidian Charcoal & Peat Earth
  background: '#141312',
  canvas: '#141312',
  canvasMuted: '#1B1917',

  // Surfaces: Dark Basalt Clay & Smoked Stoneware Ceramic
  surface: '#1E1C19',
  surfaceSubtle: '#262420',
  surfaceHighlight: '#322E29',
  surfaceElevated: '#282521',

  // Wood & Sand Accent Tones
  sand: '#342F29',
  sandSubtle: '#5C544B',
  sandMuted: '#8A8074',
  woodWarm: '#C4B5A5',

  // Hairline borders with subtle glowing warm sand tone
  border: 'rgba(237, 229, 220, 0.10)',
  borderStrong: 'rgba(237, 229, 220, 0.18)',

  // Typography - High-contrast alabaster cream & warm desert ash
  textPrimary: '#F5EFEB',
  textSecondary: '#B8AFA5',
  textTertiary: '#7D756C',

  // Lush Botanical Emerald & Vivid Forest Moss
  accent: '#3E8E56',
  accentHover: '#4BAA69',
  accentSubtle: 'rgba(62, 142, 86, 0.20)',
  accentBorder: 'rgba(62, 142, 86, 0.35)',
  positive: '#4CAF79',
  positiveSubtle: 'rgba(76, 175, 121, 0.20)',
  positiveBorder: 'rgba(76, 175, 121, 0.35)',
  negative: '#E06D5E',
  negativeSubtle: 'rgba(224, 109, 94, 0.20)',
  negativeBorder: 'rgba(224, 109, 94, 0.35)',
  warning: '#E5A144',
  warningSubtle: 'rgba(229, 161, 68, 0.20)',
  warningBorder: 'rgba(229, 161, 68, 0.35)',
};

export type ThemeColors = typeof lightColors;

const makeToken = (varName: string, lightVal: string) =>
  Platform.select({
    web: `var(${varName}, ${lightVal})`,
    default: lightVal,
  });

export const colors = {
  background: makeToken('--vl-bg', lightColors.background),
  canvas: makeToken('--vl-canvas', lightColors.canvas),
  canvasMuted: makeToken('--vl-canvas-muted', lightColors.canvasMuted),
  surface: makeToken('--vl-surface', lightColors.surface),
  surfaceSubtle: makeToken('--vl-surface-subtle', lightColors.surfaceSubtle),
  surfaceHighlight: makeToken('--vl-surface-highlight', lightColors.surfaceHighlight),
  surfaceElevated: makeToken('--vl-surface-elevated', lightColors.surfaceElevated),
  sand: makeToken('--vl-sand', lightColors.sand),
  sandSubtle: makeToken('--vl-sand-subtle', lightColors.sandSubtle),
  sandMuted: makeToken('--vl-sand-muted', lightColors.sandMuted),
  woodWarm: makeToken('--vl-wood-warm', lightColors.woodWarm),
  border: makeToken('--vl-border', lightColors.border),
  borderStrong: makeToken('--vl-border-strong', lightColors.borderStrong),
  textPrimary: makeToken('--vl-text-primary', lightColors.textPrimary),
  textSecondary: makeToken('--vl-text-secondary', lightColors.textSecondary),
  textTertiary: makeToken('--vl-text-tertiary', lightColors.textTertiary),
  accent: makeToken('--vl-accent', lightColors.accent),
  accentHover: makeToken('--vl-accent-hover', lightColors.accentHover),
  accentSubtle: makeToken('--vl-accent-subtle', lightColors.accentSubtle),
  accentBorder: makeToken('--vl-accent-border', lightColors.accentBorder),
  positive: makeToken('--vl-positive', lightColors.positive),
  positiveSubtle: makeToken('--vl-positive-subtle', lightColors.positiveSubtle),
  positiveBorder: makeToken('--vl-positive-border', lightColors.positiveBorder),
  negative: makeToken('--vl-negative', lightColors.negative),
  negativeSubtle: makeToken('--vl-negative-subtle', lightColors.negativeSubtle),
  negativeBorder: makeToken('--vl-negative-border', lightColors.negativeBorder),
  warning: makeToken('--vl-warning', lightColors.warning),
  warningSubtle: makeToken('--vl-warning-subtle', lightColors.warningSubtle),
  warningBorder: makeToken('--vl-warning-border', lightColors.warningBorder),
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
