import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors, typography } from '../theme/tokens';
import { useAuthStore } from '../store/authStore';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', path: '/(tabs)/', icon: '◫' },
  { name: 'Transactions', path: '/(tabs)/transactions', icon: '⇄' },
  { name: 'Rules', path: '/(tabs)/rules', icon: '⚡' },
  { name: 'Budgets', path: '/(tabs)/budgets', icon: '◷' },
  { name: 'Goals', path: '/(tabs)/goals', icon: '◎' },
  { name: 'Activity', path: '/(tabs)/activity', icon: ' bell' },
];

export const DesktopSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.sidebarContainer}>
      <View style={styles.logoRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>VL</Text>
        </View>
        <View>
          <Text style={styles.logoTitle}>VAULT LEDGER</Text>
          <Text style={styles.logoSubtitle}>DOUBLE-ENTRY CORE</Text>
        </View>
      </View>

      <View style={styles.navSection}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path === '/(tabs)/' && (pathname === '/' || pathname === '/(tabs)'));

          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              <Text style={[styles.navIcon, isActive && styles.navTextActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.userBlock}>
          <Text style={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : 'Bryan Thomas'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'demo@vaultledger.local'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MobileTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.tabBarContainer}>
      {NAV_ITEMS.slice(0, 5).map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path === '/(tabs)/' && (pathname === '/' || pathname === '/(tabs)'));

        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => router.push(item.path as any)}
            style={styles.tabItem}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabActive]}>{item.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.tabActive]}>{item.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 240,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    height: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#090A0C',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: typography.fontFamilyMono,
  },
  logoTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.2,
    fontFamily: typography.fontFamily,
  },
  logoSubtitle: {
    color: colors.textTertiary,
    fontSize: 9,
    fontFamily: typography.fontFamilyMono,
    letterSpacing: 0.8,
  },
  navSection: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navItemActive: {
    backgroundColor: colors.surfaceHighlight,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  navIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  navText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  navTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingTop: 16,
    gap: 12,
  },
  userBlock: {
    paddingHorizontal: 8,
  },
  userName: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  userEmail: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: typography.fontFamilyMono,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  logoutText: {
    color: colors.negative,
    fontSize: 12,
    fontWeight: '500',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 18,
    color: colors.textTertiary,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  tabActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
