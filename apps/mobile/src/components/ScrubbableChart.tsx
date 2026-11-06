import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  type GestureResponderEvent,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
} from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import * as Haptics from 'expo-haptics';
import { colors, typography } from '../theme/tokens';
import { formatCurrency, type Cents } from '@vault-ledger/shared';

export interface ChartDataPoint {
  date: string;
  label: string;
  valueCents: Cents;
  isForecast?: boolean;
  p10Cents?: Cents;
  p90Cents?: Cents;
}

interface ScrubbableChartProps {
  data: ChartDataPoint[];
  width: number;
  height?: number;
}

export const ScrubbableChart: React.FC<ScrubbableChartProps> = ({ data, width, height = 220 }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Compute scale boundaries
  const { minVal, maxVal, points } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minVal: 0, maxVal: 1, points: [] };
    }

    let min = Infinity;
    let max = -Infinity;

    for (const d of data) {
      if (d.valueCents < min) min = d.valueCents;
      if (d.valueCents > max) max = d.valueCents;
      if (d.p10Cents && d.p10Cents < min) min = d.p10Cents;
      if (d.p90Cents && d.p90Cents > max) max = d.p90Cents;
    }

    // Add 10% breathing room
    const padding = (max - min) * 0.1 || 1000;
    min -= padding;
    max += padding;

    const chartWidth = Math.max(100, width);
    const chartHeight = height - 40; // reserve room for dates

    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * chartWidth;
      const y = chartHeight - ((d.valueCents - min) / (max - min || 1)) * chartHeight;
      return { ...d, x, y };
    });

    return { minVal: min, maxVal: max, points: pts };
  }, [data, width, height]);

  // Generate SVG bezier paths using d3-shape
  const { linePath, areaPath, forecastBandPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '', forecastBandPath: '' };

    const lineGenerator = d3Shape
      .line<{ x: number; y: number }>()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(d3Shape.curveMonotoneX);

    const line = lineGenerator(points) || '';
    const lastPoint = points[points.length - 1]!;
    const firstPoint = points[0]!;
    const chartHeight = height - 40;

    const area = `${line} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`;

    // Forecast confidence band if forecast points exist
    let band = '';
    const forecastPts = points.filter((p) => p.isForecast && p.p10Cents && p.p90Cents);
    if (forecastPts.length >= 2) {
      const upperPts = forecastPts.map((p) => {
        const y = chartHeight - ((p.p90Cents! - minVal) / (maxVal - minVal || 1)) * chartHeight;
        return { x: p.x, y };
      });
      const lowerPts = [...forecastPts].reverse().map((p) => {
        const y = chartHeight - ((p.p10Cents! - minVal) / (maxVal - minVal || 1)) * chartHeight;
        return { x: p.x, y };
      });

      const upperGen = d3Shape
        .line<{ x: number; y: number }>()
        .x((p) => p.x)
        .y((p) => p.y)
        .curve(d3Shape.curveMonotoneX);
      const lowerGen = d3Shape
        .line<{ x: number; y: number }>()
        .x((p) => p.x)
        .y((p) => p.y)
        .curve(d3Shape.curveMonotoneX);

      band = `${upperGen(upperPts)} L ${lowerPts[0]?.x} ${lowerPts[0]?.y} ${lowerGen(lowerPts)?.replace('M', 'L')} Z`;
    }

    return { linePath: line, areaPath: area, forecastBandPath: band };
  }, [points, minVal, maxVal, height]);

  // Touch and pan gesture handling for scrub interaction
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleTouch(evt),
        onPanResponderMove: (evt) => handleTouch(evt),
        onPanResponderRelease: () => setActiveIndex(null),
        onPanResponderTerminate: () => setActiveIndex(null),
      }),
    [points, width],
  );

  const handleTouch = (evt: GestureResponderEvent) => {
    const touchX = evt.nativeEvent.locationX;
    if (points.length === 0) return;

    let closestIdx = 0;
    let closestDist = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - touchX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
    }
  };

  const handlePointerMove = (evt: any) => {
    if (Platform.OS !== 'web' || points.length === 0) return;
    const target = evt.currentTarget as HTMLElement | undefined;
    const rect = target?.getBoundingClientRect?.();
    const clientX = evt.clientX ?? evt.nativeEvent?.clientX;
    const locationX = rect && typeof clientX === 'number'
      ? clientX - rect.left
      : (evt.nativeEvent?.offsetX ?? evt.nativeEvent?.locationX);

    if (typeof locationX !== 'number') return;

    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i]!.x - locationX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
    }
  };

  const handlePointerLeave = () => {
    if (Platform.OS === 'web') {
      setActiveIndex(null);
    }
  };

  const handleKeyDown = (e: any) => {
    if (Platform.OS !== 'web' || points.length === 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((prev) => (prev === null ? 0 : Math.min(points.length - 1, prev + 1)));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((prev) => (prev === null ? points.length - 1 : Math.max(0, prev - 1)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(points.length - 1);
    } else if (e.key === 'Escape') {
      setActiveIndex(null);
    }
  };

  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const baselinePoint = points[0];
  const deltaCents = activePoint && baselinePoint ? activePoint.valueCents - baselinePoint.valueCents : null;
  const deltaPercent = activePoint && baselinePoint && baselinePoint.valueCents > 0
    ? ((deltaCents! / baselinePoint.valueCents) * 100).toFixed(1)
    : null;

  return (
    <View
      style={[styles.container, { width, height }]}
      {...panResponder.panHandlers}
      {...(Platform.OS === 'web'
        ? ({
            onPointerMove: handlePointerMove,
            onPointerLeave: handlePointerLeave,
            onKeyDown: handleKeyDown,
            tabIndex: 0,
            role: 'slider',
            'aria-label': 'Net worth trajectory chart',
            'aria-valuemin': minVal,
            'aria-valuemax': maxVal,
            'aria-valuenow': activePoint ? activePoint.valueCents : (data[data.length - 1]?.valueCents ?? 0),
            'aria-valuetext': activePoint ? `${activePoint.label}: ${formatCurrency(activePoint.valueCents)}` : undefined,
            cursor: 'crosshair',
          } as any)
        : {})}
    >
      {/* Header Tooltip / Current Scrub Display */}
      <View style={styles.header}>
        <View>
          <View style={styles.captionRow}>
            <Text style={styles.captionLabel}>
              {activePoint
                ? activePoint.isForecast
                  ? `Forecast · ${activePoint.label}`
                  : `Net worth · ${activePoint.label}`
                : 'Current net worth'}
            </Text>
            {deltaCents !== null && deltaCents !== 0 && (
              <View
                style={[
                  styles.deltaBadge,
                  deltaCents > 0 ? styles.deltaBadgePositive : styles.deltaBadgeNegative,
                ]}
              >
                <Text
                  style={[
                    styles.deltaText,
                    deltaCents > 0 ? styles.deltaTextPositive : styles.deltaTextNegative,
                  ]}
                >
                  {deltaCents > 0 ? '+' : ''}{formatCurrency(deltaCents)} ({deltaPercent}%)
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.balanceValue}>
            {formatCurrency(
              activePoint ? activePoint.valueCents : (data[data.length - 1]?.valueCents ?? 0),
            )}
          </Text>
        </View>

        {activePoint?.isForecast && activePoint.p10Cents && activePoint.p90Cents && (
          <View style={styles.forecastRangePill}>
            <Text style={[styles.confidenceText, { color: colors.accentGold }]}>
              Range: {formatCurrency(activePoint.p10Cents)} to {formatCurrency(activePoint.p90Cents)}
            </Text>
          </View>
        )}
      </View>

      {/* SVG Canvas */}
      <Svg width={width} height={height - 40} style={styles.svg}>
        <Defs>
          {/* Main Area Fill: Tangerine Flame blending to Iris Violet */}
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.28" />
            <Stop offset="55%" stopColor={colors.irisViolet} stopOpacity="0.12" />
            <Stop offset="100%" stopColor={colors.irisViolet} stopOpacity="0.0" />
          </LinearGradient>
          {/* Confidence Band: Warm Gold transitioning to Iris Violet */}
          <LinearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accentGold} stopOpacity="0.22" />
            <Stop offset="60%" stopColor={colors.accentGold} stopOpacity="0.10" />
            <Stop offset="100%" stopColor={colors.irisViolet} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Confidence Band (Forecast) in Warm Gold */}
        {forecastBandPath ? <Path d={forecastBandPath} fill="url(#bandGradient)" /> : null}

        {/* Gradient Fill Under Line */}
        {areaPath ? <Path d={areaPath} fill="url(#chartGradient)" /> : null}

        {/* Main Line */}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ) : null}

        {/* Active Scrub Hairline & Dual-Ring Focal Indicator */}
        {activePoint ? (
          <>
            <Line
              x1={activePoint.x}
              y1={0}
              x2={activePoint.x}
              y2={height - 40}
              stroke={activePoint.isForecast ? colors.accentGold : colors.irisViolet}
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.8}
            />
            {/* Outer tactile glow halo */}
            <Circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={9}
              fill={activePoint.isForecast ? colors.accentGold : colors.accent}
              opacity={0.25}
            />
            {/* Inner crisp focal core */}
            <Circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={4.5}
              fill="#FFFFFF"
              stroke={activePoint.isForecast ? colors.accentGold : colors.accent}
              strokeWidth={2.5}
            />
          </>
        ) : null}
      </Svg>

      {/* X-Axis Date Indicators */}
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>{data[0]?.label || ''}</Text>
        <Text style={styles.axisLabel}>{data[Math.floor(data.length / 2)]?.label || ''}</Text>
        <Text style={styles.axisLabel}>{data[data.length - 1]?.label || ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 48,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  deltaBadgePositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  deltaBadgeNegative: {
    backgroundColor: 'rgba(232, 36, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232, 36, 60, 0.35)',
  },
  deltaText: {
    fontSize: 11,
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
    fontWeight: '600',
  },
  deltaTextPositive: {
    color: '#34D399',
  },
  deltaTextNegative: {
    color: colors.negative,
  },
  forecastRangePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 176, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 58, 0.3)',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    ...typography.tabular,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  confidenceText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
    marginTop: 2,
  },
  svg: {
    marginTop: 8,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },
});
