import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatCurrency, type TransactionView } from '@vault-ledger/shared';

const CATEGORIES = [
  'All',
  'Salary',
  'Housing',
  'Groceries',
  'Dining',
  'Coffee',
  'Entertainment',
  'Utilities',
  'Transportation',
  'Subscriptions',
  'Savings Transfer',
];

export default function TransactionsScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTx, setSelectedTx] = useState<TransactionView | null>(null);

  const transactionsQuery = useQuery<{ transactions: TransactionView[]; total: number }>({
    queryKey: ['transactions', selectedCategory],
    queryFn: () =>
      apiRequest(
        `/api/transactions?limit=100${
          selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : ''
        }`,
      ),
  });

  // Re-categorization mutation
  const categoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) =>
      apiRequest(`/api/transactions/${id}/category`, {
        method: 'PATCH',
        body: JSON.stringify({ category }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      setSelectedTx(null);
    },
  });

  const filtered = (transactionsQuery.data?.transactions || []).filter((tx) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      tx.description.toLowerCase().includes(query) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(query)) ||
      tx.category.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TRANSACTIONS</Text>
        <Text style={styles.subtitle}>
          {filtered.length} verified ledger postings
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant, description, category..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Pills Bar */}
      <View style={styles.categoriesBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.lg }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.catPill, isSelected && styles.catPillSelected]}
              >
                <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Transactions List */}
      {transactionsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isIncome = item.amountCents > 0;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTx(item)}
                activeOpacity={0.7}
                style={styles.row}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.merchant}>{item.merchant || item.description}</Text>
                  <View style={styles.badgeRow}>
                    <Badge label={item.category} variant="default" />
                    {item.isRoundUp && (
                      <Badge label="ROUND-UP" variant="accent" />
                    )}
                    <Text style={styles.date}>
                      {new Date(item.occurredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightCol}>
                  <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
                    {formatCurrency(item.amountCents, { showSign: true })}
                  </Text>
                  <Text style={styles.accountName}>{item.accountName}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Re-categorize Modal */}
      {selectedTx && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedTx(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Re-categorize Transaction</Text>
              <Text style={styles.modalDesc}>
                Select a new category for "{selectedTx.merchant || selectedTx.description}" (
                {formatCurrency(selectedTx.amountCents)}).
              </Text>

              <View style={styles.categoryGrid}>
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      categoryMutation.mutate({ id: selectedTx.id, category: cat })
                    }
                    style={[
                      styles.modalCatBtn,
                      selectedTx.category === cat && styles.modalCatBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        selectedTx.category === cat && styles.modalCatTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Cancel"
                onPress={() => setSelectedTx(null)}
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
  searchRow: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  categoriesBar: {
    paddingVertical: 6,
  },
  catPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillSelected: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  catText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  catTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  leftCol: {
    flex: 1,
    gap: 4,
    marginRight: 16,
  },
  merchant: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
    ...typography.tabular,
  },
  income: {
    color: colors.positive,
  },
  expense: {
    color: colors.textPrimary,
  },
  accountName: {
    fontSize: 11,
    color: colors.textTertiary,
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
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.sm,
  },
  modalCatBtn: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCatBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  modalCatText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  modalCatTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
