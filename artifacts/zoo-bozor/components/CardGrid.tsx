import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Two cards per row (Figma: 178pt cards, 7pt gutter on a 402pt screen). Each card takes half of
 * the row via flex instead of a pixel width computed from the screen, so a scrollbar, a device
 * frame or rounding can never push the second card onto its own line. An odd last card keeps
 * its half width.
 */
export function CardGrid({ children, gap = 7, style }: { children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  const items = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={[{ gap }, style]}>
      {rows.map((pair, r) => (
        <View key={r} style={{ flexDirection: 'row', gap, alignItems: 'stretch' }}>
          <View style={{ flex: 1, minWidth: 0 }}>{pair[0]}</View>
          <View style={{ flex: 1, minWidth: 0 }}>{pair[1] ?? null}</View>
        </View>
      ))}
    </View>
  );
}
