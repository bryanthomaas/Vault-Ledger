import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>SAVINGS GOALS</Text>
          <Text style={styles.subtitle}>
            Ring-fenced vault targets backed by atomic ledger transfers
          </Text>
        </View>

        <Button
          title="+ New Goal"
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
              <Text style={styles.emptyTitle}>No Savings Goals Created</Text>
              <Text style={styles.emptyDesc}>
                Set a milestone goal (e.g. Emergency Fund or Travel Vault) to monitor accumulated
                transfers.
              </Text>
              <Button
                title="Create First Goal"
                onPress={() => setModalVisible(true)}
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </View>
          ) : (
            goalsList.map((g) => {
              const current = g.currentAmountCents;
              const target = g.targetAmountCents;
              const percent = Math.min(100, Math.round((current / (target || 1)) * 100));

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
                      label={`${percent}% REACHED`}
                      variant={percent >= 100 ? 'positive' : 'accent'}
                    />
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${percent}%` }]} />
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.currentAmount}>Current: {formatCurrency(current)}</Text>
                    <Text style={styles.targetAmount}>Target: {formatCurrency(target)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* New Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Savings Goal</Text>
            <Text style={styles.modalDesc}>
              Define a target amount backed by your Savings Vault account.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>GOAL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 6-Month Emergency Reserve"
                placeholderTextColor={colors.textTertiary}
                value={goalName}
                onChangeText={setGoalName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>TARGET AMOUNT ($)</Text>
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
              <Text style={styles.label}>TARGET DATE (YYYY-MM-DD)</Text>
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
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
    borderRadius: 10,
    padding: spacing.lg,
    gap: 12,
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
    fontSize: 12,
    color: colors.textTertiary,
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
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
