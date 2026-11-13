import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/ui';
import { CalendarGavelIcon, MapTabIcon, MarketTabIcon, UserTabIcon } from '@/components/FigmaIcons';
import { useLocale } from '@/context/LocaleContext';

// Posting a listing lives in the header "+" button (Figma 10-Bosh Sahifa / 7-Market),
// so the tab bar carries only the five destinations.
function NativeTabLayout() {
  const { t } = useLocale();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="market">
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
        <NativeTabs.Trigger.Label>{t('Market')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} />
        <NativeTabs.Trigger.Label>{t('Xarita')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'pawprint', selected: 'pawprint.fill' }} />
        <NativeTabs.Trigger.Label>{t('Bosh sahifa')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="savdo">
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} />
        <NativeTabs.Trigger.Label>{t('Savdo')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <NativeTabs.Trigger.Label>{t('Profil')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const LABELS: Record<string, string> = {
  market: 'Market',
  map: 'Xarita',
  index: 'Bosh sahifa',
  savdo: 'Savdo',
  profile: 'Profil',
};

/** Figma tab-bar glyphs (node 1103:131); active tab is lime, others white. */
function TabGlyph({ name, color }: { name: string; color: string }) {
  switch (name) {
    case 'market': return <MarketTabIcon size={35} color={color} />;
    case 'map': return <MapTabIcon size={32} color={color} />;
    case 'index': return <BrandMark size={36} color={color} />;
    case 'savdo': return <CalendarGavelIcon size={24} color={color} />;
    case 'profile': return <UserTabIcon size={25} color={color} />;
    default: return null;
  }
}

function BrandTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const st = useSt();
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  // Figma: 358×64 bar, 22px side margins, bottom edge 43px above the screen edge.
  const bottom = (Platform.OS === 'web' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 10)) + 9;
  return (
    <View pointerEvents="box-none" style={[st.outer, { paddingBottom: bottom }]}>
      <View style={st.bar}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, st.webGlass]} />
        ) : (
          <>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: C.glassTab }]} />
          </>
        )}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          return (
            <Pressable
              key={route.key}
              onPress={() => { if (!focused) navigateToTab(route.key); }}
              style={({ pressed }) => [st.item, pressed && { opacity: 0.7 }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={t(LABELS[route.name] ?? route.name)}
              testID={`tab-${route.name}`}
            >
              <TabGlyph name={route.name} color={focused ? C.lime : C.white} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ClassicTabLayout() {
  const { C } = useTheme();
  const { t } = useLocale();
  return (
    <Tabs screenOptions={{ headerShown: false, lazy: false, freezeOnBlur: true, sceneStyle: { backgroundColor: C.surface } }} tabBar={(p) => <BrandTabBar {...p} />}>
      <Tabs.Screen name="market" options={{ title: t('Market') }} />
      <Tabs.Screen name="map" options={{ title: t('Xarita') }} />
      <Tabs.Screen name="index" options={{ title: t('Bosh sahifa') }} />
      <Tabs.Screen name="savdo" options={{ title: t('Savdo') }} />
      <Tabs.Screen name="profile" options={{ title: t('Profil') }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}

const useSt = makeStyles((C) => ({
  outer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingHorizontal: 22 },
  bar: {
    width: '100%',
    maxWidth: 358,
    height: 64,
    borderRadius: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  // Figma: fill #060d26 at 20% with a 20px glass blur. The web fallback is a touch
  // denser so the white glyphs stay readable over light screens without native blur.
  webGlass: {
    backgroundColor: C.dark ? 'rgba(30,37,64,0.78)' : 'rgba(6,13,38,0.32)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  } as object,
  item: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
}));
