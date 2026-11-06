import React from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'accent' | 'positive' | 'negative' | 'warning';
  style?: StyleProp<TextStyle | any>;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  return (
    <Text style={[styles.label, styles[variant], style]}>
      {label}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
    textTransform: 'none',
    fontFamily: typography.fontFamily,
  },
  default: {
    color: colors.textSecondary,
  },
  accent: {
    color: colors.accent,
  },
  positive: {
    color: colors.positive,
  },
  negative: {
    color: colors.negative,
  },
  warning: {
    color: colors.warning,
  },
});
