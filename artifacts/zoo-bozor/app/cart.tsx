import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { PRODUCTS, formatPrice } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, Notice, ScreenHeader, go, src, useBottomInset } from '@/components/ui';

export default function Cart() {
  const { cart, setQty, removeFromCart } = useApp();
  const bottom = useBottomInset();
  const rows = cart
    .map((c) => ({ c, p: PRODUCTS.find((p) => p.id === c.productId) }))
    .filter((r): r is { c: typeof r.c; p: NonNullable<typeof r.p> } => !!r.p);
  const total = rows.reduce((a, r) => a + r.p.price * r.c.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Savat" />
      {rows.length === 0 ? (
        <EmptyState icon="shopping-cart" title="Savat boʻsh" text="Marketdan ozuqa yoki oʻyinchoq qoʻshing." action={<Button label="Marketga oʻtish" onPress={() => go('/market')} />} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}>
          {rows.map(({ c, p }) => (
            <View key={p.id} style={st.row}>
              <Pressable onPress={() => go(`/product/${p.id}`)}>
                <Image source={src(p.image)} style={st.img} contentFit="cover" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={st.title}>{p.title}</Text>
                <Text style={st.meta}>{p.weight}</Text>
                <Text style={st.price}>{formatPrice(p.price * c.qty)} soʻm</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Pressable onPress={() => removeFromCart(p.id)} hitSlop={8} accessibilityLabel="Oʻchirish">
                  <Feather name="trash-2" size={18} color={C.destructive} />
                </Pressable>
                <View style={st.qty}>
                  <Pressable onPress={() => setQty(p.id, c.qty - 1)} style={st.q} accessibilityLabel="Kamaytirish">
                    <Feather name="minus" size={14} color={C.navy} />
                  </Pressable>
                  <Text style={st.qTxt}>{c.qty}</Text>
                  <Pressable onPress={() => setQty(p.id, c.qty + 1)} style={st.q} accessibilityLabel="Koʻpaytirish">
                    <Feather name="plus" size={14} color={C.navy} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
          <View style={st.total}>
            <Text style={st.totalLabel}>Jami</Text>
            <Text style={st.totalVal}>{formatPrice(total)} soʻm</Text>
          </View>
          <Button label="Buyurtma berish" icon="lock" disabled onPress={() => {}} />
          <Notice text="Toʻlov va buyurtma xizmati hali ulanmagan. Savat faqat shu qurilmada saqlanadi, hech qanday toʻlov amalga oshirilmaydi." />
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: 18, padding: 10 },
  img: { width: 70, height: 70, borderRadius: 14 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  meta: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
  price: { fontFamily: F.dExtra, fontSize: 14, color: C.navy, marginTop: 4 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  q: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  qTxt: { fontFamily: F.dBold, fontSize: 14, color: C.navy, minWidth: 16, textAlign: 'center' },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.navy, borderRadius: 18, padding: 16, marginTop: 6 },
  totalLabel: { fontFamily: F.medium, fontSize: 14, color: C.white },
  totalVal: { fontFamily: F.dExtra, fontSize: 20, color: C.lime },
});
