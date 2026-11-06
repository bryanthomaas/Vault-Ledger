import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { HairlineDivider } from '../../components/HairlineDivider';
import WayglimBackground from '../../components/WayglimBackground';
import { VaultLogo } from '../../components/VaultLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isCompactHeight = height < 720;

  const { login, loginDemo, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [engine, setEngine] = useState<'css' | 'webgl'>('css');

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      setLoading(true);
      await login({ email, password });
      router.replace('/(tabs)' as any);
    } catch (_err) {
      // Handled by store
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      await loginDemo();
      router.replace('/(tabs)' as any);
    } catch (_err) {
      // Handled by store
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.rootContainer}
    >
      {/* Animated Background */}
      {Platform.OS === 'web' ? (
        <WayglimBackground layout="fill" engine={engine} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0B14' }]} />
      )}

      {/* Atmospheric Dark Scrim for strict dark mode & maximum contrast */}
      <View style={styles.darkScrim} pointerEvents="none" />

      {/* Responsive Container: Asymmetric 2-Column Desktop Split vs Compact Mobile Stack */}
      <View
        style={[
          styles.contentWrapper,
          isDesktop ? styles.contentWrapperDesktop : styles.contentWrapperMobile,
        ]}
      >
        {/* LEFT COLUMN (Desktop) / UPPER SECTION (Mobile): Brand Explainer & Value Proposition */}
        <View
          style={[
            styles.explainerColumn,
            isDesktop ? styles.explainerDesktop : styles.explainerMobile,
          ]}
        >
          {/* Minimalist Monogram + Brand Title */}
          <View
            style={[
              styles.brandHeader,
              isDesktop ? styles.brandHeaderDesktop : styles.brandHeaderMobile,
            ]}
          >
            <VaultLogo size={isDesktop ? 52 : 36} variant="mark" />
            <Text
              style={[
                styles.brandTitle,
                isDesktop ? styles.brandTitleDesktop : styles.brandTitleMobile,
              ]}
            >
              Vault Ledger
            </Text>
          </View>

          {/* Clear, Human Headline */}
          <Text
            style={[
              styles.brandHeadline,
              isDesktop ? styles.brandHeadlineDesktop : styles.brandHeadlineMobile,
            ]}
          >
            Track your accounts, spending, and savings in one place.
          </Text>

          {/* Real, concise explanation of what the website does */}
          <Text
            style={[
              styles.valueProposition,
              isDesktop ? styles.valuePropositionDesktop : styles.valuePropositionMobile,
            ]}
          >
            Vault Ledger brings your checking, savings, investment, and credit card balances into a
            single dashboard. Log transactions, set monthly category budgets, and create simple
            rules that automatically set aside money for your savings goals.
          </Text>

          {/* Plain-English overview of the application sections */}
          {isDesktop ? (
            <View style={styles.overviewListDesktop}>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Accounts & Transactions</Text>
                <Text style={styles.overviewText}>
                  View your net worth and filter transactions across checking, savings, and cards.
                </Text>
              </View>
              <View style={styles.overviewRow}>
                <Text style={styles.overviewLabel}>Automatic Savings Rules</Text>
                <Text style={styles.overviewText}>
                  Round up everyday purchases to the nearest dollar or save a set share of each paycheck.
                </Text>
              </View>
              <View style={[styles.overviewRow, styles.overviewRowLast]}>
                <Text style={styles.overviewLabel}>Budgets & Goals</Text>
                <Text style={styles.overviewText}>
                  Set monthly spending limits by category and track progress toward upcoming goals.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.capabilityRowMobile}>
              <Text style={styles.mobileSummaryText}>
                Accounts · Transactions · Savings Rules · Monthly Budgets
              </Text>
            </View>
          )}
        </View>

        {/* RIGHT COLUMN (Desktop) / LOWER SECTION (Mobile): Frosted Auth Card */}
        <View
          style={[
            styles.cardColumn,
            isDesktop ? styles.cardColumnDesktop : styles.cardColumnMobile,
          ]}
        >
          {/* Quiet Frosted Card */}
          <View
            style={[
              styles.cardContainer,
              !isDesktop && styles.cardContainerMobile,
              isCompactHeight && styles.cardContainerCompact,
            ]}
          >
            {error && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Dismiss error notification"
                onPress={clearError}
                style={styles.errorBanner}
                activeOpacity={0.8}
              >
                <Text style={styles.errorText}>{error}</Text>
              </TouchableOpacity>
            )}

            {/* Primary Action: 1-Click Demo Sandbox */}
            <Button
              title="Explore demonstration ledger"
              onPress={handleDemoLogin}
              loading={demoLoading}
              variant="primary"
              size={isDesktop ? 'lg' : 'md'}
              style={styles.demoBtn}
            />

            {/* Hairline Divider */}
            <View style={[styles.dividerRow, !isDesktop && styles.dividerRowMobile]}>
              <HairlineDivider style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or</Text>
              <HairlineDivider style={styles.dividerLine} />
            </View>

            {/* Direct Credentials Fields */}
            <View style={[styles.formFields, !isDesktop && styles.formFieldsMobile]}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, !isDesktop && styles.inputMobile]}
                  placeholder="auditor@vaultledger.local"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (error) clearError();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[styles.input, !isDesktop && styles.inputMobile]}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (error) clearError();
                  }}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <Button
                title="Sign in"
                onPress={handleLogin}
                loading={loading}
                variant="outline"
                size="md"
                style={styles.submitBtn}
              />
            </View>

            {/* Secondary Action */}
            <View style={[styles.footerRow, !isDesktop && styles.footerRowMobile]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Create account"
                onPress={() => router.push('/(auth)/register' as any)}
                style={styles.footerLinkTouch}
              >
                <Text style={styles.footerLinkText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Refined Tactile Engine Switcher */}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Rendering engine is ${engine.toUpperCase()}. Press to toggle between CSS Hardware Acceleration and WebGL 2 Canvas.`}
              aria-pressed={engine === 'webgl'}
              {...({ className: 'vl-engine-badge' } as any)}
              onPress={() => setEngine(e => (e === 'css' ? 'webgl' : 'css'))}
              style={[styles.engineBadge, !isDesktop && styles.engineBadgeMobile]}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.engineStatusDot,
                  engine === 'webgl' ? styles.engineStatusDotWebgl : styles.engineStatusDotCss,
                ]}
              />
              <Text style={styles.engineBadgeText}>
                {engine === 'css' ? 'CSS Hardware Mode · Switch to WebGL' : 'WebGL Canvas Mode · Switch to CSS'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#0A0B14',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
        } as any)
      : {}),
  },
  darkScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 20, 0.28)',
    zIndex: 1,
  },
  contentWrapper: {
    width: '100%',
    zIndex: 2,
  },
  contentWrapperDesktop: {
    flexDirection: 'row',
    maxWidth: 1040,
    paddingHorizontal: 36,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 48,
  },
  contentWrapperMobile: {
    flexDirection: 'column',
    maxWidth: 420,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },

  /* Explainer Column / Section */
  explainerColumn: {
    zIndex: 2,
  },
  explainerDesktop: {
    flex: 1.15,
    maxWidth: 480,
    alignItems: 'flex-start',
  },
  explainerMobile: {
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },

  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandHeaderDesktop: {
    gap: 12,
    marginBottom: 12,
  },
  brandHeaderMobile: {
    gap: 8,
    marginBottom: 6,
  },
  brandTitle: {
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  brandTitleDesktop: {
    fontSize: 34,
    lineHeight: 40,
  },
  brandTitleMobile: {
    fontSize: 24,
    lineHeight: 28,
  },

  brandHeadline: {
    fontFamily: typography.fontFamilySerif,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandHeadlineDesktop: {
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 10,
    textAlign: 'left',
  },
  brandHeadlineMobile: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 6,
    textAlign: 'center',
  },

  valueProposition: {
    fontFamily: typography.fontFamily,
    color: 'rgba(244, 244, 248, 0.86)',
  },
  valuePropositionDesktop: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'left',
  },
  valuePropositionMobile: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  /* Desktop Editorial Overview List */
  overviewListDesktop: {
    width: '100%',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 90, 31, 0.55)',
    paddingLeft: 16,
    gap: 14,
  },
  overviewRow: {
    gap: 2,
  },
  overviewRowLast: {
    marginBottom: 0,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: typography.fontFamily,
    lineHeight: 18,
  },
  overviewText: {
    fontSize: 13,
    color: 'rgba(232, 232, 240, 0.72)',
    fontFamily: typography.fontFamily,
    lineHeight: 19,
  },

  /* Mobile Summary Row */
  capabilityRowMobile: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mobileSummaryText: {
    fontSize: 11,
    color: 'rgba(232, 232, 240, 0.72)',
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },

  /* Card Column */
  cardColumn: {
    zIndex: 2,
  },
  cardColumnDesktop: {
    flex: 0.95,
    maxWidth: 410,
    width: '100%',
  },
  cardColumnMobile: {
    width: '100%',
    alignItems: 'center',
  },

  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(18, 19, 36, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(141, 141, 245, 0.22)',
    borderRadius: radius.lg,
    padding: 22,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.75)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        } as any)
      : {}),
  },
  cardContainerMobile: {
    padding: 16,
  },
  cardContainerCompact: {
    padding: 14,
  },
  errorBanner: {
    backgroundColor: 'rgba(232, 36, 60, 0.14)',
    borderWidth: 1,
    borderColor: colors.negative,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#FF7070',
    fontSize: 12,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  demoBtn: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(255, 90, 31, 0.35)',
        } as any)
      : {}),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  dividerRowMobile: {
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    opacity: 0.25,
  },
  dividerLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  formFields: {
    gap: 10,
    width: '100%',
  },
  formFieldsMobile: {
    gap: 8,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  input: {
    height: 40,
    backgroundColor: 'rgba(10, 11, 22, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(141, 141, 245, 0.22)',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
        } as any)
      : {}),
  },
  inputMobile: {
    height: 36,
    fontSize: 12,
  },
  submitBtn: {
    width: '100%',
    marginTop: 4,
    borderColor: 'rgba(141, 141, 245, 0.35)',
    backgroundColor: 'rgba(26, 28, 54, 0.65)',
    borderRadius: radius.sm,
  },
  submitBtnMobile: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  footerRowMobile: {
    marginTop: 10,
  },
  footerLinkTouch: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  footerLinkText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  engineBadge: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 19, 36, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(141, 141, 245, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
  },
  engineBadgeMobile: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  engineStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  engineStatusDotCss: {
    backgroundColor: colors.accent,
  },
  engineStatusDotWebgl: {
    backgroundColor: colors.irisViolet,
  },
  engineBadgeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.2,
  },
  engineBadgePrefix: {
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
    fontSize: 10,
    fontWeight: '600',
  },
  engineBadgeHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: typography.fontFamilyMono,
    fontSize: 11,
  },
  engineBadgeAction: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
