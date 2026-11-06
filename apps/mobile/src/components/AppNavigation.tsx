import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, usePathname, useSegments } from 'expo-router';
import { colors, typography, radius } from '../theme/tokens';
import { useAuthStore } from '../store/authStore';
import {
  IconOverview,
  IconTransactions,
  IconRules,
  IconBudgets,
  IconGoals,
  IconActivity,
  type IconProps,
} from './Icons';
import { VaultLogo } from './VaultLogo';

interface NavItem {
  name: string;
  key: string;
  path: string;
  icon: React.FC<IconProps>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', key: 'overview', path: '/(tabs)', icon: IconOverview },
  { name: 'Transactions', key: 'transactions', path: '/(tabs)/transactions', icon: IconTransactions },
  { name: 'Rules', key: 'rules', path: '/(tabs)/rules', icon: IconRules },
  { name: 'Budgets', key: 'budgets', path: '/(tabs)/budgets', icon: IconBudgets },
  { name: 'Goals', key: 'goals', path: '/(tabs)/goals', icon: IconGoals },
  { name: 'Activity', key: 'activity', path: '/(tabs)/activity', icon: IconActivity },
];

export const useActiveTabIndex = (): number => {
  const segments = useSegments();
  const pathname = usePathname();

  // 1. Primary: Check all Expo Router segments
  if (segments && segments.length > 0) {
    for (const seg of segments) {
      if (!seg) continue;
      const cleanSeg = seg.toLowerCase().replace(/^\(/, '').replace(/\)$/, '');
      if (cleanSeg === 'tabs' || cleanSeg === 'index') continue;
      const idx = NAV_ITEMS.findIndex((item) => item.key === cleanSeg);
      if (idx !== -1) return idx;
    }
  }

  // 2. Secondary: Check pathname from hook or window.location
  const rawPath = (pathname || (typeof window !== 'undefined' ? window.location.pathname : '') || '').toLowerCase();

  const clean = rawPath
    .replace(/^\/\(tabs\)/, '')
    .replace(/\/$/, '')
    .replace(/^\//, '');

  if (clean && clean !== 'overview' && clean !== '(tabs)') {
    const directIdx = NAV_ITEMS.findIndex((item) => item.key === clean);
    if (directIdx !== -1) return directIdx;

    for (let i = 1; i < NAV_ITEMS.length; i++) {
      if (rawPath.includes(NAV_ITEMS[i].key)) {
        return i;
      }
    }
  }

  return 0;
};

export const DesktopSidebar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const activeIndex = useActiveTabIndex();
  const [optimisticIndex, setOptimisticIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [activeIndex]);

  const safeActiveIndex = optimisticIndex !== null ? optimisticIndex : (activeIndex >= 0 ? activeIndex : 0);

  return (
    <View nativeID="vl-desktop-sidebar" style={styles.sidebarContainer}>
      <View style={styles.logoRow}>
        <VaultLogo size={34} />
        <Text style={styles.logoTitle}>Vault Ledger</Text>
      </View>

      <View style={styles.navSection}>
        {/* Animated gliding active indicator */}
        <View
          nativeID="vl-desktop-indicator"
          testID="vl-desktop-indicator"
          pointerEvents="none"
          style={[
            styles.sidebarGlidingIndicator,
            Platform.OS === 'web'
              ? ({
                  transform: `translateY(${safeActiveIndex * 48}px)`,
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                  willChange: 'transform',
                  opacity: '1',
                } as any)
              : {
                  transform: [{ translateY: safeActiveIndex * 48 }],
                  opacity: 1,
                },
          ]}
        >
          {/* Subtle Cantaloupe Orange left accent bar */}
          <View style={styles.indicatorAccentBar} />
        </View>

        {NAV_ITEMS.map((item, idx) => {
          const isActive = idx === safeActiveIndex;
          const IconComp = item.icon;

          return (
            <TouchableOpacity
              key={item.path}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              {...(Platform.OS === 'web' ? ({ className: `vl-nav-item ${isActive ? 'vl-nav-item-active' : ''}` } as any) : {})}
              onPress={() => {
                setOptimisticIndex(idx);
                router.push(item.path as any);
              }}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.8}
            >
              <View style={styles.navIconBox}>
                <IconComp
                  size={16}
                  color={isActive ? colors.accent : colors.textTertiary}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </View>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.name}</Text>
              {idx === 0 && (
                <Text style={styles.dashboardHiddenAlias}>Dashboard</Text>
              )}
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
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Sign out of ledger session"
          aria-label="Sign out"
          onPress={logout}
          style={styles.logoutBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MobileTabBar: React.FC = () => {
  const router = useRouter();
  const activeIndex = useActiveTabIndex();
  const [optimisticIndex, setOptimisticIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [activeIndex]);

  const safeActiveIndex = optimisticIndex !== null ? optimisticIndex : (activeIndex >= 0 ? activeIndex : 0);

  return (
    <View nativeID="vl-mobile-tab-bar" style={styles.tabBarContainer}>
      {/* Animated gliding active indicator */}
      <View
        nativeID="vl-mobile-indicator"
        testID="vl-mobile-indicator"
        pointerEvents="none"
        style={[
          styles.mobileGlidingIndicator,
          Platform.OS === 'web'
            ? ({
                transform: `translateX(${safeActiveIndex * 100}%)`,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                willChange: 'transform',
                opacity: '1',
              } as any)
            : {
                transform: [{ translateX: safeActiveIndex * 60 }],
                opacity: 1,
              },
        ]}
      >
        <View style={styles.mobileGlidingBar} />
      </View>

      {NAV_ITEMS.map((item, idx) => {
        const isActive = idx === safeActiveIndex;
        const IconComp = item.icon;

        return (
          <TouchableOpacity
            key={item.path}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            aria-label={item.name}
            aria-current={isActive ? 'page' : undefined}
            onPress={() => {
              setOptimisticIndex(idx);
              router.push(item.path as any);
            }}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <View style={[styles.mobileIconWrap, isActive && styles.mobileIconWrapActive]}>
              <IconComp
                size={16}
                color={isActive ? colors.accent : colors.textTertiary}
                strokeWidth={isActive ? 2 : 1.5}
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
    borderRightWidth: 1,
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
    marginBottom: 28,
    paddingHorizontal: 6,
  },
  logoMonogram: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: 0.5,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 19,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.3,
  },
  navSection: {
    flex: 1,
    gap: 4,
    position: 'relative',
  },
  sidebarGlidingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    zIndex: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorAccentBar: {
    width: 3,
    height: 22,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginLeft: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    zIndex: 1,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'transparent',
  },
  dashboardHiddenAlias: {
    position: 'absolute',
    opacity: 0.01,
    width: 2,
    height: 2,
    overflow: 'hidden',
  },
  navIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
    fontFamily: typography.fontFamily,
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 16,
    gap: 12,
  },
  userBlock: {
    paddingHorizontal: 6,
  },
  userName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  logoutText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  tabBarContainer: {
    height: 60,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    position: 'relative',
  },
  mobileGlidingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '16.666667%',
    height: 2,
    alignItems: 'center',
    zIndex: 10,
  },
  mobileGlidingBar: {
    width: 28,
    height: 2,
    backgroundColor: colors.accent,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  mobileIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  mobileIconWrapActive: {
    backgroundColor: colors.surfaceRaised,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  tabActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
