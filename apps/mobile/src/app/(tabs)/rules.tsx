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
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PaginationBar } from '../../components/PaginationBar';
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

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/rules/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  // Test execution mutation
  const testExecutionMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Espresso (Automated Round-Up Test)',
          merchant: 'Artisan Roasters',
          amountCents: -425,
          category: 'Coffee',
          isRoundUp: true,
          source: 'rule_execution',
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

  const rulesList = Array.isArray(rulesQuery.data) ? rulesQuery.data : [];
  const PAGE_SIZE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rulesList.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRules = rulesList.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Automation rules</Text>
            <Text style={styles.subtitle}>Automated balance sweeps & transfer rules</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title={testExecutionMutation.isPending ? 'Simulating...' : 'Test Execution'}
              onPress={() => testExecutionMutation.mutate()}
              loading={testExecutionMutation.isPending}
              variant="outline"
              size="sm"
            />
            <Button
              title="+ New rule"
              onPress={() => setModalVisible(true)}
              variant="primary"
              size="sm"
            />
          </View>
        </View>

        {/* Rules Explanatory Banner */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Automated posting policy</Text>
          <Text style={styles.infoText}>
            Posted transactions trigger automated transfers between accounts. All executions
            record balanced ledger postings with audit verification.
          </Text>
        </View>

        {testExecutionMutation.isSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              Rule executed: $0.75 round-up transaction posted and transferred to Reserve Savings.
            </Text>
          </View>
        )}

        {rulesQuery.isLoading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.rulesList}>
            {paginatedRules.map((rule) => {
              const isRoundUp = rule.type === 'round_up';
              const isPercent = rule.type === 'percent_of_income';
              const isSweep = rule.type === 'sweep';

              let description = '';
              if (isRoundUp) {
                description =
                  'Rounds up purchase debits to the nearest dollar and posts the difference to Reserve Savings.';
              } else if (isPercent) {
                const cfg = rule.config as any;
                description = `Allocates ${cfg.percentage || 10}% of income credits into Reserve Savings.`;
              } else if (isSweep) {
                const cfg = rule.config as any;
                description = `Sweeps checking balance in excess of ${formatCurrency(cfg.thresholdCents || 500000)} into Reserve Savings.`;
              }

              return (
                <View key={rule.id} style={styles.ruleCard}>
                  <View style={styles.cardTopRow}>
                    <View style={{ gap: 4, flex: 1, marginRight: 12 }}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      <Badge
                        label={
                          rule.type === 'round_up'
                            ? 'Round-up'
                            : rule.type === 'percent_of_income'
                              ? 'Income %'
                              : 'Sweep'
                        }
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

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      aria-label="Delete rule"
                      onPress={() => deleteRuleMutation.mutate(rule.id)}
                      style={{ paddingVertical: 4, paddingHorizontal: 8 }}
                    >
                      <Text style={{ color: colors.negative, fontSize: 13, fontWeight: '600', fontFamily: typography.fontFamily }}>
                        Delete rule
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <PaginationBar
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={rulesList.length}
        pageSize={PAGE_SIZE}
      />

      {/* Create Rule Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View nativeID="vl-modal-backdrop" style={styles.modalBackdrop}>
          <View nativeID="vl-modal-card" style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Automation Rule</Text>
            <Text style={styles.modalDesc}>
              Configure automated transfer postings between ledger accounts.
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
              <Text style={styles.label}>Rule name</Text>
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
                <Text style={styles.label}>Income allocation (%)</Text>
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
                <Text style={styles.label}>Operating balance ceiling ($)</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 13,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  rulesList: {
    gap: spacing.md,
  },
  ruleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    gap: 8,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        } as any)
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 2,
        }),
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
    backgroundColor: 'rgba(10, 11, 20, 0.75)',
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
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        } as any)
      : {}),
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
  successBanner: {
    backgroundColor: 'rgba(141, 141, 245, 0.10)',
    borderWidth: 1,
    borderColor: colors.electricBlue,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: 13,
    color: colors.electricBlue,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
});
