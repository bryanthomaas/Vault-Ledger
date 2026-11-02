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
import { colors, typography, spacing } from '../../theme/tokens';
import { Button } from '../../components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const { register, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) return;
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password });
      router.replace('/(tabs)/');
    } catch (_err) {
      // Handled in store
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={[styles.mainWrapper, isDesktop && styles.desktopSplit]}>
        {/* Editorial Real Photography Hero Column */}
        {isDesktop && (
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
                <Text style={styles.heroTagline}>Your Personal Financial Sovereign Vault</Text>
                <Text style={styles.heroSubtitle}>
                  Every dollar accounted for through strict double-entry verification. Seamlessly
                  bridge checking liquidity with automated wealth accumulation.
                </Text>
              </View>
              <View style={styles.heroPillRow}>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Double-Entry Invariants</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Automated Outbox</Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
            <Text style={styles.headline}>Create Ledger</Text>
            <Text style={styles.subtext}>Initialize your personal double-entry vault.</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>FIRST NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bryan"
                  placeholderTextColor={colors.textTertiary}
                  value={firstName}
                  onChangeText={(t) => {
                    clearError();
                    setFirstName(t);
                  }}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>LAST NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Thomas"
                  placeholderTextColor={colors.textTertiary}
                  value={lastName}
                  onChangeText={(t) => {
                    clearError();
                    setLastName(t);
                  }}
                />
              </View>
            </View>

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
              <Text style={styles.label}>PASSWORD (MIN 8 CHARACTERS)</Text>
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
              title="Create Vault Account"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              style={{ marginTop: 12 }}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
                <Text style={styles.footerLink}>Sign In</Text>
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
    ...StyleSheet.absoluteFillObject,
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
    ...StyleSheet.absoluteFillObject,
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
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
