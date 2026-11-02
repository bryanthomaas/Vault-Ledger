import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';

interface StatBlockProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  style?: ViewStyle;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendType = 'neutral',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    ...typography.tabular,
    letterSpacing: -0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  trend: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    fontWeight: '600',
    ...typography.tabular,
  },
  trendPositive: {
    color: colors.positive,
  },
  trendNegative: {
    color: colors.negative,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
  },
});
