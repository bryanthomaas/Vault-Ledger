import { Platform } from 'react-native';

// Wayglim Tangerine Flame & Iris palette (Dark Only)
export const darkColors = {
  // Deep Iris Tinted Backgrounds (Tinted towards Wayglim #8D8DF5 in dark mode)
  background: '#0A0B14',
  canvas: '#0A0B14',
  canvasMuted: '#07070F',

  // Deep Iris Tinted Surfaces
  surface: '#121324',
  surfaceSubtle: '#17192E',
  surfaceRaised: '#1F223D',
  surfaceHighlight: '#272B4E',
  surfaceElevated: '#1A1E38',

  // Wayglim Iris Surface Glass
  surfaceGlass: 'rgba(18, 19, 36, 0.88)',
  glassBorder: 'rgba(141, 141, 245, 0.20)',
  glassHighlight: 'rgba(141, 141, 245, 0.32)',

  // Hairlines & Borders
  border: 'rgba(141, 141, 245, 0.16)',
  borderStrong: 'rgba(141, 141, 245, 0.34)',

  // Crisp White & Tinted Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#C8CCEE',
  textTertiary: '#7F84B2',

  // Wayglim Iris Violet Elements (replaces legacy electricBlue)
  electricBlue: '#8D8DF5',
  irisViolet: '#8D8DF5',
  electricBlueDeep: '#6A6AE0',
  electricBlueSubtle: 'rgba(141, 141, 245, 0.14)',
  electricBlueBorder: 'rgba(141, 141, 245, 0.28)',

  // Tone aliases mapped to dark palette
  sand: '#17192E',
  sandSubtle: '#1F223D',
  sandMuted: '#7F84B2',
  woodWarm: '#272B4E',

  // Wayglim Tangerine Flame Accent (#FF5A1F)
  accent: '#FF5A1F',
  accentHover: '#E84A12',
  accentSubtle: 'rgba(255, 90, 31, 0.15)',
  accentBorder: 'rgba(255, 90, 31, 0.45)',

  // Secondary Warm Gold / Amber Accent (#FFB03A)
  accentGold: '#FFB03A',
  accentPeach: '#FF8A5C',

  // Semantic
  positive: '#10B981',
  positiveSubtle: 'rgba(16, 185, 129, 0.14)',
  positiveBorder: 'rgba(16, 185, 129, 0.3)',
  negative: '#E8243C',
  crimson: '#E8243C',
  negativeSubtle: 'rgba(232, 36, 60, 0.14)',
  negativeBorder: 'rgba(232, 36, 60, 0.3)',
  warning: '#FFB03A',
  warningSubtle: 'rgba(255, 176, 58, 0.14)',
  warningBorder: 'rgba(255, 176, 58, 0.35)',
};

// Light theme is removed and maps directly to the dark palette
export const lightColors = darkColors;

export type ThemeColors = typeof darkColors;

const makeToken = (varName: string, val: string) =>
  Platform.select({
    web: `var(${varName}, ${val})`,
    default: val,
  });

export const colors = {
  background: makeToken('--vl-bg', darkColors.background),
  canvas: makeToken('--vl-canvas', darkColors.canvas),
  canvasMuted: makeToken('--vl-canvas-muted', darkColors.canvasMuted),
  surface: makeToken('--vl-surface', darkColors.surface),
  surfaceSubtle: makeToken('--vl-surface-subtle', darkColors.surfaceSubtle),
  surfaceRaised: makeToken('--vl-surface-raised', darkColors.surfaceRaised),
  surfaceHighlight: makeToken('--vl-surface-highlight', darkColors.surfaceHighlight),
  surfaceElevated: makeToken('--vl-surface-elevated', darkColors.surfaceElevated),
  surfaceGlass: makeToken('--vl-surface-glass', darkColors.surfaceGlass),
  glassBorder: makeToken('--vl-glass-border', darkColors.glassBorder),
  glassHighlight: makeToken('--vl-glass-highlight', darkColors.glassHighlight),
  electricBlue: makeToken('--vl-electric-blue', darkColors.electricBlue),
  electricBlueDeep: makeToken('--vl-electric-blue-deep', darkColors.electricBlueDeep),
  electricBlueSubtle: makeToken('--vl-electric-blue-subtle', darkColors.electricBlueSubtle),
  electricBlueBorder: makeToken('--vl-electric-blue-border', darkColors.electricBlueBorder),
  irisViolet: makeToken('--vl-iris-violet', darkColors.irisViolet),
  sand: makeToken('--vl-sand', darkColors.sand),
  sandSubtle: makeToken('--vl-sand-subtle', darkColors.sandSubtle),
  sandMuted: makeToken('--vl-sand-muted', darkColors.sandMuted),
  woodWarm: makeToken('--vl-wood-warm', darkColors.woodWarm),
  border: makeToken('--vl-border', darkColors.border),
  borderStrong: makeToken('--vl-border-strong', darkColors.borderStrong),
  textPrimary: makeToken('--vl-text-primary', darkColors.textPrimary),
  textSecondary: makeToken('--vl-text-secondary', darkColors.textSecondary),
  textTertiary: makeToken('--vl-text-tertiary', darkColors.textTertiary),
  accent: makeToken('--vl-accent', darkColors.accent),
  accentHover: makeToken('--vl-accent-hover', darkColors.accentHover),
  accentSubtle: makeToken('--vl-accent-subtle', darkColors.accentSubtle),
  accentBorder: makeToken('--vl-accent-border', darkColors.accentBorder),
  accentGold: makeToken('--vl-accent-gold', darkColors.accentGold),
  accentPeach: makeToken('--vl-accent-peach', darkColors.accentPeach),
  positive: makeToken('--vl-positive', darkColors.positive),
  positiveSubtle: makeToken('--vl-positive-subtle', darkColors.positiveSubtle),
  positiveBorder: makeToken('--vl-positive-border', darkColors.positiveBorder),
  negative: makeToken('--vl-negative', darkColors.negative),
  crimson: makeToken('--vl-crimson', darkColors.crimson),
  negativeSubtle: makeToken('--vl-negative-subtle', darkColors.negativeSubtle),
  negativeBorder: makeToken('--vl-negative-border', darkColors.negativeBorder),
  warning: makeToken('--vl-warning', darkColors.warning),
  warningSubtle: makeToken('--vl-warning-subtle', darkColors.warningSubtle),
  warningBorder: makeToken('--vl-warning-border', darkColors.warningBorder),
};

// Nested radius scale:
export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

// Backwards compatibility alias
export const leafRadius = {
  asymmetric: {
    borderRadius: 8,
  },
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

// Exclusively Fraunces and Instrument Serif throughout the application
export const typography = {
  fontFamily: Platform.select({
    ios: 'Fraunces, serif',
    android: 'serif',
    default: '"Fraunces", Georgia, serif',
  }),
  fontFamilySerif: Platform.select({
    ios: 'Instrument Serif, serif',
    android: 'serif',
    default: '"Instrument Serif", Georgia, serif',
  }),
  fontFamilyMono: Platform.select({
    ios: 'Menlo, monospace',
    android: 'monospace',
    default: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
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
  lg: 20,
  xl: 24,
  xxl: 32,
};
