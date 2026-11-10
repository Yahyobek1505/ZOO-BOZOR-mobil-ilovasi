import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '@/constants/colors';
import { BrandMark, go } from '@/components/ui';
import { useLocale } from '@/context/LocaleContext';

function PostCta({ style }: { style?: object }) {
  const { t } = useLocale();
  return (
    <Pressable onPress={() => go('/listing/edit')} accessibilityRole="button" accessibilityLabel={t('Eʼlon berish')} testID="add-listing" style={({ pressed }) => [st.cta, style, pressed && { transform: [{ scale: 0.96 }] }]}>
      <Ionicons name="megaphone" size={19} color={C.white} />
      <Text style={st.ctaText}>Eʼlon berish</Text>
    </Pressable>
  );
}

function NativeTabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  return (
    <View style={{ flex: 1 }}>
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
      <NativeTabs.Trigger name="listings">
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }} />
        <NativeTabs.Trigger.Label>{t('Eʼlonlar')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <NativeTabs.Trigger.Label>{t('Profil')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
      <View pointerEvents="box-none" style={[st.nativeCta, { bottom: insets.bottom + 62 }]}>
        <PostCta />
      </View>
    </View>
  );
}

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  market: 'shopping-bag',
  map: 'map-pin',
  listings: 'calendar',
  profile: 'user',
};
const LABELS: Record<string, string> = {
  market: 'Market',
  map: 'Xarita',
  index: 'Bosh sahifa',
  listings: 'Eʼlonlar',
  profile: 'Profil',
};

function BrandTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const bottom = Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 10);
  return (
    <View pointerEvents="box-none" style={[st.outer, { paddingBottom: bottom }]}>
      <PostCta style={{ alignSelf: 'center', marginBottom: 8 }} />
      <View style={st.bar}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, st.webGlass]} />
        ) : (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: C.glassNavy }]} />
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const onPress = () => {
            if (!focused) navigateToTab(route.key);
          };
          if (route.name === 'index') {
            return (
              <Pressable key={route.key} onPress={onPress} style={st.item} accessibilityLabel={t(LABELS.index)} testID="tab-index">
                <View style={[st.home, focused && { backgroundColor: C.lime }]}>
                  <BrandMark size={24} color={focused ? C.navy : C.white} />
                </View>
              </Pressable>
            );
          }
          return (
            <Pressable key={route.key} onPress={onPress} style={st.item} accessibilityLabel={t(LABELS[route.name])} testID={`tab-${route.name}`}>
              <Feather name={ICONS[route.name] ?? 'circle'} size={23} color={focused ? C.lime : C.white} />
              <View style={[st.dot, focused && { backgroundColor: C.lime }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ClassicTabLayout() {
  const { t } = useLocale();
  return (
    <Tabs screenOptions={{ headerShown: false, lazy: false, freezeOnBlur: true, sceneStyle: { backgroundColor: C.surface } }} tabBar={(p) => <BrandTabBar {...p} />}>
      <Tabs.Screen name="market" options={{ title: t('Market') }} />
      <Tabs.Screen name="map" options={{ title: t('Xarita') }} />
      <Tabs.Screen name="index" options={{ title: t('Bosh sahifa') }} />
      <Tabs.Screen name="listings" options={{ title: t('Eʼlonlar') }} />
      <Tabs.Screen name="profile" options={{ title: t('Profil') }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}

const st = StyleSheet.create({
  outer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.glassBorder,
    height: 60,
    paddingHorizontal: 6,
    shadowColor: C.navy,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  webGlass: { backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)' } as object,
  nativeCta: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.navy, height: 40, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.navy, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  ctaText: { fontFamily: F.dExtra, fontSize: 14, color: C.lime, letterSpacing: 0.2 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  home: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5, backgroundColor: 'transparent' },
});
