import React from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
} from 'react-native';
import { Slot } from 'expo-router';
import { DesktopSidebar, MobileTabBar } from '../../components/AppNavigation';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { IconShieldLock } from '../../components/Icons';
import { VaultLogo } from '../../components/VaultLogo';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isLocked, unlockBiometric } = useAuthStore();

  if (isLocked) {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockCard}>
          <View style={styles.lockIconCircle}>
            <IconShieldLock size={26} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.lockTitle}>Ledger Session Locked</Text>
          <Text style={styles.lockDesc}>
            Authentication required to access ledger accounts.
          </Text>
          <Button
            title="Unlock Ledger"
            onPress={unlockBiometric}
            variant="primary"
            style={{ width: '100%', marginTop: spacing.md }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          <DesktopSidebar />
          <View style={styles.desktopContent}>
            <Slot />
          </View>
        </View>
      ) : (
        <View style={styles.mobileLayout}>
          <View style={styles.mobileHeader}>
            <View style={styles.mobileBrand}>
              <VaultLogo size={24} />
              <Text style={styles.mobileBrandTitle}>Vault Ledger</Text>
            </View>
          </View>
          <View style={styles.mobileContent}>
            <Slot />
          </View>
          <MobileTabBar />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  desktopLayout: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  desktopContent: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
  },
  mobileLayout: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniLogoText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamilySerif,
  },
  mobileBrandTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: -0.2,
    fontFamily: typography.fontFamily,
  },
  mobileContent: {
    flex: 1,
  },
  lockContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  lockCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#2D261E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    fontFamily: typography.fontFamilySerif,
  },
  lockDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
});
