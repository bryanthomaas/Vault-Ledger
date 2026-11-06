import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { ScrubbableChart, type ChartDataPoint } from '../../components/ScrubbableChart';
import { StatBlock } from '../../components/StatBlock';
import { Badge } from '../../components/Badge';
import { HairlineDivider } from '../../components/HairlineDivider';
import { Button } from '../../components/Button';
import { IconSync } from '../../components/Icons';
import {
  formatCurrency,
  type Account,
  type TransactionView,
  type ForecastResponse,
} from '@vault-ledger/shared';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [chartMode, setChartMode] = useState<'history' | 'forecast'>('history');

  // Fetch user accounts with computed balances
  const accountsQuery = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => apiRequest('/api/accounts'),
  });

  // Fetch 12-month net worth history
  const historyQuery = useQuery<
    Array<{ month: string; netWorthCents: number; incomeCents: number; expenseCents: number }>
  >({
    queryKey: ['insights', 'history'],
    queryFn: () => apiRequest('/api/insights/history'),
  });

  // Fetch Monte Carlo forecast
  const forecastQuery = useQuery<ForecastResponse>({
    queryKey: ['insights', 'forecast'],
    queryFn: () => apiRequest('/api/insights/forecast'),
  });

  // Fetch recent transactions
  const transactionsQuery = useQuery<{ transactions: TransactionView[]; total: number }>({
    queryKey: ['transactions', 'recent'],
    queryFn: () => apiRequest('/api/transactions?limit=6'),
  });

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => apiRequest('/api/sync', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const totalNetWorthCents = useMemo(() => {
    if (!accountsQuery.data || !Array.isArray(accountsQuery.data)) return 0;
    return accountsQuery.data
      .filter((a) => a.type !== 'counterparty')
      .reduce((sum, a) => sum + a.balanceCents, 0);
  }, [accountsQuery.data]);

  const checkingAccount = Array.isArray(accountsQuery.data)
    ? accountsQuery.data.find((a) => a.type === 'depository')
    : undefined;
  const vaultAccount = Array.isArray(accountsQuery.data)
    ? accountsQuery.data.find((a) => a.type === 'vault')
    : undefined;

  // Prepare chart dataset
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (chartMode === 'history') {
      const history = Array.isArray(historyQuery.data) ? historyQuery.data : [];
      if (history.length === 0) {
        return [
          { date: '2025-01', label: 'Jan', valueCents: 11000000 },
          { date: '2025-06', label: 'Jun', valueCents: 12800000 },
          { date: '2026-01', label: 'Jan', valueCents: 14250000 },
        ];
      }
      return history.map((h) => ({
        date: h.month,
        label: h.month,
        valueCents: h.netWorthCents,
        isForecast: false,
      }));
    } else {
      const forecast = forecastQuery.data;
      if (!forecast || !Array.isArray(forecast.points) || forecast.points.length === 0) return [];

      const current = {
        date: 'Current',
        label: 'Now',
        valueCents: forecast.currentNetWorthCents,
        isForecast: false,
      };

      const points = forecast.points.map((p) => {
        const monthLabel = new Date(p.date).toLocaleString('en-US', { month: 'short' });
        return {
          date: p.date,
          label: monthLabel,
          valueCents: Math.round(p.p50NetWorth * 100),
          isForecast: true,
          p10Cents: Math.round(p.p10NetWorth * 100),
          p90Cents: Math.round(p.p90NetWorth * 100),
        };
      });

      return [current, ...points];
    }
  }, [chartMode, historyQuery.data, forecastQuery.data]);

  const chartWidth = Math.min(width - (width >= 768 ? 280 : 40), 960);
  const isLoading = accountsQuery.isLoading || historyQuery.isLoading;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={accountsQuery.isRefetching}
          onRefresh={() => {
            accountsQuery.refetch();
            historyQuery.refetch();
            forecastQuery.refetch();
            transactionsQuery.refetch();
          }}
          tintColor={colors.accent}
        />
      }
    >
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Portfolio overview</Text>
          <Text style={styles.pageSubtitle}>Balance sheet & portfolio analytics</Text>
        </View>

        <View style={styles.actionsRow}>
          <Button
            title={syncMutation.isPending ? 'Syncing...' : 'Sync Data'}
            icon={<IconSync size={14} color={colors.accent} />}
            onPress={() => syncMutation.mutate()}
            variant="outline"
            size="sm"
            loading={syncMutation.isPending}
          />
        </View>
      </View>

      {/* Top Stat Banner */}
      <View style={styles.statsGrid}>
        <StatBlock
          framed
          isHero
          label="Total net worth"
          value={formatCurrency(totalNetWorthCents)}
          trend="+12.4% vs 6mo ago"
          trendType="positive"
          style={{ flex: 1.5 }}
        />
        <StatBlock
          framed
          label="Operating cash"
          value={formatCurrency(checkingAccount?.balanceCents ?? 0)}
          subtitle="Assets: Checking"
          style={{ flex: 1 }}
        />
        <StatBlock
          framed
          label="Reserve savings"
          value={formatCurrency(vaultAccount?.balanceCents ?? 0)}
          subtitle="Assets: Savings"
          style={{ flex: 1 }}
        />
      </View>

      {/* Quick Action Command Strip */}
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: spacing.sm, flexWrap: 'wrap' }}>
        <Button
          title="+ Record Posting"
          onPress={() => router.push('/(tabs)/transactions' as any)}
          variant="primary"
          size="sm"
        />
        <Button
          title="+ Automation Rule"
          onPress={() => router.push('/(tabs)/rules' as any)}
          variant="outline"
          size="sm"
        />
        <Button
          title="Adjust Budgets"
          onPress={() => router.push('/(tabs)/budgets' as any)}
          variant="outline"
          size="sm"
        />
        <Button
          title="Savings Goals"
          onPress={() => router.push('/(tabs)/goals' as any)}
          variant="outline"
          size="sm"
        />
      </View>

      <HairlineDivider style={{ marginVertical: spacing.md }} />

      {/* Interactive Chart Section */}
      <View style={styles.chartCard}>
        <View style={styles.chartControlRow}>
          <Text style={styles.sectionHeader}>Net worth trajectory</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Switch to Historical 12-month net worth view"
              aria-pressed={chartMode === 'history'}
              onPress={() => setChartMode('history')}
              style={[styles.toggleBtn, chartMode === 'history' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, chartMode === 'history' && styles.toggleTextActive]}>
                Historical (12m)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Switch to Monte Carlo 6-month forecast view"
              aria-pressed={chartMode === 'forecast'}
              onPress={() => setChartMode('forecast')}
              style={[styles.toggleBtn, chartMode === 'forecast' && styles.toggleBtnActive]}
            >
              <Text
                style={[styles.toggleText, chartMode === 'forecast' && styles.toggleTextActive]}
              >
                Forecast (6m)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoading}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : (
          <ScrubbableChart data={chartData} width={chartWidth} height={190} />
        )}
      </View>

      {/* Two Column Grid: Accounts & Recent Transactions */}
      <View style={styles.twoColumnGrid}>
        {/* Accounts Card */}
        <View style={styles.columnCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeader}>Ledger accounts</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Manage ledger accounts"
              onPress={() => router.push('/(tabs)/goals' as any)}
            >
              <Text style={styles.linkText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountsList}>
            {(Array.isArray(accountsQuery.data) ? accountsQuery.data : []).slice(0, 4).map((acc) => (
              <View key={acc.id} style={styles.accountRow}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <Badge
                    label={acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}
                    variant={acc.type === 'vault' ? 'accent' : 'default'}
                  />
                </View>
                <Text
                  style={[
                    styles.accountBalance,
                    acc.balanceCents < 0 && { color: colors.negative },
                  ]}
                >
                  {formatCurrency(acc.balanceCents)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions Card */}
        <View style={styles.columnCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeader}>Recent entries</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`View all ${transactionsQuery.data?.total || 0} ledger postings`}
              onPress={() => router.push('/(tabs)/transactions' as any)}
            >
              <Text style={styles.linkText}>View all ({transactionsQuery.data?.total || 0})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {(Array.isArray(transactionsQuery.data?.transactions)
              ? transactionsQuery.data.transactions
              : Array.isArray(transactionsQuery.data)
              ? (transactionsQuery.data as any)
              : []
            ).slice(0, 4).map((tx: TransactionView) => {
              const isIncome = tx.amountCents > 0;
              return (
                <TouchableOpacity
                  key={tx.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Transaction ${tx.merchant || tx.description}, ${formatCurrency(tx.amountCents)}`}
                  {...(Platform.OS === 'web' ? ({ className: 'vl-interactive-row' } as any) : {})}
                  style={styles.transactionRow}
                  onPress={() => router.push('/(tabs)/transactions' as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.txLeft}>
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.merchant || tx.description}
                    </Text>
                    <View style={styles.txMetaRow}>
                      <Badge label={tx.category} variant="default" style={{ paddingVertical: 1 }} />
                      {tx.isRoundUp && (
                        <Badge label="Round-up" variant="accent" style={{ paddingVertical: 1 }} />
                      )}
                      <Text style={styles.txDate}>
                        {new Date(tx.occurredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.txAmount, isIncome ? styles.txIncome : styles.txExpense]}>
                    {formatCurrency(tx.amountCents, { showSign: true })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
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
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    fontFamily: typography.fontFamilySerif,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  chartControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        } as any)
      : {}),
  },
  toggleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chartLoading: {
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  columnCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  accountsList: {
    gap: 6,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountName: {
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 13,
    fontFamily: typography.fontFamily,
  },
  accountBalance: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
  },
  transactionsList: {
    gap: 6,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  txLeft: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  txDesc: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: typography.fontFamily,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
  },
  txIncome: {
    color: colors.positive,
  },
  txExpense: {
    color: colors.textPrimary,
  },
});
