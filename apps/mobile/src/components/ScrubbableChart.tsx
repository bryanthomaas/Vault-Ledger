import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  type GestureResponderEvent,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
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

export const ScrubbableChart: React.FC<ScrubbableChartProps> = ({
  data,
  width,
  height = 220,
}) => {
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
      const lowerPts = [...forecastPts]
        .reverse()
        .map((p) => {
          const y = chartHeight - ((p.p10Cents! - minVal) / (maxVal - minVal || 1)) * chartHeight;
          return { x: p.x, y };
        });

      const upperGen = d3Shape.line<{ x: number; y: number }>().x((p) => p.x).y((p) => p.y).curve(d3Shape.curveMonotoneX);
      const lowerGen = d3Shape.line<{ x: number; y: number }>().x((p) => p.x).y((p) => p.y).curve(d3Shape.curveMonotoneX);

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

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <View style={[styles.container, { width, height }]} {...panResponder.panHandlers}>
      {/* Header Tooltip / Current Scrub Display */}
      <View style={styles.header}>
        <View>
          <Text style={styles.captionLabel}>
            {activePoint ? (activePoint.isForecast ? 'Forecasted Net Worth' : activePoint.label) : 'Current Trajectory'}
          </Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(activePoint ? activePoint.valueCents : (data[data.length - 1]?.valueCents ?? 0))}
          </Text>
        </View>

        {activePoint?.isForecast && activePoint.p10Cents && activePoint.p90Cents && (
          <View style={styles.confidencePill}>
            <Text style={styles.confidenceText}>
              Band: {formatCurrency(activePoint.p10Cents)} - {formatCurrency(activePoint.p90Cents)}
            </Text>
          </View>
        )}
      </View>

      {/* SVG Canvas */}
      <Svg width={width} height={height - 40} style={styles.svg}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.0" />
          </LinearGradient>
          <LinearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.12" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.04" />
          </LinearGradient>
        </Defs>

        {/* Confidence Band (Forecast) */}
        {forecastBandPath ? (
          <Path d={forecastBandPath} fill="url(#bandGradient)" />
        ) : null}

        {/* Gradient Fill Under Line */}
        {areaPath ? <Path d={areaPath} fill="url(#chartGradient)" /> : null}

        {/* Main Line */}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ) : null}

        {/* Active Scrub Cursor */}
        {activePoint ? (
          <>
            <Line
              x1={activePoint.x}
              y1={0}
              x2={activePoint.x}
              y2={height - 40}
              stroke={colors.borderStrong}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <Circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={5}
              fill={colors.background}
              stroke={colors.accent}
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
  captionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    ...typography.tabular,
    marginTop: 2,
  },
  confidencePill: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confidenceText: {
    fontSize: 11,
    color: colors.accent,
    fontFamily: typography.fontFamilyMono,
    ...typography.tabular,
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
