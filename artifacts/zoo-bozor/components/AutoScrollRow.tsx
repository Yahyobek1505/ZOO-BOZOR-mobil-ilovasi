import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useIsFocused } from 'expo-router';

const SPEED = 22; // px per second — a slow drift the eye can follow
const TICK_MS = 32;
const RESUME_AFTER_TOUCH_MS = 2500;

/**
 * Some browsers draw a scrollbar even when `showsHorizontalScrollIndicator={false}` is set
 * (forced classic scrollbars, device-simulator pages). On the web the scroller is made 20px
 * taller than its clipping parent, so the bar falls outside the visible area.
 */
export const hiddenBarOuter: ViewStyle = Platform.OS === 'web' ? { overflow: 'hidden' } : {};
export const hiddenBarScroll: ViewStyle = Platform.OS === 'web' ? { marginBottom: -20 } : {};
export const hiddenBarContent: ViewStyle = Platform.OS === 'web' ? { paddingBottom: 20 } : {};

/**
 * Horizontal row that drifts by itself in an endless loop (a second, hidden-from-accessibility
 * copy follows the first and the offset wraps seamlessly). It pauses while touched, dragged or
 * hovered, and while its screen is not focused. Rows narrower than the screen stay still.
 */
export function AutoScrollRow({ children, gap = 0, padding = 0, style, testID }: {
  children: React.ReactNode;
  gap?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const firstSet = useRef<React.ComponentRef<typeof View>>(null);
  const x = useRef(0);
  const setWidth = useRef(0);
  const viewWidth = useRef(0);
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overflows, setOverflows] = useState(false);
  const focused = useIsFocused();
  const items = React.Children.toArray(children);

  const measure = () => setOverflows(setWidth.current + padding * 2 > viewWidth.current + 1);

  // react-native-web reports onLayout through ResizeObserver, which some contexts never deliver
  // (background tabs, embedded previews); read the DOM sizes directly as well.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const read = () => {
      const scroller = (ref.current as unknown as { getScrollableNode?: () => HTMLElement })?.getScrollableNode?.();
      const set = firstSet.current as unknown as HTMLElement | null;
      if (!scroller || !set?.getBoundingClientRect) return;
      const w = set.getBoundingClientRect().width;
      if (w > 0 && scroller.clientWidth > 0) { setWidth.current = w; viewWidth.current = scroller.clientWidth; measure(); }
    };
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, [padding]);

  useEffect(() => {
    if (!focused || !overflows) return;
    const timer = setInterval(() => {
      if (paused.current) return;
      const loop = setWidth.current + gap;
      x.current += (SPEED * TICK_MS) / 1000;
      if (x.current >= loop) x.current -= loop;
      ref.current?.scrollTo({ x: x.current, animated: false });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [focused, overflows, gap]);

  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  const pause = () => {
    paused.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const resumeLater = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { paused.current = false; }, RESUME_AFTER_TOUCH_MS);
  };

  return (
    <View
      style={[hiddenBarOuter, style]}
      testID={testID}
      onLayout={(e) => { viewWidth.current = e.nativeEvent.layout.width; measure(); }}
      onTouchStart={pause}
      onTouchEnd={resumeLater}
      onTouchCancel={resumeLater}
      onPointerEnter={(e) => { if (e.nativeEvent.pointerType === 'mouse') pause(); }}
      onPointerLeave={(e) => { if (e.nativeEvent.pointerType === 'mouse') resumeLater(); }}
    >
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        style={hiddenBarScroll}
        contentContainerStyle={[{ paddingHorizontal: padding, gap }, hiddenBarContent]}
        onScrollBeginDrag={pause}
        onScroll={(e) => {
          // Only user scrolling moves the drift origin; our own steps are tracked in x.
          if (!paused.current) return;
          const loop = setWidth.current + gap;
          const offset = e.nativeEvent.contentOffset.x;
          x.current = loop > 0 && offset >= loop ? offset - loop : offset;
        }}
        onScrollEndDrag={resumeLater}
        onMomentumScrollEnd={resumeLater}
      >
        <View ref={firstSet} style={{ flexDirection: 'row', gap }} onLayout={(e) => { setWidth.current = e.nativeEvent.layout.width; measure(); }}>
          {items}
        </View>
        {overflows ? (
          <View
            style={{ flexDirection: 'row', gap }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
          >
            {items.map((child, i) => (React.isValidElement(child) ? React.cloneElement(child, { key: `copy-${i}` }) : child))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
