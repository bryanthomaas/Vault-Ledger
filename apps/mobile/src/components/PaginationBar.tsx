import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, typography, radius } from '../theme/tokens';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const canPrev = safeCurrentPage > 1;
  const canNext = safeCurrentPage < safeTotalPages;

  const itemStart = pageSize ? (safeCurrentPage - 1) * pageSize + 1 : 0;
  const itemEnd = totalItems && pageSize ? Math.min(safeCurrentPage * pageSize, totalItems) : 0;

  return (
    <View nativeID="vl-pagination-bar" testID="vl-pagination-bar" style={styles.container}>
      <View style={styles.infoCol}>
        {totalItems !== undefined && pageSize !== undefined && totalItems > 0 ? (
          <Text style={styles.infoText}>
            Showing <Text style={styles.infoHighlight}>{itemStart}-{itemEnd}</Text> of{' '}
            <Text style={styles.infoHighlight}>{totalItems}</Text> entries
          </Text>
        ) : (
          <Text style={styles.infoText}>
            Page <Text style={styles.infoHighlight}>{safeCurrentPage}</Text> of{' '}
            <Text style={styles.infoHighlight}>{safeTotalPages}</Text>
          </Text>
        )}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous Page"
          disabled={!canPrev}
          onPress={() => canPrev && onPageChange(safeCurrentPage - 1)}
          style={[styles.btn, !canPrev && styles.btnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, !canPrev && styles.btnTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            Page <Text style={styles.pageNumber}>{safeCurrentPage}</Text> of{' '}
            <Text style={styles.pageNumber}>{safeTotalPages}</Text>
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next Page"
          disabled={!canNext}
          onPress={() => canNext && onPageChange(safeCurrentPage + 1)}
          style={[styles.btn, !canNext && styles.btnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, !canNext && styles.btnTextDisabled]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 10,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  infoHighlight: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontFamily: typography.fontFamilyMono,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  btnDisabled: {
    opacity: 0.4,
    borderColor: colors.border,
    cursor: Platform.OS === 'web' ? ('not-allowed' as any) : undefined,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
  },
  btnTextDisabled: {
    color: colors.textTertiary,
  },
  pageIndicator: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  pageNumber: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontFamily: typography.fontFamilyMono,
  },
});
