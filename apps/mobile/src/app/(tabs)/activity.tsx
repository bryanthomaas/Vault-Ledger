import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import { colors, typography, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
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

  const filteredItems = notifications.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeMetadata = (type: NotificationType) => {
    switch (type) {
      case 'rule_fired':
        return {
          icon: '⚡',
          label: 'Rule Transfer',
          variant: 'accent' as const,
        };
      case 'budget_alert':
        return {
          icon: '⚠',
          label: 'Budget Alert',
          variant: 'negative' as const,
        };
      case 'recurring_detected':
        return {
          icon: '🔄',
          label: 'Subscription',
          variant: 'default' as const,
        };
      case 'system':
      default:
        return {
          icon: '⚙',
          label: 'System Audit',
          variant: 'default' as const,
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            refetch();
          }}
          tintColor={colors.accent}
        />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>ACTIVITY & AUDIT LOG</Text>
          <Text style={styles.subtitle}>
            Outbox events, automated rule triggers & budget alerts
          </Text>
        </View>
        {unreadCount > 0 && (
          <Button
            title={`Mark All Read (${unreadCount})`}
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
            { key: 'all', label: `All (${notifications.length})` },
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
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
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
          <Text style={styles.loadingText}>Fetching activity stream...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>◬</Text>
          <Text style={styles.emptyTitle}>No Activity Recorded</Text>
          <Text style={styles.emptyDesc}>
            {selectedFilter === 'all'
              ? 'As the background outbox worker processes automated rules and monitors budgets, log entries will appear here.'
              : `No events found for filter "${selectedFilter}".`}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredItems.map((item) => {
            const meta = getTypeMetadata(item.type);
            return (
              <TouchableOpacity
                key={item.id}
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
                    <Text style={styles.typeIcon}>{meta.icon}</Text>
                    <Badge label={meta.label} variant={meta.variant} />
                    {!item.read && (
                      <View style={styles.unreadDotBadge}>
                        <Text style={styles.unreadDotText}>NEW</Text>
                      </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceHighlight,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
  filterChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
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
    borderRadius: 8,
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  emptyIcon: {
    fontSize: 32,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.lg,
  },
  cardUnread: {
    borderColor: colors.accent,
    backgroundColor: '#0E161B',
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
  typeIcon: {
    fontSize: 14,
  },
  unreadDotBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadDotText: {
    color: '#090A0C',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: typography.fontFamilyMono,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  metadataBox: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaKey: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },
  metaVal: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilyMono,
  },
});
