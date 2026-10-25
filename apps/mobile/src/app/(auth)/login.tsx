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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { HairlineDivider } from '../../components/HairlineDivider';

export default function LoginScreen() {
  const router = useRouter();
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Brand Mark */}
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>VL</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>VAULT LEDGER</Text>
              <Text style={styles.brandSubtitle}>DOUBLE-ENTRY CORE</Text>
            </View>
          </View>

          <Text style={styles.headline}>Sign In</Text>
          <Text style={styles.subtext}>Enter your credentials or try the live demo session.</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Quick Recruiter Demo Action */}
          <View style={styles.demoBox}>
            <View style={styles.demoHeaderRow}>
              <View style={styles.demoPulseDot} />
              <Text style={styles.demoTitle}>Recruiter & Reviewer Sandbox</Text>
            </View>
            <Text style={styles.demoDesc}>
              Instant access with 18 months of seeded double-entry transactions, active savings rules, and Monte Carlo forecast.
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#090A0C',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: typography.fontFamilyMono,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    color: colors.textTertiary,
    fontSize: 9,
    fontFamily: typography.fontFamilyMono,
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  demoBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 224, 0.25)',
    borderRadius: 8,
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
    backgroundColor: colors.accent,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.4,
  },
  demoDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  demoBtn: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: 12,
  },
  orText: {
    fontSize: 10,
    fontFamily: typography.fontFamilyMono,
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontFamily: typography.fontFamilyMono,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  errorBox: {
    backgroundColor: colors.negativeSubtle,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 6,
    padding: 10,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.negative,
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
