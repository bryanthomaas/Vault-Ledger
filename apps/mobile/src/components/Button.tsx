import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      aria-label={title}
      {...({ className: 'vl-btn', dataSet: { button: 'true' } } as any)}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#FFFFFF' : colors.accent} />
      ) : (
        <>
          {icon && <span style={{ display: 'inline-flex', marginRight: 6, alignItems: 'center' }}>{icon}</span>}
          <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    height: 32,
    paddingHorizontal: 12,
  },
  md: {
    height: 36,
    paddingHorizontal: 16,
  },
  lg: {
    height: 42,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        } as any)
      : {}),
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  secondary: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
  },
  outlineText: {
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
  },
  ghostText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
