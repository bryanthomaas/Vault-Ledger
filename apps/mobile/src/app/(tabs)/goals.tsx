import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PaginationBar } from '../../components/PaginationBar';
import { formatCurrency, type Goal, type Account } from '@vault-ledger/shared';

export default function GoalsScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetDollars, setTargetDollars] = useState('10000');
  const [targetDate, setTargetDate] = useState('2027-12-31');

  const goalsQuery = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => apiRequest('/api/goals'),
  });

  const accountsQuery = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => apiRequest('/api/accounts'),
  });

  const vaultAccount = accountsQuery.data?.find((a) => a.type === 'vault');

  const createGoalMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setModalVisible(false);
      setGoalName('');
    },
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, amountCents }: { id: string; amountCents: number }) =>
      apiRequest(`/api/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ contributeAmountCents: amountCents }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/goals/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleCreateGoal = () => {
    if (!goalName || !vaultAccount) return;
    const targetCents = (parseFloat(targetDollars) || 5000) * 100;

    createGoalMutation.mutate({
      name: goalName,
      vaultAccountId: vaultAccount.id,
      targetAmountCents: targetCents,
      targetDate: targetDate || null,
    });
  };

  const goalsList = Array.isArray(goalsQuery.data) ? goalsQuery.data : [];
  const PAGE_SIZE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(goalsList.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedGoals = goalsList.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Savings goals</Text>
            <Text style={styles.subtitle}>
              Dedicated reserve targets and accumulated savings balances
            </Text>
          </View>

          <Button
            title="+ New goal"
            onPress={() => setModalVisible(true)}
            variant="primary"
            size="sm"
          />
        </View>

        {goalsQuery.isLoading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.goalsGrid}>
            {goalsList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Reserve Targets Set</Text>
                <Text style={styles.emptyDesc}>
                  Establish target reserve balances to monitor accumulated savings.
                </Text>
                <Button
                  title="Create First Goal"
                  onPress={() => setModalVisible(true)}
                  variant="outline"
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : (
              paginatedGoals.map((g) => {
                const current = g.currentAmountCents;
                const target = g.targetAmountCents;
                const percent = Math.min(100, Math.round((current / (target || 1)) * 100));
                const progressColor =
                  percent >= 100
                    ? colors.positive
                    : percent >= 75
                      ? colors.accentGold
                      : percent >= 40
                        ? colors.accent
                        : colors.irisViolet;

                return (
                  <View key={g.id} style={styles.goalCard}>
                    <View style={styles.cardTop}>
                      <View style={{ gap: 4 }}>
                        <Text style={styles.goalName}>{g.name}</Text>
                        {g.targetDate && (
                          <Text style={styles.dateText}>Target Date: {g.targetDate}</Text>
                        )}
                      </View>
                      <Badge
                        label={`${percent}% funded`}
                        variant={percent >= 100 ? 'positive' : percent >= 75 ? 'warning' : 'accent'}
                        style={percent < 40 ? { color: colors.irisViolet } : undefined}
                      />
                    </View>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${percent}%`, backgroundColor: progressColor },
                        ]}
                      />
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={[styles.currentAmount, { color: progressColor }]}>
                        Current: {formatCurrency(current)}
                      </Text>
                      <Text style={styles.targetAmount}>Target: {formatCurrency(target)}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel="+ $100"
                          aria-label="+ $100"
                          onPress={() => contributeMutation.mutate({ id: g.id, amountCents: 10000 })}
                          style={{ backgroundColor: colors.accentSubtle, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 }}
                        >
                          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', fontFamily: typography.fontFamily }}>
                            + $100
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel="+ $500"
                          aria-label="+ $500"
                          onPress={() => contributeMutation.mutate({ id: g.id, amountCents: 50000 })}
                          style={{ backgroundColor: colors.accentSubtle, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 }}
                        >
                          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', fontFamily: typography.fontFamily }}>
                            + $500
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Delete"
                        aria-label="Delete"
                        onPress={() => deleteGoalMutation.mutate(g.id)}
                        style={{ paddingVertical: 4, paddingHorizontal: 6 }}
                      >
                        <Text style={{ color: colors.negative, fontSize: 13, fontWeight: '600', fontFamily: typography.fontFamily }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      <PaginationBar
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={goalsList.length}
        pageSize={PAGE_SIZE}
      />

      {/* New Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View nativeID="vl-modal-backdrop" style={styles.modalBackdrop}>
          <View nativeID="vl-modal-card" style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Savings Goal</Text>
            <Text style={styles.modalDesc}>
              Define a target balance backed by your reserve savings account.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 6-Month Emergency Reserve"
                placeholderTextColor={colors.textTertiary}
                value={goalName}
                onChangeText={setGoalName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                value={targetDollars}
                onChangeText={setTargetDollars}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2027-12-31"
                placeholderTextColor={colors.textTertiary}
                value={targetDate}
                onChangeText={setTargetDate}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Create Goal"
                onPress={handleCreateGoal}
                variant="primary"
                loading={createGoalMutation.isPending}
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
  goalsGrid: {
    gap: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    gap: 12,
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
    ...typography.tabular,
  },
  targetAmount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        } as any)
      : {}),
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 360,
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
    maxWidth: 420,
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
