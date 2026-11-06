import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, typography, radius, spacing } from '../theme/tokens';

interface StatBlockProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  style?: ViewStyle;
  framed?: boolean;
  glass?: boolean;
  variant?: 'minimal' | 'framed';
  isHero?: boolean;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendType = 'neutral',
  style,
  framed = false,
  glass = false,
  variant,
  isHero = false,
}) => {
  const isFramed = framed || glass || variant === 'framed' || isHero;

  return (
    <View style={[styles.container, isFramed && styles.framedContainer, isHero && styles.heroContainer, style]}>
      <Text style={[styles.label, isHero && styles.heroLabel]}>{label}</Text>
      <Text style={[styles.value, isHero && styles.heroValue]}>{value}</Text>
      <View style={styles.footerRow}>
        {trend && (
          <Text
            style={[
              styles.trend,
              trendType === 'positive' && styles.trendPositive,
              trendType === 'negative' && styles.trendNegative,
            ]}
          >
            {trend}
          </Text>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  framedContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroContainer: {
    borderTopColor: colors.accent,
    borderTopWidth: 2,
    backgroundColor: 'rgba(26, 28, 54, 0.45)',
  },
  heroLabel: {
    color: colors.textPrimary,
  },
  heroValue: {
    fontSize: 30,
    lineHeight: 36,
    color: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  value: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  trend: {
    fontSize: 13.5,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    fontWeight: '600',
    letterSpacing: 0.2,
    ...typography.tabular,
  },
  trendPositive: {
    color: '#34D399',
  },
  trendNegative: {
    color: colors.negative,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    fontWeight: '500',
  },
});
