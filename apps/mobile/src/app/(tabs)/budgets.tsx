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
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PaginationBar } from '../../components/PaginationBar';
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

  const deleteBudgetMutation = useMutation({
    mutationFn: (categoryOrId: string) =>
      apiRequest(`/api/budgets/${categoryOrId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
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
  const PAGE_SIZE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(budgetsList.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBudgets = budgetsList.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Monthly budgets</Text>
            <Text style={styles.subtitle}>
              Category expenditure allocations & variance monitoring
            </Text>
          </View>

          <Button
            title="+ Set budget"
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
                <Text style={styles.emptyTitle}>No Expense Allocations Set</Text>
                <Text style={styles.emptyDesc}>
                  Establish monthly spending allocations by category to monitor outflows.
                </Text>
                <Button
                  title="Create Allocation"
                  onPress={() => setModalVisible(true)}
                  variant="outline"
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : (
              paginatedBudgets.map((b) => {
                const spent = b.spentCents;
                const limit = b.amountCents;
                const percent = Math.min(100, Math.round((spent / (limit || 1)) * 100));
                const isOver = spent >= limit;
                const budgetStatusColor = isOver
                  ? colors.negative
                  : percent >= 80
                    ? colors.accentGold
                    : percent >= 50
                      ? colors.accent
                      : colors.irisViolet;

                return (
                  <View
                    key={b.id}
                    style={styles.budgetCard}
                    {...(Platform.OS === 'web' ? ({ className: 'vl-interactive-card' } as any) : {})}
                  >
                    <View style={styles.cardTop}>
                      <View style={{ gap: 4 }}>
                        <Text style={styles.categoryName}>{b.category}</Text>
                        <Text style={styles.limitText}>Limit: {formatCurrency(limit)} / mo</Text>
                      </View>

                      <Badge
                        label={isOver ? 'Over budget' : `${percent}% spent`}
                        variant={isOver ? 'negative' : percent > 80 ? 'warning' : percent > 50 ? 'accent' : 'default'}
                        style={!isOver && percent <= 50 ? { color: colors.irisViolet } : undefined}
                      />
                    </View>

                    {/* Progress Track */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${percent}%`,
                            backgroundColor: budgetStatusColor,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={[styles.spentAmount, isOver && { color: colors.negative }]}>
                        Spent: {formatCurrency(spent)}
                      </Text>
                      <Text style={styles.remainingAmount}>
                        {isOver
                          ? `${formatCurrency(spent - limit)} over`
                          : `${formatCurrency(limit - spent)} remaining`}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Adjust limit"
                        aria-label="Adjust limit"
                        onPress={() => {
                          setSelectedCategory(b.category);
                          setAmountInput((limit / 100).toString());
                          setModalVisible(true);
                        }}
                      >
                        <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600', fontFamily: typography.fontFamily }}>
                          Adjust limit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Delete"
                        aria-label="Delete"
                        onPress={() => deleteBudgetMutation.mutate(b.category)}
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
        totalItems={budgetsList.length}
        pageSize={PAGE_SIZE}
      />

      {/* Set Budget Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View nativeID="vl-modal-backdrop" style={styles.modalBackdrop}>
          <View nativeID="vl-modal-card" style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Category Budget</Text>
            <Text style={styles.modalDesc}>
              Select an expense category and set a monthly allocation ceiling.
            </Text>

            <View style={styles.categorySelectionGrid}>
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
              <Text style={styles.label}>Monthly allocation ($)</Text>
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
  budgetGrid: {
    gap: spacing.md,
  },
  budgetCard: {
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
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  limitText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentAmount: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
    fontWeight: '600',
  },
  remainingAmount: {
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
  categorySelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  catChoice: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChoiceActive: {
    backgroundColor: colors.surfaceRaised,
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
