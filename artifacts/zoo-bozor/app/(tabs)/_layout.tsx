import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '@/constants/colors';
import { BrandMark } from '@/components/ui';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="market">
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
        <NativeTabs.Trigger.Label>Market</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} />
        <NativeTabs.Trigger.Label>Xarita</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'pawprint', selected: 'pawprint.fill' }} />
        <NativeTabs.Trigger.Label>Bosh sahifa</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="listings">
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }} />
        <NativeTabs.Trigger.Label>Eʼlonlar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
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
  const bottom = Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 10);
  return (
    <View pointerEvents="box-none" style={[st.outer, { paddingBottom: bottom }]}>
      <View style={st.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const onPress = () => {
            if (!focused) navigateToTab(route.key);
          };
          if (route.name === 'index') {
            return (
              <Pressable key={route.key} onPress={onPress} style={st.item} accessibilityLabel={LABELS.index} testID="tab-index">
                <View style={[st.home, focused && { backgroundColor: C.lime }]}>
                  <BrandMark size={26} color={focused ? C.navy : C.white} />
                </View>
              </Pressable>
            );
          }
          return (
            <Pressable key={route.key} onPress={onPress} style={st.item} accessibilityLabel={LABELS[route.name]} testID={`tab-${route.name}`}>
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
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.surface } }} tabBar={(p) => <BrandTabBar {...p} />}>
      <Tabs.Screen name="market" options={{ title: 'Market' }} />
      <Tabs.Screen name="map" options={{ title: 'Xarita' }} />
      <Tabs.Screen name="index" options={{ title: 'Bosh sahifa' }} />
      <Tabs.Screen name="listings" options={{ title: 'Eʼlonlar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
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
    backgroundColor: C.navy,
    borderRadius: 30,
    height: 64,
    paddingHorizontal: 6,
    shadowColor: C.navy,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  home: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5, backgroundColor: 'transparent' },
});
