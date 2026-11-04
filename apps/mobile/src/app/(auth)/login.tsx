import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, leafRadius } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { HairlineDivider } from '../../components/HairlineDivider';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const { login, loginDemo, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      setLoading(true);
      await login({ email, password });
      router.replace('/(tabs)/');
    } catch (_err) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      await loginDemo();
      router.replace('/(tabs)/');
    } catch (_err) {
      // Error handled by store
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={[styles.mainWrapper, isDesktop && styles.desktopSplit]}>
        {/* Editorial Real Photography Hero Column */}
        {isDesktop ? (
          <View style={styles.heroColumn}>
            <Image
              source={require('../../../assets/images/auth-hero.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroBrandRow}>
                <View style={styles.heroLogoBadge}>
                  <Text style={styles.heroLogoText}>VL</Text>
                </View>
                <Text style={styles.heroBrandTitle}>VAULT LEDGER</Text>
              </View>
              <View style={styles.heroTextGroup}>
                <Text style={styles.heroTagline}>
                  Precision Double-Entry Engineering Meets Natural Balance
                </Text>
                <Text style={styles.heroSubtitle}>
                  Institutional-grade personal finance with cryptographic ledger invariant checks,
                  algorithmic liquidity rules, and 6-month Monte Carlo forecasting.
                </Text>
              </View>
              <View style={styles.heroPillRow}>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Travertine Canvas</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Botanical Emerald Core</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Offline Sandboxed</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Auth Form Column */}
        <ScrollView
          style={[styles.scrollColumn, isDesktop && { flex: 1.1 }]}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Mobile Hero Banner */}
          {!isDesktop && (
            <View style={styles.mobileHeroBanner}>
              <Image
                source={require('../../../assets/images/auth-hero.jpg')}
                style={styles.mobileHeroImage}
                resizeMode="cover"
              />
              <View style={styles.mobileHeroOverlay}>
                <Text style={styles.mobileHeroTitle}>VAULT LEDGER</Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            {/* Brand Mark & Theme Toggle */}
            <View style={styles.brandRow}>
              <View style={styles.brandLeft}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>VL</Text>
                </View>
                <View>
                  <Text style={styles.brandTitle}>VAULT LEDGER</Text>
                  <Text style={styles.brandSubtitle}>DOUBLE-ENTRY CORE</Text>
                </View>
              </View>
              <ThemeToggle variant="icon" />
            </View>

            <Text style={styles.headline}>Sign In</Text>
            <Text style={styles.subtext}>
              Enter your credentials or launch the live sandboxed portfolio.
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Quick Sandbox Demo Action */}
            <View style={styles.demoBox}>
              <View style={styles.demoHeaderRow}>
                <View style={styles.demoPulseDot} />
                <Text style={styles.demoTitle}>Recruiter & Reviewer Sandbox</Text>
              </View>
              <Text style={styles.demoDesc}>
                Instant zero-friction access with 18 months of seeded double-entry transactions,
                active rules, and Monte Carlo net worth projection.
              </Text>
              <Button
                title="Launch Live Demo Sandbox →"
                onPress={handleDemoLogin}
                loading={demoLoading}
                variant="primary"
                style={styles.demoBtn}
              />
            </View>

            <View style={styles.dividerRow}>
              <HairlineDivider style={{ flex: 1 }} />
              <Text style={styles.orText}>OR EMAIL SIGN IN</Text>
              <HairlineDivider style={{ flex: 1 }} />
            </View>

            {/* Email / Password Form */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="you@domain.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={(t) => {
                  clearError();
                  setEmail(t);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={(t) => {
                  clearError();
                  setPassword(t);
                }}
                secureTextEntry
              />
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              variant="secondary"
              style={{ marginTop: 8 }}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
  mainWrapper: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
  desktopSplit: {
    flexDirection: 'row',
  },
  heroColumn: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 24, 20, 0.45)',
    padding: spacing.xxl,
    justifyContent: 'space-between',
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 16,
    fontFamily: typography.fontFamilyMono,
  },
  heroBrandTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  heroTextGroup: {
    maxWidth: 520,
    gap: 16,
  },
  heroTagline: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FAF6F0',
    lineHeight: 42,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#EAE1D5',
    lineHeight: 24,
    fontFamily: typography.fontFamily,
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mobileHeroBanner: {
    width: '100%',
    height: 140,
    position: 'relative',
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mobileHeroImage: {
    width: '100%',
    height: '100%',
  },
  mobileHeroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 24, 20, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileHeroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 2,
    fontFamily: typography.fontFamily,
  },
  scrollColumn: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: '#2D261E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
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
  brandBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: typography.fontFamilyMono,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.1,
    fontFamily: typography.fontFamily,
  },
  brandSubtitle: {
    color: colors.textTertiary,
    fontSize: 9,
    fontFamily: typography.fontFamilyMono,
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
    fontFamily: typography.fontFamily,
  },
  demoBox: {
    backgroundColor: colors.accentSubtle,
    borderWidth: 1.25,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  demoPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.positive,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  demoDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily,
  },
  demoBtn: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  orText: {
    fontSize: 10,
    fontFamily: typography.fontFamilyMono,
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  formGroup: {
    marginBottom: spacing.md,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textTertiary,
    fontSize: 13,
    fontFamily: typography.fontFamily,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  errorBox: {
    backgroundColor: colors.negativeSubtle,
    borderWidth: 1,
    borderColor: colors.negative,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.negative,
    fontSize: 12,
    fontWeight: '500',
  },
});
