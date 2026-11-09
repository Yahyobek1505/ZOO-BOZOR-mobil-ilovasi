import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Alert } from '@/components/AppAlert';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { categoryLabel, formatPrice, timeAgo } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, ScreenHeader, go, src, useBottomInset } from '@/components/ui';

export default function MyListings() {
  const { myListings, deleteListing, listingsLoading, refreshListings } = useApp();
  const bottom = useBottomInset();

  const confirm = (id: string) =>
    Alert.alert('Eʼlonni oʻchirish', 'Bu eʼlon butunlay oʻchiriladi.', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Oʻchirish', style: 'destructive', onPress: () => { void deleteListing(id).catch((err) => Alert.alert('Oʻchirilmadi', err.message)); } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader
        title="Mening eʼlonlarim"
        right={
          <Pressable onPress={() => go('/listing/edit')} style={st.add} accessibilityLabel="Eʼlon qoʻshish">
            <Feather name="plus" size={20} color={C.navy} />
          </Pressable>
        }
      />
      <FlatList
        data={myListings}
        refreshing={listingsLoading}
        onRefresh={refreshListings}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}
        ListHeaderComponent={<Text style={{ fontFamily: F.regular, color: C.navy, marginBottom: 12 }}>
          Serverdagi eʼlonlar barcha qurilmalarda koʻrinadi. «Faqat qurilmada» deb belgilangan eski eʼlonni ochib, tahrirlang va «Hammaga koʻrsatish»ni tanlang. Import ixtiyoriy; asl nusxa oʻchirilmaydi. Mehmonning boshqa maʼlumotlari ham qurilmada saqlanadi.
        </Text>}
        ListEmptyComponent={
          <EmptyState icon="plus-square" title="Eʼlonlaringiz yoʻq" text="Rasm, narx va manzilni kiriting — eʼlon darhol paydo boʻladi." action={<Button label="Eʼlon joylash" icon="plus" onPress={() => go('/listing/edit')} />} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => go(`/listing/${item.id}`)} style={st.row} testID={`my-${item.id}`}>
            {item.images[0] !== undefined ? <Image source={src(item.images[0])} style={st.img} /> : <View style={[st.img, { backgroundColor: C.secondary }]} />}
            <View style={{ flex: 1 }}>
              <Text style={st.title} numberOfLines={1}>{item.title}</Text>
              <Text style={st.meta}>{categoryLabel(item.category)} · {item.city} · {timeAgo(item.createdAt)}</Text>
              <Text style={st.meta}>{item.localOnly ? 'Faqat qurilmada · import qilinmagan' : 'Hammaga koʻrinadi'}</Text>
              <Text style={st.price}>{formatPrice(item.price)} soʻm</Text>
            </View>
            <View style={{ gap: 8 }}>
              <Pressable onPress={() => go(`/listing/edit?id=${item.id}`)} style={st.act} accessibilityLabel={item.localOnly ? 'Importni tanlash' : 'Tahrirlash'}>
                <Feather name="edit-2" size={16} color={C.navy} />
              </Pressable>
              {!item.localOnly ? <Pressable onPress={() => confirm(item.id)} style={[st.act, { backgroundColor: C.secondary }]} accessibilityLabel="Oʻchirish">
                <Feather name="trash-2" size={16} color={C.destructive} />
              </Pressable> : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const st = StyleSheet.create({
  add: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: 18, padding: 10 },
  img: { width: 78, height: 78, borderRadius: 14 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  meta: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, marginTop: 2 },
  price: { fontFamily: F.dExtra, fontSize: 14, color: C.navy, marginTop: 4 },
  act: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
});
