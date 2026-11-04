import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const IconOverview: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="9" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="14" y="3" width="7" height="5" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="14" y="12" width="7" height="9" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="3" y="16" width="7" height="5" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const IconTransactions: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 8h13m0 0l-4-4m4 4l-4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M20 16H7m0 0l4 4m-4-4l4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconRules: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconBudgets: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Polyline points="12 7 12 12 15.5 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconGoals: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

export const IconActivity: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconShieldLock: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="9.5" y="10.5" width="5" height="4" rx="1" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M10.5 10.5V9a1.5 1.5 0 0 1 3 0v1.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const IconLock: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const IconSync: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21.5 2v6h-6M2.5 22v-6h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M19.79 14.5a8 8 0 0 1-14.7-2.3M4.21 9.5a8 8 0 0 1 14.7 2.3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconCheckCircle: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Polyline points="8.5 12 11 14.5 15.5 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconAlertTriangle: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="17" r="0.75" fill={color} />
  </Svg>
);

export const IconRepeat: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="17 1 21 5 17 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="7 23 3 19 7 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconSearch: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconArrowRight: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="12 5 19 12 12 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconInboxEmpty: React.FC<IconProps> = ({
  size = 32,
  color = 'currentColor',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="22 12 18 12 15 16 9 16 6 12 2 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconSun: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="2" x2="12" y2="4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="19.5" x2="12" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4.22" y1="4.22" x2="6" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="18" y1="18" x2="19.78" y2="19.78" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="2" y1="12" x2="4.5" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="19.5" y1="12" x2="22" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4.22" y1="19.78" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="18" y1="6" x2="19.78" y2="4.22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const IconMoon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

