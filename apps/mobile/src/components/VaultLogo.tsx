import React, { useId } from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, {
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors, typography } from '../theme/tokens';

export interface VaultLogoProps {
  /** Width and height of the logo mark in pixels. */
  size?: number;
  /** Primary brand accent color (Tangerine Flame #FF5A1F). */
  color?: string;
  /** Secondary brand accent color (Iris Violet #8D8DF5). */
  secondaryColor?: string;
  /** Highlight accent color (Warm Gold #FFB03A). */
  accentColor?: string;
  /** Render the mark alone ('mark') or paired with the brand title ('full'). */
  variant?: 'mark' | 'full';
  /** Render the dark rounded-square container behind the mark. */
  showBackground?: boolean;
  /** Optional container style override. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Interlocking geometric VL monogram used across the application header,
 * authentication views, and browser favicon.
 */
export const VaultLogo: React.FC<VaultLogoProps> = ({
  size = 32,
  color = '#FF5A1F',
  secondaryColor = '#8D8DF5',
  accentColor = '#FFB03A',
  variant = 'mark',
  showBackground = true,
  style,
}) => {
  const reactId = useId();
  const id = 'vl-logo-' + reactId.replace(/[^a-zA-Z0-9_-]/g, '');

  const svgMark = (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      accessibilityRole="image"
      aria-label="Vault Ledger Monogram"
    >
      <Defs>
        <LinearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#171930" stopOpacity="1" />
          <Stop offset="100%" stopColor="#0C0D1A" stopOpacity="1" />
        </LinearGradient>

        <LinearGradient id={`${id}-border`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0.45" />
        </LinearGradient>

        <LinearGradient id={`${id}-flame`} x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0%" stopColor={accentColor} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>

        <LinearGradient id={`${id}-iris`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#B4B4FA" />
          <Stop offset="100%" stopColor={secondaryColor} />
        </LinearGradient>
      </Defs>

      {showBackground && (
        <Rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="22"
          fill={`url(#${id}-bg)`}
          stroke={`url(#${id}-border)`}
          strokeWidth="2.5"
        />
      )}

      {/* 'L' Ledger Stroke (Iris Violet) */}
      <Path
        d="M 56 26 L 56 72 L 80 72"
        stroke={`url(#${id}-iris)`}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 'V' Vault Chevron (Warm Gold to Tangerine Flame) */}
      <Path
        d="M 20 26 L 40 72 L 60 26"
        stroke={`url(#${id}-flame)`}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  if (variant === 'full') {
    return (
      <View style={[styles.fullContainer, style]}>
        {svgMark}
        <View style={styles.textWrap}>
          <Text style={[styles.brandTitleText, { fontSize: Math.max(15, Math.round(size * 0.58)) }]}>
            Vault <Text style={{ color: secondaryColor }}>Ledger</Text>
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.markContainer, { width: size, height: size }, style]}>
      {svgMark}
    </View>
  );
};

const styles = StyleSheet.create({
  markContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textWrap: {
    justifyContent: 'center',
  },
  brandTitleText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.3,
  },
});

export default VaultLogo;
