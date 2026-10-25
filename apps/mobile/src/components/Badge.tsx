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
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: typography.fontFamilyMono,
    letterSpacing: 0.3,
  },
  default: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.border,
  },
  defaultText: {
    color: colors.textSecondary,
  },
  accent: {
    backgroundColor: colors.accentSubtle,
    borderColor: 'rgba(0, 210, 224, 0.3)',
  },
  accentText: {
    color: colors.accent,
  },
  positive: {
    backgroundColor: colors.positiveSubtle,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  positiveText: {
    color: colors.positive,
  },
  negative: {
    backgroundColor: colors.negativeSubtle,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  negativeText: {
    color: colors.negative,
  },
  warning: {
    backgroundColor: colors.warningSubtle,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    color: colors.warning,
  },
});
