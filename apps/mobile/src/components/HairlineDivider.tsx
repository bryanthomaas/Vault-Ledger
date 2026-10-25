import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

export const HairlineDivider: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: '100%',
  },
});
