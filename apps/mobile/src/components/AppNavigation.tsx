import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors, typography, leafRadius } from '../theme/tokens';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from './ThemeToggle';
import {
  IconOverview,
  IconTransactions,
  IconRules,
  IconBudgets,
  IconGoals,
  IconActivity,
  type IconProps,
} from './Icons';

interface NavItem {
  name: string;
  path: string;
  icon: React.FC<IconProps>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', path: '/(tabs)/', icon: IconOverview },
  { name: 'Transactions', path: '/(tabs)/transactions', icon: IconTransactions },
  { name: 'Rules', path: '/(tabs)/rules', icon: IconRules },
  { name: 'Budgets', path: '/(tabs)/budgets', icon: IconBudgets },
  { name: 'Goals', path: '/(tabs)/goals', icon: IconGoals },
  { name: 'Activity', path: '/(tabs)/activity', icon: IconActivity },
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
          const IconComp = item.icon;

          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              <View style={styles.navIconBox}>
                <IconComp
                  size={18}
                  color={isActive ? colors.accent : colors.textSecondary}
                  strokeWidth={isActive ? 2 : 1.75}
                />
              </View>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <ThemeToggle variant="button" style={styles.themeToggleBtn} />
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
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path === '/(tabs)/' && (pathname === '/' || pathname === '/(tabs)'));
        const IconComp = item.icon;

        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => router.push(item.path as any)}
            style={styles.tabItem}
          >
            <View style={[styles.mobileIconWrap, isActive && styles.mobileIconWrapActive]}>
              <IconComp
                size={18}
                color={isActive ? colors.accent : colors.textTertiary}
                strokeWidth={isActive ? 2 : 1.75}
              />
            </View>
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
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#285430',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: typography.fontFamilyMono,
  },
  logoTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.1,
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
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: colors.accentSubtle,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 10,
  },
  navIconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  navTextActive: {
    color: colors.accent,
    fontWeight: '700',
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
    fontFamily: typography.fontFamily,
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
    fontWeight: '600',
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
    gap: 3,
  },
  mobileIconWrap: {
    padding: 4,
    borderRadius: 8,
  },
  themeToggleBtn: {
    marginBottom: 12,
  },
  mobileIconWrapActive: {
    backgroundColor: colors.accentSubtle,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  tabActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
