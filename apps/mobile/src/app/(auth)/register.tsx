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

export default function RegisterScreen() {
  const router = useRouter();
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
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
