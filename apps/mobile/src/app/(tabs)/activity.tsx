import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PaginationBar } from '../../components/PaginationBar';
import {
  IconRules,
  IconAlertTriangle,
  IconRepeat,
  IconShieldLock,
  IconInboxEmpty,
  type IconProps,
} from '../../components/Icons';
import type { Notification, NotificationType } from '@vault-ledger/shared';

export default function ActivityScreen() {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<'all' | NotificationType>('all');

  const {
    data: notifications = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiRequest('/api/notifications'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/notifications/read-all', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const filteredItems = (Array.isArray(notifications) ? notifications : []).filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter((n) => !n.read).length;

  const getTypeMetadata = (type: NotificationType): { icon: React.FC<IconProps>; label: string; variant: 'accent' | 'negative' | 'default' } => {
    switch (type) {
      case 'rule_fired':
        return {
          icon: IconRules,
          label: 'Rule Transfer',
          variant: 'accent',
        };
      case 'budget_alert':
        return {
          icon: IconAlertTriangle,
          label: 'Budget Alert',
          variant: 'negative',
        };
      case 'recurring_detected':
        return {
          icon: IconRepeat,
          label: 'Subscription',
          variant: 'default',
        };
      case 'system':
      default:
        return {
          icon: IconShieldLock,
          label: 'System Audit',
          variant: 'default',
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const PAGE_SIZE = 4;
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Activity & audit log</Text>
            <Text style={styles.subtitle}>
              Audit trail of automated postings, rule triggers, and balance alerts
            </Text>
          </View>
          {unreadCount > 0 && (
            <Button
              title={`Mark all read (${unreadCount})`}
              onPress={() => markAllReadMutation.mutate()}
              variant="secondary"
              loading={markAllReadMutation.isPending}
            />
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(
            [
              { key: 'all', label: `All (${Array.isArray(notifications) ? notifications.length : 0})` },
              { key: 'rule_fired', label: 'Rules' },
              { key: 'budget_alert', label: 'Budgets' },
              { key: 'recurring_detected', label: 'Recurring' },
              { key: 'system', label: 'System' },
            ] as const
          ).map((f) => {
            const isActive = selectedFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setSelectedFilter(f.key)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.loadingText}>Loading audit trail...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <IconInboxEmpty size={38} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Audit Events Recorded</Text>
            <Text style={styles.emptyDesc}>
              {selectedFilter === 'all'
                ? 'When automated rules execute and budget thresholds trigger, audit entries will post here.'
                : `No events found for filter "${selectedFilter}".`}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {paginatedItems.map((item) => {
              const meta = getTypeMetadata(item.type);
              const IconComponent = meta.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Notification: ${item.title}`}
                  {...(Platform.OS === 'web' ? ({ className: 'vl-interactive-card' } as any) : {})}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (!item.read) {
                      markReadMutation.mutate(item.id);
                    }
                  }}
                  style={[styles.card, !item.read && styles.cardUnread]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadgeRow}>
                      <View style={styles.typeIconBox}>
                        <IconComponent
                          size={15}
                          color={
                            meta.variant === 'accent'
                              ? colors.accent
                              : meta.variant === 'negative'
                              ? colors.negative
                              : colors.textSecondary
                          }
                        />
                      </View>
                      <Badge label={meta.label} variant={meta.variant} />
                      {!item.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMessage}>{item.message}</Text>

                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <View style={styles.metadataBox}>
                      {Object.entries(item.metadata).map(([key, val]) => (
                        <View key={key} style={styles.metaRow}>
                          <Text style={styles.metaKey}>{key}:</Text>
                          <Text style={styles.metaVal}>{String(val)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <PaginationBar
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredItems.length}
        pageSize={PAGE_SIZE}
      />
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
    padding: spacing.xl,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.md,
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
    marginTop: 3,
    fontFamily: typography.fontFamilyMono,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.accent,
  },
  filterTabText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.md,
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: 6,
    fontFamily: typography.fontFamilySerif,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
    fontFamily: typography.fontFamily,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
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
  cardUnread: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.irisViolet,
  },
  timestamp: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: typography.fontFamily,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontFamily: typography.fontFamily,
  },
  metadataBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.canvasMuted,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaKey: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  metaVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
  },
});
