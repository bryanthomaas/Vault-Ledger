import React from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Platform } from 'react-native';
import { Slot } from 'expo-router';
import { DesktopSidebar, MobileTabBar } from '../../components/AppNavigation';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../theme/tokens';
import { Button } from '../../components/Button';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isLocked, unlockBiometric } = useAuthStore();

  if (isLocked) {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockCard}>
          <View style={styles.lockIconCircle}>
            <Text style={styles.lockIconText}>🔒</Text>
          </View>
          <Text style={styles.lockTitle}>Vault Ledger Locked</Text>
          <Text style={styles.lockDesc}>
            Biometric authentication is required to access your financial data.
          </Text>
          <Button
            title="Unlock Vault"
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
    backgroundColor: colors.background,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileLayout: {
    flex: 1,
    flexDirection: 'column',
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
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  lockIconText: {
    fontSize: 24,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  lockDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
});
