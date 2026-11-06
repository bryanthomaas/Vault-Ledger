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
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PaginationBar } from '../../components/PaginationBar';
import { formatCurrency, type TransactionView, type Account } from '@vault-ledger/shared';

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

  // New posting state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newCategory, setNewCategory] = useState('Groceries');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const accountsQuery = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => apiRequest('/api/accounts'),
  });

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

  // Create posting mutation
  const createTxMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      setCreateModalVisible(false);
      setNewDesc('');
      setNewAmount('');
    },
  });

  // Delete posting mutation
  const deleteTxMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/transactions/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      setSelectedTx(null);
    },
  });

  const handleCreatePosting = () => {
    const dollars = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(dollars) || dollars <= 0) return;

    const accounts = Array.isArray(accountsQuery.data) ? accountsQuery.data : [];
    const targetAccountId = selectedAccountId || accounts[0]?.id || '10000000-0000-0000-0000-000000000001';
    const amountCents = Math.round(dollars * 100) * (newType === 'expense' ? -1 : 1);

    createTxMutation.mutate({
      description: newDesc.trim(),
      merchant: newDesc.trim(),
      amountCents,
      category: newCategory,
      accountId: targetAccountId,
      source: 'manual_posting',
      occurredAt: new Date().toISOString(),
    });
  };

  const rawTransactions = Array.isArray(transactionsQuery.data?.transactions)
    ? transactionsQuery.data.transactions
    : Array.isArray(transactionsQuery.data)
    ? (transactionsQuery.data as any)
    : [];

  const filtered = rawTransactions.filter((tx: TransactionView) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      tx.description.toLowerCase().includes(query) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(query)) ||
      tx.category.toLowerCase().includes(query)
    );
  });

  const { height: windowHeight } = useWindowDimensions();
  const [listContainerHeight, setListContainerHeight] = useState<number>(0);
  const effectiveHeight =
    listContainerHeight > 200 ? listContainerHeight : Math.max(480, windowHeight - 230);
  const pageSize = Math.max(8, Math.floor((effectiveHeight - 8) / 56));

  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safeCurrentPage, pageSize]);

  return (
    <View style={styles.container}>
      {/* Header with Title and Add Button */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.title}>Transactions</Text>
            <Text style={styles.subtitle}>{filtered.length} double-entry postings verified</Text>
          </View>
          <Button
            title="+ Record Posting"
            onPress={() => setCreateModalVisible(true)}
            variant="primary"
            size="sm"
          />
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter merchant, description, category..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filter Segments */}
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
                accessibilityRole="button"
                accessibilityLabel={`Filter by category ${item}`}
                aria-pressed={isSelected}
                onPress={() => setSelectedCategory(item)}
                style={[styles.catSegment, isSelected && styles.catSegmentSelected]}
              >
                <Text style={[styles.catText, isSelected && styles.catTextSelected]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Transactions List */}
      <View
        style={styles.listWrapper}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 200 && Math.abs(h - listContainerHeight) > 8) {
            setListContainerHeight(h);
          }
        }}
      >
        {transactionsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : (
          <View style={styles.listContent}>
            {paginatedTransactions.map((item: any) => {
              const isIncome = item.amountCents > 0;
              return (
                <TouchableOpacity
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Posting ${item.merchant || item.description}, ${formatCurrency(item.amountCents)}`}
                  {...(Platform.OS === 'web' ? ({ className: 'vl-interactive-row' } as any) : {})}
                  onPress={() => setSelectedTx(item)}
                  activeOpacity={0.7}
                  style={[
                    styles.row,
                    paginatedTransactions.length >= pageSize && styles.rowExpanded,
                  ]}
                >
                  <View style={styles.leftCol}>
                    <Text style={styles.merchant}>{item.merchant || item.description}</Text>
                    <View style={styles.badgeRow}>
                      <Badge label={item.category} variant="default" />
                      {item.isRoundUp && <Badge label="Round-up" variant="accent" />}
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
            })}
          </View>
        )}
      </View>

      {/* Pinned Bottom Pagination */}
      <PaginationBar
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
      />

      {/* Create Posting Modal */}
      {createModalVisible && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setCreateModalVisible(false)}
        >
          <View nativeID="vl-modal-backdrop" style={styles.modalBackdrop}>
            <View nativeID="vl-modal-card" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Record Ledger Posting</Text>
              <Text style={styles.modalDesc}>
                Enter balanced double-entry transaction parameters to post directly to your ledger accounts.
              </Text>

              {/* Type Toggle */}
              <View style={styles.typeToggleRow}>
                <TouchableOpacity
                  onPress={() => setNewType('expense')}
                  style={[styles.typeBtn, newType === 'expense' && styles.typeBtnActive]}
                >
                  <Text style={[styles.typeBtnText, newType === 'expense' && styles.typeBtnTextActive]}>
                    Debit (Expense)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewType('income')}
                  style={[styles.typeBtn, newType === 'income' && styles.typeBtnActive]}
                >
                  <Text style={[styles.typeBtnText, newType === 'income' && styles.typeBtnTextActive]}>
                    Credit (Income)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Merchant or Description</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Blue Bottle Coffee, Tech Corp Payroll"
                  placeholderTextColor={colors.textTertiary}
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
              </View>

              {/* Amount */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount ($ USD)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="45.50"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={newAmount}
                  onChangeText={setNewAmount}
                />
              </View>

              {/* Category Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={[styles.modalCatBtn, newCategory === cat && styles.modalCatBtnActive]}
                    >
                      <Text style={[styles.modalCatText, newCategory === cat && styles.modalCatTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
                <Button
                  title="Post to Ledger"
                  onPress={handleCreatePosting}
                  loading={createTxMutation.isPending}
                  variant="primary"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Cancel"
                  onPress={() => setCreateModalVisible(false)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Transaction Detail / Re-classify & Delete Modal */}
      {selectedTx && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedTx(null)}
        >
          <View nativeID="vl-modal-backdrop" style={styles.modalBackdrop}>
            <View nativeID="vl-modal-card" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Posting Details</Text>
              <Text style={styles.modalDesc}>
                "{selectedTx.merchant || selectedTx.description}" · {formatCurrency(selectedTx.amountCents)}
              </Text>

              <Text style={styles.formLabel}>Reclassify Expense Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => categoryMutation.mutate({ id: selectedTx.id, category: cat })}
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

              <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
                <Button
                  title="Delete Posting"
                  onPress={() => deleteTxMutation.mutate(selectedTx.id)}
                  loading={deleteTxMutation.isPending}
                  variant="outline"
                  style={{ flex: 1, borderColor: colors.negative }}
                />
                <Button
                  title="Close"
                  onPress={() => setSelectedTx(null)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              </View>
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
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
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
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
        } as any)
      : {}),
  },
  categoriesBar: {
    paddingVertical: 6,
  },
  catSegment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  catSegmentSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  catText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
    letterSpacing: 0,
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
  listWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  listContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 4,
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 54,
    maxHeight: 68,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowExpanded: {
    flex: 1,
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
    fontFamily: typography.fontFamily,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
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
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(141, 141, 245, 0.20)',
        } as any)
      : {}),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
    fontFamily: typography.fontFamily,
  },
  typeToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  typeBtnActive: {
    backgroundColor: colors.accent,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  typeBtnTextActive: {
    color: '#0A0B14',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: typography.fontFamily,
  },
  formInput: {
    height: 42,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
        } as any)
      : {}),
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  modalCatBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCatBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  modalCatText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  modalCatTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
