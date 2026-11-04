import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'accent' | 'positive' | 'negative' | 'warning';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.fontFamilyMono,
    letterSpacing: 0.4,
  },
  default: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderStrong,
  },
  defaultText: {
    color: colors.textSecondary,
  },
  accent: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accentBorder,
  },
  accentText: {
    color: colors.accent,
  },
  positive: {
    backgroundColor: colors.positiveSubtle,
    borderColor: colors.positiveBorder,
  },
  positiveText: {
    color: colors.positive,
  },
  negative: {
    backgroundColor: colors.negativeSubtle,
    borderColor: colors.negativeBorder,
  },
  negativeText: {
    color: colors.negative,
  },
  warning: {
    backgroundColor: colors.warningSubtle,
    borderColor: colors.warningBorder,
  },
  warningText: {
    color: colors.warning,
  },
});
