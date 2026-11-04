import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../store/themeStore';
import { colors, typography, leafRadius, spacing } from '../theme/tokens';
import { IconSun, IconMoon } from './Icons';

interface ThemeToggleProps {
  variant?: 'button' | 'icon';
  style?: ViewStyle;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  style,
}) => {
  const { mode, isDark, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.75}
        style={[styles.iconButton, style]}
        accessibilityLabel={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        accessibilityRole="button"
      >
        {isDark ? (
          <IconSun size={17} color={colors.accent} strokeWidth={2} />
        ) : (
          <IconMoon size={17} color={colors.accent} strokeWidth={2} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.8}
      style={[styles.fullButton, style]}
      accessibilityLabel={`Switch to ${isDark ? 'Light Sand' : 'Dark Peat'} mode`}
      accessibilityRole="button"
    >
      <View style={styles.iconBox}>
        {isDark ? (
          <IconSun size={15} color={colors.accent} strokeWidth={2} />
        ) : (
          <IconMoon size={15} color={colors.accent} strokeWidth={2} />
        )}
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.buttonLabel}>
          {isDark ? 'Light Sand' : 'Dark Peat'}
        </Text>
        <Text style={styles.buttonSubtext}>
          {isDark ? 'Warm Desert Dune' : 'Dark Obsidian Clay'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.2,
  },
  buttonSubtext: {
    fontSize: 9,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
    letterSpacing: 0.3,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
