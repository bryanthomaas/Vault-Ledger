import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { Button } from '../../components/Button';
import WayglimBackground from '../../components/WayglimBackground';
import { VaultLogo } from '../../components/VaultLogo';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<'css' | 'webgl'>('css');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) return;
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password });
      router.replace('/(tabs)' as any);
    } catch (_err) {
      // Handled in store
    } finally {
      setLoading(false);
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

      {/* Atmospheric Dark Scrim */}
      <View style={styles.darkScrim} pointerEvents="none" />

      {/* Centered Monolith Content */}
      <View style={styles.contentWrap}>
        {/* Large, Authoritative, Readable Title with Minimalist Monogram */}
        <View style={styles.titleContainer}>
          <VaultLogo size={52} variant="mark" style={{ marginBottom: 16 }} />
          <Text style={styles.brandTitle}>Vault Ledger</Text>
          <Text style={styles.brandSubtitle}>Create ledger account</Text>
        </View>

        {/* Quiet Frosted Card */}
        <View style={styles.cardContainer}>
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

          <View style={styles.formFields}>
            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>First name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bryan"
                  placeholderTextColor={colors.textTertiary}
                  value={firstName}
                  onChangeText={(t) => {
                    setFirstName(t);
                    if (error) clearError();
                  }}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Last name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Thomas"
                  placeholderTextColor={colors.textTertiary}
                  value={lastName}
                  onChangeText={(t) => {
                    setLastName(t);
                    if (error) clearError();
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
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
                style={styles.input}
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
              title="Create account"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="md"
              style={styles.submitBtn}
            />
          </View>

          {/* Secondary Action */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Already have an account? Sign in"
              onPress={() => router.push('/(auth)/login' as any)}
              style={styles.footerLinkTouch}
            >
              <Text style={styles.footerLinkText}>Already have an account? Sign in</Text>
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
            style={styles.engineBadge}
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
    backgroundColor: 'rgba(10, 11, 20, 0.25)',
    zIndex: 1,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
    textAlign: 'center',
    ...(Platform.OS === 'web'
      ? ({
          textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)',
        } as any)
      : {}),
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(18, 19, 36, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(141, 141, 245, 0.22)',
    borderRadius: radius.lg,
    padding: 22,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        } as any)
      : {}),
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
  formFields: {
    gap: 10,
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
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
  submitBtn: {
    width: '100%',
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(255, 90, 31, 0.35)',
        } as any)
      : {}),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
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
    marginTop: 18,
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
