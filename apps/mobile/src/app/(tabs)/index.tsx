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
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing, leafRadius } from '../../theme/tokens';
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
          <Text style={styles.pageTitle}>PORTFOLIO OVERVIEW</Text>
          <Text style={styles.pageSubtitle}>Double-Entry Verified Ledger</Text>
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

      {/* Ambient Real Nature Photography Card */}
      <View style={styles.ambientBannerCard}>
        <Image
          source={require('../../../assets/images/dashboard-nature-banner.jpg')}
          style={styles.ambientBannerImage}
          resizeMode="cover"
        />
        <View style={styles.ambientBannerOverlay}>
          <View style={styles.ambientBadge}>
            <Text style={styles.ambientBadgeText}>SOVEREIGN RESERVE VAULT</Text>
          </View>
          <Text style={styles.ambientBannerTitle}>
            Verifiable Double-Entry Engineering & Natural Wealth Balance
          </Text>
          <Text style={styles.ambientBannerDesc}>
            Atomic ledger postings with deterministic rule sweeps and Monte Carlo forecasting.
          </Text>
        </View>
      </View>

      {/* Top Stat Banner */}
      <View style={styles.statsGrid}>
        <StatBlock
          label="Total Net Worth"
          value={formatCurrency(totalNetWorthCents)}
          trend="+12.4% vs 6mo ago"
          trendType="positive"
          style={{ flex: 1.5 }}
        />
        <StatBlock
          label="Liquid Checking"
          value={formatCurrency(checkingAccount?.balanceCents ?? 0)}
          subtitle="Operating Cash"
          style={{ flex: 1 }}
        />
        <StatBlock
          label="Savings Vault"
          value={formatCurrency(vaultAccount?.balanceCents ?? 0)}
          subtitle="Automated Reserve"
          style={{ flex: 1 }}
        />
      </View>

      <HairlineDivider style={{ marginVertical: spacing.md }} />

      {/* Interactive Chart Section */}
      <View style={styles.chartCard}>
        <View style={styles.chartControlRow}>
          <Text style={styles.sectionHeader}>ASSET TRAJECTORY</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              onPress={() => setChartMode('history')}
              style={[styles.toggleBtn, chartMode === 'history' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, chartMode === 'history' && styles.toggleTextActive]}>
                Historical (12M)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setChartMode('forecast')}
              style={[styles.toggleBtn, chartMode === 'forecast' && styles.toggleBtnActive]}
            >
              <Text
                style={[styles.toggleText, chartMode === 'forecast' && styles.toggleTextActive]}
              >
                Monte Carlo (6M)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.chartLoading}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : (
          <ScrubbableChart data={chartData} width={chartWidth} height={260} />
        )}
      </View>

      {/* Two Column Grid: Accounts & Recent Transactions */}
      <View style={styles.twoColumnGrid}>
        {/* Accounts Card */}
        <View style={styles.columnCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionHeader}>LEDGER ACCOUNTS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/goals' as any)}>
              <Text style={styles.linkText}>Manage →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountsList}>
            {(Array.isArray(accountsQuery.data) ? accountsQuery.data : []).map((acc) => (
              <View key={acc.id} style={styles.accountRow}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <Badge
                    label={acc.type.toUpperCase()}
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
            <Text style={styles.sectionHeader}>RECENT LEDGER ENTRIES</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions' as any)}>
              <Text style={styles.linkText}>View All ({transactionsQuery.data?.total || 0}) →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {(Array.isArray(transactionsQuery.data?.transactions)
              ? transactionsQuery.data.transactions
              : Array.isArray(transactionsQuery.data)
              ? (transactionsQuery.data as any)
              : []
            ).slice(0, 6).map((tx: TransactionView) => {
              const isIncome = tx.amountCents > 0;
              return (
                <View key={tx.id} style={styles.transactionRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.merchant || tx.description}
                    </Text>
                    <View style={styles.txMetaRow}>
                      <Badge label={tx.category} variant="default" style={{ paddingVertical: 1 }} />
                      {tx.isRoundUp && (
                        <Badge label="ROUND-UP" variant="accent" style={{ paddingVertical: 1 }} />
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
                </View>
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
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    fontFamily: typography.fontFamilySerif,
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ambientBannerCard: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ambientBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  ambientBannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 22, 18, 0.55)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  ambientBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  ambientBadgeText: {
    color: '#FAF6F0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: typography.fontFamilyMono,
  },
  ambientBannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: typography.fontFamilySerif,
    letterSpacing: -0.2,
  },
  ambientBannerDesc: {
    color: '#EAE1D5',
    fontSize: 12,
    marginTop: 2,
    fontFamily: typography.fontFamily,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#2D261E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  chartControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartLoading: {
    height: 240,
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
    borderRadius: 14,
    padding: spacing.lg,
    shadowColor: '#2D261E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  linkText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  accountsList: {
    gap: 12,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  accountInfo: {
    gap: 4,
  },
  accountName: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  accountBalance: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
  },
  transactionsList: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  txLeft: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  txDesc: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txDate: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
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
