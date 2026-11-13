import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, type StyleProp, type ImageStyle, type ViewStyle, View } from 'react-native';
import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import type { ImgSrc } from '@/constants/data';
import { go } from '@/components/ui';
import { hiddenBarContent, hiddenBarOuter, hiddenBarScroll } from '@/components/AutoScrollRow';

export const AUTO_SLIDE_MS = 4000; // comfortable reading time per banner
const RESUME_AFTER_TOUCH_MS = 3000;
const SLIDE_ANIMATION_MS = 450;

export type CarouselSlide = { img: ImgSrc; to: string };

/**
 * Banner carousel that advances by itself in an endless loop.
 *
 * A clone of the first slide sits at the end: after the last banner the carousel
 * slides forward onto the clone and, once it is fully in view, swaps to the real
 * first slide without animation, so it never rewinds backwards. It pauses while
 * the user touches it and while its screen is not focused.
 */
export function AutoCarousel({
  slides,
  slideWidth,
  sidePadding,
  gap = 12,
  imageStyle,
  style,
  contentStyle,
  testIDPrefix,
  renderDots,
}: {
  slides: CarouselSlide[];
  slideWidth: number;
  sidePadding: number;
  gap?: number;
  imageStyle: StyleProp<ImageStyle>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testIDPrefix: string;
  /** Draws the pager for the given active slide index. */
  renderDots: (active: number) => React.ReactNode;
}) {
  const step = slideWidth + gap;
  const count = slides.length;
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const position = useRef(0); // slide index currently in view (count = the clone)
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);
  // Read focus from the navigator: tabs stay mounted, and a screen that was never
  // focused (e.g. Home when the app opens on /market) must not keep sliding unseen.
  const focused = useIsFocused();
  const offsetX = useRef(0);
  const frame = useRef<number | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAnimation = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (fallback.current) clearTimeout(fallback.current);
    frame.current = null;
    fallback.current = null;
  };

  /**
   * Native ScrollView animates scrollTo itself. Some browsers/webviews ignore
   * `behavior: 'smooth'` (the carousel then never moves), so on the web the
   * slide is animated frame by frame with an ease-out curve instead.
   */
  const slideTo = (x: number) => {
    if (Platform.OS !== 'web') {
      ref.current?.scrollTo({ x, animated: true });
      return;
    }
    stopAnimation();
    const from = offsetX.current;
    const started = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - started) / SLIDE_ANIMATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      ref.current?.scrollTo({ x: from + (x - from) * eased, animated: false });
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else { stopAnimation(); landedAt(x); }
    };
    frame.current = requestAnimationFrame(tick);
    // Pages that are not being painted get no animation frames; still land on the slide.
    fallback.current = setTimeout(() => {
      if (frame.current === null) return;
      stopAnimation();
      ref.current?.scrollTo({ x, animated: false });
      landedAt(x);
    }, SLIDE_ANIMATION_MS + 150);
  };

  /**
   * Records where a web slide finished. Browsers only fire scroll events while the
   * page is painted, so the carousel tracks its own position instead of waiting
   * for onScroll; landing on the clone swaps to the real first slide.
   */
  const landedAt = (x: number) => {
    const raw = Math.round(x / step);
    if (count > 1 && raw >= count) {
      ref.current?.scrollTo({ x: 0, animated: false });
      position.current = 0;
      offsetX.current = 0;
      setActive(0);
      return;
    }
    position.current = raw;
    offsetX.current = x;
    setActive(raw % count);
  };

  useEffect(() => {
    if (!focused || count < 2) return;
    const timer = setInterval(() => {
      if (paused.current) return;
      if (position.current >= count) {
        // Still parked on the clone (e.g. the swap was missed): restart from slide 0.
        ref.current?.scrollTo({ x: 0, animated: false });
        position.current = 0;
        offsetX.current = 0;
      }
      slideTo((position.current + 1) * step);
    }, AUTO_SLIDE_MS);
    return () => { clearInterval(timer); stopAnimation(); };
  }, [focused, count, step]);

  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  const pause = () => {
    paused.current = true;
    stopAnimation();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const resumeLater = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { paused.current = false; }, RESUME_AFTER_TOUCH_MS);
  };

  if (!count) return null;

  return (
    <View style={style} onTouchStart={pause} onTouchEnd={resumeLater} onTouchCancel={resumeLater}>
      <View style={hiddenBarOuter}>
      <ScrollView
        ref={ref}
        style={hiddenBarScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        scrollEventThrottle={32}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          offsetX.current = x;
          if (count > 1 && x >= count * step - 1) {
            // Fully on the clone of slide 0 (it looks identical): swap to the real one invisibly.
            stopAnimation();
            ref.current?.scrollTo({ x: 0, animated: false });
            position.current = 0;
            offsetX.current = 0;
            setActive(0);
            return;
          }
          const raw = Math.round(x / step);
          position.current = raw;
          setActive(raw % count);
        }}
        contentContainerStyle={[{ paddingHorizontal: sidePadding, gap }, contentStyle, hiddenBarContent]}
      >
        {(count > 1 ? [...slides, slides[0]] : slides).map((s, i) => (
          <Pressable
            key={i}
            onPress={() => go(s.to)}
            testID={i < count ? `${testIDPrefix}-${i}` : undefined}
            accessibilityElementsHidden={i === count}
            importantForAccessibility={i === count ? 'no-hide-descendants' : 'auto'}
          >
            <Image source={s.img} style={[imageStyle, { width: slideWidth }]} contentFit="cover" />
          </Pressable>
        ))}
      </ScrollView>
      </View>
      {renderDots(active)}
    </View>
  );
}
