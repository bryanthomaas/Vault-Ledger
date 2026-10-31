import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatCurrency, type Rule, type Account } from '@vault-ledger/shared';

export default function RulesScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [ruleType, setRuleType] = useState<'round_up' | 'percent_of_income' | 'sweep'>('round_up');
  const [ruleName, setRuleName] = useState('');
  const [percent, setPercent] = useState('10');
  const [threshold, setThreshold] = useState('5000');

  const rulesQuery = useQuery<Rule[]>({
    queryKey: ['rules'],
    queryFn: () => apiRequest('/api/rules'),
  });

  const accountsQuery = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => apiRequest('/api/accounts'),
  });

  const vaultAccount = accountsQuery.data?.find((a) => a.type === 'vault');
  const checkingAccount = accountsQuery.data?.find((a) => a.type === 'depository');

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiRequest(`/api/rules/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/api/rules', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setModalVisible(false);
      setRuleName('');
    },
  });

  const handleCreateRule = () => {
    if (!vaultAccount || !checkingAccount) return;

    let config: any = {
      destinationAccountId: vaultAccount.id,
      sourceAccountId: checkingAccount.id,
    };

    if (ruleType === 'round_up') {
      config.multiplier = 1;
    } else if (ruleType === 'percent_of_income') {
      config.percentage = parseInt(percent, 10) || 10;
    } else if (ruleType === 'sweep') {
      config.thresholdCents = (parseInt(threshold, 10) || 5000) * 100;
    }

    createMutation.mutate({
      name:
        ruleName ||
        (ruleType === 'round_up'
          ? 'Coffee Round-Ups'
          : ruleType === 'percent_of_income'
            ? 'Paycheck Allocation'
            : 'Cash Sweep'),
      type: ruleType,
      enabled: true,
      config,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>AUTOMATION RULES</Text>
          <Text style={styles.subtitle}>Event-driven ledger workers & algorithmic transfers</Text>
        </View>

        <Button
          title="+ New Rule"
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Rules Explanatory Banner */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Deterministic Outbox Architecture</Text>
        <Text style={styles.infoText}>
          When transactions are ingested, worker threads evaluate enabled rules asynchronously.
          Transfers are executed as atomic double-entry postings with strict idempotency
          constraints.
        </Text>
      </View>

      {rulesQuery.isLoading ? (
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.rulesList}>
          {(Array.isArray(rulesQuery.data) ? rulesQuery.data : []).map((rule) => {
            const isRoundUp = rule.type === 'round_up';
            const isPercent = rule.type === 'percent_of_income';
            const isSweep = rule.type === 'sweep';

            let description = '';
            if (isRoundUp) {
              description =
                'Rounds up everyday expenses to the nearest dollar and transfers spare change into Savings Vault.';
            } else if (isPercent) {
              const cfg = rule.config as any;
              description = `Automatically sweeps ${cfg.percentage || 10}% of any detected salary or income into Savings Vault.`;
            } else if (isSweep) {
              const cfg = rule.config as any;
              description = `Sweeps checking balance in excess of ${formatCurrency(cfg.thresholdCents || 500000)} into Savings Vault.`;
            }

            return (
              <View key={rule.id} style={styles.ruleCard}>
                <View style={styles.cardTopRow}>
                  <View style={{ gap: 4, flex: 1, marginRight: 12 }}>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Badge
                      label={rule.type.replace(/_/g, ' ').toUpperCase()}
                      variant={rule.enabled ? 'accent' : 'default'}
                    />
                  </View>

                  <Switch
                    value={rule.enabled}
                    onValueChange={(val) => toggleMutation.mutate({ id: rule.id, enabled: val })}
                    trackColor={{ false: colors.surfaceHighlight, true: colors.accentSubtle }}
                    thumbColor={rule.enabled ? colors.accent : colors.textTertiary}
                  />
                </View>

                <Text style={styles.ruleDescription}>{description}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Create Rule Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Configure Automation Rule</Text>
            <Text style={styles.modalDesc}>
              Set up automated background rules executed by the transactional outbox worker.
            </Text>

            <View style={styles.tabRow}>
              {(['round_up', 'percent_of_income', 'sweep'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setRuleType(t)}
                  style={[styles.typeBtn, ruleType === t && styles.typeBtnActive]}
                >
                  <Text style={[styles.typeBtnText, ruleType === t && styles.typeBtnTextActive]}>
                    {t === 'round_up'
                      ? 'Round-Up'
                      : t === 'percent_of_income'
                        ? 'Income %'
                        : 'Sweep'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>RULE NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Daily Coffee Round-Up"
                placeholderTextColor={colors.textTertiary}
                value={ruleName}
                onChangeText={setRuleName}
              />
            </View>

            {ruleType === 'percent_of_income' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>PERCENTAGE TO SAVE (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                  value={percent}
                  onChangeText={setPercent}
                />
              </View>
            )}

            {ruleType === 'sweep' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>CHECKING CEILING THRESHOLD ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5000"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                  value={threshold}
                  onChangeText={setThreshold}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Save Rule"
                onPress={handleCreateRule}
                variant="primary"
                loading={createMutation.isPending}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
    fontFamily: typography.fontFamilyMono,
    marginBottom: 4,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  rulesList: {
    gap: spacing.md,
  },
  ruleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.lg,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ruleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 6,
    padding: 3,
    marginBottom: spacing.md,
    gap: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  typeBtnText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },
  typeBtnTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
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
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.md,
  },
});
