import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { C, F } from '@/constants/colors';
import { timeAgo } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, Notice, ScreenHeader, go, src, useBottomInset } from '@/components/ui';

export default function Messages() {
  const { conversations, getListing } = useApp();
  const bottom = useBottomInset();
  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Xabarlar" />
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.listingId}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}
        ListHeaderComponent={<Notice text="Xabar yuborish xizmati hali ulanmagan. Bu yerda faqat shu qurilmada saqlangan qoralamalaringiz turadi — ular sotuvchiga yetkazilmaydi." />}
        ListEmptyComponent={
          <EmptyState icon="message-circle" title="Qoralamalar yoʻq" text="Eʼlon sahifasidagi Yozish tugmasi orqali sotuvchiga savollaringizni tayyorlab qoʻying." action={<Button label="Eʼlonlarni koʻrish" onPress={() => go('/listings')} />} />
        }
        renderItem={({ item }) => {
          const l = getListing(item.listingId);
          const last = item.messages[item.messages.length - 1];
          return (
            <Pressable onPress={() => go(`/messages/${item.listingId}`)} style={st.row}>
              {l?.images[0] !== undefined ? <Image source={src(l.images[0])} style={st.av} /> : <View style={[st.av, { backgroundColor: C.secondary }]} />}
              <View style={{ flex: 1 }}>
                <Text style={st.title} numberOfLines={1}>{l?.title ?? 'Oʻchirilgan eʼlon'}</Text>
                <Text style={st.last} numberOfLines={1}>{last?.text}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={st.time}>{last ? timeAgo(last.at) : ''}</Text>
                <View style={st.tag}>
                  <Text style={st.tagTxt}>{item.messages.length} qoralama</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: 18, padding: 10 },
  av: { width: 54, height: 54, borderRadius: 27 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  last: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground, marginTop: 2 },
  time: { fontFamily: F.regular, fontSize: 11, color: C.mutedForeground },
  tag: { backgroundColor: C.secondary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  tagTxt: { fontFamily: F.semibold, fontSize: 10, color: C.navy },
});
