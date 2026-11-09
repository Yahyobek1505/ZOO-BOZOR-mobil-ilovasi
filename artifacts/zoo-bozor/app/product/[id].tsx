import React from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { PRODUCTS, PRODUCT_CATEGORIES, formatPrice } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, ScreenHeader, go, src, useBottomInset } from '@/components/ui';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favoriteProducts, toggleFavoriteProduct, addToCart, cart, setQty } = useApp();
  const bottom = useBottomInset();
  const p = PRODUCTS.find((x) => x.id === id);

  if (!p) {
    return (
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <ScreenHeader title="Mahsulot" />
        <EmptyState icon="package" title="Mahsulot topilmadi" text="Katalogga qayting." />
      </View>
    );
  }
  const fav = favoriteProducts.includes(p.id);
  const inCart = cart.find((c) => c.productId === p.id);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader
        title={p.title}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => toggleFavoriteProduct(p.id)} style={st.icon} accessibilityLabel="Saqlash">
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={C.navy} />
            </Pressable>
            <Pressable
              onPress={() => Share.share({ message: `${p.title} ${p.weight} — ${formatPrice(p.price)} soʻm. ZOO-BOZOR Market.` }).catch(() => {})}
              style={st.icon}
              accessibilityLabel="Ulashish"
            >
              <Ionicons name="share-outline" size={20} color={C.navy} />
            </Pressable>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 110, gap: 14 }}>
        <View style={st.imgWrap}>
          <Image source={src(p.image)} style={{ width: '100%', height: '100%' }} contentFit="contain" />
        </View>
        <View style={st.box}>
          <Text style={st.cat}>{PRODUCT_CATEGORIES.find((c) => c.id === p.category)?.label} · {p.weight}</Text>
          <Text style={st.title}>{p.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <Text style={st.price}>{formatPrice(p.price)} soʻm</Text>
            {p.oldPrice ? <Text style={st.old}>{formatPrice(p.oldPrice)}</Text> : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Ionicons name="star" size={14} color={C.star} />
            <Text style={st.meta}>{p.rating} · {p.sold} sotildi</Text>
          </View>
          <Text style={st.desc}>{p.description}</Text>
        </View>
      </ScrollView>
      <View style={[st.bar, { paddingBottom: bottom + 10 }]}>
        {inCart ? (
          <>
            <View style={st.qty}>
              <Pressable onPress={() => setQty(p.id, inCart.qty - 1)} style={st.qBtn} accessibilityLabel="Kamaytirish">
                <Ionicons name="remove" size={18} color={C.navy} />
              </Pressable>
              <Text style={st.qTxt}>{inCart.qty}</Text>
              <Pressable onPress={() => setQty(p.id, inCart.qty + 1)} style={st.qBtn} accessibilityLabel="Koʻpaytirish">
                <Ionicons name="add" size={18} color={C.navy} />
              </Pressable>
            </View>
            <Button label="Savatga oʻtish" icon="shopping-cart" variant="navy" style={{ flex: 1 }} onPress={() => go('/cart')} />
          </>
        ) : (
          <Button label="Savatga qoʻshish" icon="shopping-bag" style={{ flex: 1 }} onPress={() => addToCart(p.id)} testID="add-to-cart" />
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  imgWrap: { height: 320, backgroundColor: C.white, borderRadius: 24, overflow: 'hidden', padding: 12 },
  box: { backgroundColor: C.white, borderRadius: 20, padding: 16 },
  cat: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  title: { fontFamily: F.dExtra, fontSize: 22, color: C.navy, marginTop: 4 },
  price: { fontFamily: F.dExtra, fontSize: 20, color: C.navy },
  old: { fontFamily: F.semibold, fontSize: 14, color: C.sale, textDecorationLine: 'line-through' },
  meta: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  desc: { fontFamily: F.regular, fontSize: 14, color: C.navy, lineHeight: 21, marginTop: 12 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, backgroundColor: C.surface },
  qty: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 6, gap: 6 },
  qBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  qTxt: { fontFamily: F.dBold, fontSize: 16, color: C.navy, minWidth: 22, textAlign: 'center' },
});
