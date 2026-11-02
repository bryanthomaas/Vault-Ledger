import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { formatCurrency, type Budget } from '@vault-ledger/shared';

const PRESET_CATEGORIES = [
  'Dining',
  'Groceries',
  'Coffee',
  'Entertainment',
  'Transportation',
  'Utilities',
  'Shopping',
];

export default function BudgetsScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(PRESET_CATEGORIES[0]!);
  const [amountInput, setAmountInput] = useState('400');

  const budgetsQuery = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: () => apiRequest('/api/budgets'),
  });

  const upsertMutation = useMutation({
    mutationFn: (body: { category: string; amountCents: number }) =>
      apiRequest('/api/budgets', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setModalVisible(false);
    },
  });

  const handleSaveBudget = () => {
    const dollars = parseFloat(amountInput);
    if (isNaN(dollars) || dollars <= 0) return;

    upsertMutation.mutate({
      category: selectedCategory,
      amountCents: Math.round(dollars * 100),
    });
  };

  const budgetsList = Array.isArray(budgetsQuery.data) ? budgetsQuery.data : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>MONTHLY BUDGETS</Text>
          <Text style={styles.subtitle}>
            Proactive spending limits & automated overspend monitoring
          </Text>
        </View>

        <Button
          title="+ Set Budget"
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="sm"
        />
      </View>

      {budgetsQuery.isLoading ? (
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.budgetGrid}>
          {budgetsList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Category Budgets Set</Text>
              <Text style={styles.emptyDesc}>
                Set spending ceilings on categories like Dining or Groceries to monitor cashflows.
              </Text>
              <Button
                title="Create First Budget"
                onPress={() => setModalVisible(true)}
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </View>
          ) : (
            budgetsList.map((b) => {
              const spent = b.spentCents;
              const limit = b.amountCents;
              const percent = Math.min(100, Math.round((spent / (limit || 1)) * 100));
              const isOver = spent >= limit;

              return (
                <View key={b.id} style={styles.budgetCard}>
                  <View style={styles.cardTop}>
                    <View style={{ gap: 4 }}>
                      <Text style={styles.categoryName}>{b.category}</Text>
                      <Text style={styles.limitText}>Limit: {formatCurrency(limit)} / mo</Text>
                    </View>

                    <Badge
                      label={isOver ? 'OVER BUDGET' : `${percent}% SPENT`}
                      variant={isOver ? 'negative' : percent > 80 ? 'warning' : 'positive'}
                    />
                  </View>

                  {/* Progress Track */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${percent}%` },
                        isOver && { backgroundColor: colors.negative },
                        !isOver && percent > 80 && { backgroundColor: colors.warning },
                      ]}
                    />
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.spentAmount}>Spent: {formatCurrency(spent)}</Text>
                    <Text style={styles.remainingAmount}>
                      {isOver
                        ? `${formatCurrency(spent - limit)} over`
                        : `${formatCurrency(limit - spent)} remaining`}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Set Budget Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Category Budget</Text>
            <Text style={styles.modalDesc}>
              Choose a spending category and assign a monthly dollar limit.
            </Text>

            <View style={styles.categoryPills}>
              {PRESET_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCategory(c)}
                  style={[styles.catChoice, selectedCategory === c && styles.catChoiceActive]}
                >
                  <Text
                    style={[
                      styles.catChoiceText,
                      selectedCategory === c && styles.catChoiceTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>MONTHLY LIMIT ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="400"
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                value={amountInput}
                onChangeText={setAmountInput}
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
                title="Save Budget"
                onPress={handleSaveBudget}
                variant="primary"
                loading={upsertMutation.isPending}
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
  budgetGrid: {
    gap: spacing.md,
  },
  budgetCard: {
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
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  limitText: {
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
  spentAmount: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    ...typography.tabular,
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 12,
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
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  catChoice: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChoiceActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  catChoiceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  catChoiceTextActive: {
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
