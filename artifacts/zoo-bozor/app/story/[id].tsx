import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { STORIES } from '@/constants/data';
import { useBottomInset, useTopInset } from '@/components/ui';

export default function Story() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const top = useTopInset();
  const bottom = useBottomInset();
  const i = Math.max(0, STORIES.findIndex((s) => s.id === id));
  const s = STORIES[i];
  const next = () => (i < STORIES.length - 1 ? router.replace(`/story/${STORIES[i + 1].id}` as never) : router.back());
  const prev = () => (i > 0 ? router.replace(`/story/${STORIES[i - 1].id}` as never) : undefined);

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <View style={[st.bars, { top: top + 8 }]}>
        {STORIES.map((x, j) => (
          <View key={x.id} style={[st.bar, j <= i && { backgroundColor: C.lime }]} />
        ))}
      </View>
      <Pressable onPress={() => router.back()} style={[st.close, { top: top + 22 }]} accessibilityLabel="Yopish" testID="close-story">
        <Feather name="x" size={24} color={C.white} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
        <Image source={s.image} style={st.img} />
        <Text style={st.title}>{s.title}</Text>
        <Text style={st.text}>{s.text}</Text>
      </View>
      <View style={[st.nav, { paddingBottom: bottom + 16 }]}>
        <Pressable onPress={prev} style={[st.navBtn, i === 0 && { opacity: 0.3 }]} disabled={i === 0} accessibilityLabel="Oldingi">
          <Feather name="chevron-left" size={22} color={C.white} />
        </Pressable>
        <Pressable onPress={next} style={[st.navBtn, { backgroundColor: C.lime }]} accessibilityLabel="Keyingi">
          <Feather name={i === STORIES.length - 1 ? 'check' : 'chevron-right'} size={22} color={C.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bars: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 4, zIndex: 2 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  close: { position: 'absolute', right: 16, zIndex: 2, padding: 6 },
  img: { width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: C.lime },
  title: { fontFamily: F.dExtra, fontSize: 26, color: C.white, textAlign: 'center' },
  text: { fontFamily: F.regular, fontSize: 16, color: C.white, opacity: 0.85, textAlign: 'center', lineHeight: 24 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  navBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' },
});
