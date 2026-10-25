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
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    ...typography.tabular,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  trend: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
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
  },
});
