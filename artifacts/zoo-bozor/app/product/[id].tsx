import React from 'react';
import { Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { COMPACT_WIDTH, useScreenWidth } from '@/hooks/useScreen';
import { EmptyState, ScreenHeader, go, src, useBottomInset, useTopInset } from '@/components/ui';
import { GlassAction } from '@/components/GlassAction';

const spacedPrice = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// Figma "8-Mahsulot ma'lumoti": white 370pt hero with the pack centred, then the same sheet as the animal screen.
const HERO_MAX = 370;

export default function ProductDetail() {
  const { C } = useTheme();
  const st = useSt();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favoriteProducts, toggleFavoriteProduct, addToCart, cart, setQty } = useApp();
  const width = useScreenWidth();
  const { height: windowH } = useWindowDimensions();
  const HERO_H = Math.min(HERO_MAX, Math.round(windowH * 0.44));
  const compact = width < COMPACT_WIDTH;
  const top = useTopInset();
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
  const category = PRODUCT_CATEGORIES.find((c) => c.id === p.category)?.label ?? '';

  const share = () =>
    Share.share({ message: `${p.title} ${p.weight} — ${spacedPrice(p.price)} soʻm. ZOO-BOZOR Market.` }).catch(() => {});

  const rows: { label: string; value: string }[] = [
    { label: 'Kim uchun', value: p.pet },
    { label: 'Mahsulot turi', value: category },
    { label: 'Ogʻirligi', value: p.weight },
    { label: 'Reyting', value: String(p.rating) },
    { label: 'Sotildi', value: `${p.sold} ta` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={[st.hero, { height: HERO_H, paddingTop: top + 20 }]}>
          <Image source={src(p.image)} style={{ width: '70%', height: '100%' }} contentFit="contain" />
          <View style={[st.topBar, { top: top + 10 }]}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/market' as never))} hitSlop={8} style={st.iconBtn} accessibilityLabel="Orqaga" testID="back">
              <Feather name="chevron-left" size={30} color={C.text} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <Pressable onPress={() => toggleFavoriteProduct(p.id)} hitSlop={8} style={st.iconBtn} accessibilityLabel="Saqlash" testID="fav">
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={28} color={fav ? C.lime : C.text} />
              </Pressable>
              <Pressable onPress={share} hitSlop={8} style={st.iconBtn} accessibilityLabel="Ulashish" testID="share">
                <Feather name="share" size={24} color={C.text} />
              </Pressable>
            </View>
          </View>
          <View pointerEvents="none" style={st.counter}>
            <Text style={st.counterTxt}>1/1</Text>
          </View>
        </View>

        <View style={st.sheet}>
          <View style={st.grab} />
          <Text style={st.title}>{p.title}</Text>

          <View style={[st.priceBox, compact && { paddingHorizontal: 14 }]}>
            <View style={{ flexShrink: 1, marginRight: 8 }}>
              <Text style={[st.price, compact && { fontSize: 20 }]} numberOfLines={1} adjustsFontSizeToFit>
                {spacedPrice(p.price)} <Text style={[st.priceCur, compact && { fontSize: 13 }]}>soʻm</Text>
              </Text>
              {p.oldPrice ? <Text style={st.old}>{spacedPrice(p.oldPrice)} soʻm</Text> : null}
            </View>
            {p.oldPrice ? (
              <View style={st.promo}>
                <Text style={st.promoTxt}>Aksiyada</Text>
              </View>
            ) : null}
          </View>

          <Text style={st.h}>Asosiy maʼlumotlar</Text>
          <View style={st.table} testID="product-facts">
            {rows.map((r, i) => (
              <View key={r.label} style={[st.row, i < rows.length - 1 && st.rowSep]}>
                <Text style={st.rowLabel}>{r.label}</Text>
                <Text style={st.rowVal} numberOfLines={1}>{r.value}</Text>
              </View>
            ))}
          </View>

          <Text style={st.h}>
            <Feather name="clipboard" size={16} color={C.text} /> Mahsulot haqida
          </Text>
          <View style={st.box}>
            <Text style={st.desc}>{p.description}</Text>
          </View>

          <Text style={st.h}>
            <Feather name="user" size={16} color={C.text} /> Sotuvchi
          </Text>
          <View style={[st.box, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={st.sellerAv}>
              <Feather name="user" size={26} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.seller}>ZOO-BOZOR Market</Text>
              <Text style={st.muted}>Namuna katalog</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <View style={[st.pill, { flex: 1 }]}>
              <Feather name="clipboard" size={14} color={C.text} />
              <Text style={st.pillTxt}>Eʼlon ID: {p.id.toUpperCase()}</Text>
            </View>
            <Pressable
              style={st.pill}
              onPress={() => Alert.alert('Shikoyat', 'Shikoyatlar xizmati hali serverga ulanmagan.')}
            >
              <Ionicons name="flag" size={14} color={C.text} />
              <Text style={st.pillTxt}>Shikoyat boʻlsa</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Figma shows Yozish/Qoʻngʻiroq glass actions; catalogue products have no seller to message or call,
          so the same glass buttons drive the cart. */}
      <View pointerEvents="box-none" style={[st.actionBar, { paddingBottom: bottom + 16 }, compact && { paddingHorizontal: 14, gap: 8 }]}>
        {inCart ? (
          <View style={st.qty}>
            <Pressable onPress={() => setQty(p.id, inCart.qty - 1)} style={st.qBtn} accessibilityLabel="Kamaytirish" testID="qty-minus">
              <Ionicons name="remove" size={18} color={C.ink} />
            </Pressable>
            <Text style={st.qTxt}>{inCart.qty}</Text>
            <Pressable onPress={() => setQty(p.id, inCart.qty + 1)} style={st.qBtn} accessibilityLabel="Koʻpaytirish" testID="qty-plus">
              <Ionicons name="add" size={18} color={C.ink} />
            </Pressable>
          </View>
        ) : (
          <GlassAction label="Savatga qoʻshish" icon="shopping-bag" onPress={() => addToCart(p.id)} testID="add-to-cart" small={compact} />
        )}
        <GlassAction label="Savatga oʻtish" icon="shopping-cart" onPress={() => go('/cart')} testID="go-cart" small={compact} />
      </View>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  hero: { backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  topBar: { position: 'absolute', left: 22, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  counter: { position: 'absolute', left: 26, bottom: 46, width: 53, height: 28, borderRadius: 27, backgroundColor: 'rgba(8,13,32,0.8)', alignItems: 'center', justifyContent: 'center' },
  counterTxt: { fontFamily: F.dBold, fontSize: 14, color: C.white },
  sheet: { marginTop: -27, backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, width: '100%', maxWidth: 700, alignSelf: 'center' },
  grab: { width: 35, height: 5, borderRadius: 4.5, backgroundColor: '#d2d2d2', alignSelf: 'center', marginBottom: 14 },
  title: { fontFamily: F.dBold, fontSize: 20, color: C.text },
  priceBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, borderRadius: 15, minHeight: 58, paddingVertical: 8, paddingHorizontal: 22, marginTop: 12 },
  price: { fontFamily: F.dExtra, fontSize: 24, color: C.lime },
  priceCur: { fontFamily: F.dBold, fontSize: 15, color: C.lime },
  old: { fontFamily: F.semibold, fontSize: 12, color: C.mutedForeground, textDecorationLine: 'line-through', marginTop: 2 },
  promo: { backgroundColor: C.lime, borderRadius: 27, height: 28, paddingHorizontal: 18, justifyContent: 'center' },
  promoTxt: { fontFamily: F.dBold, fontSize: 14, color: C.ink },
  h: { fontFamily: F.dBold, fontSize: 16, color: C.text, marginTop: 20, marginBottom: 10 },
  table: { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 8 },
  rowSep: { borderBottomWidth: 1, borderBottomColor: C.dark ? C.border : '#ececec' },
  rowLabel: { fontFamily: F.dBold, fontSize: 15, color: C.text },
  rowVal: { fontFamily: F.dMedium, fontSize: 15, color: C.text, flexShrink: 1, textAlign: 'right' },
  box: { backgroundColor: C.card, borderRadius: 10, padding: 14 },
  desc: { fontFamily: F.regular, fontSize: 14, color: C.text, lineHeight: 21 },
  sellerAv: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: C.dark ? C.navySoft : '#cccccc', alignItems: 'center', justifyContent: 'center' },
  seller: { fontFamily: F.dBold, fontSize: 15, color: C.text },
  muted: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 12, height: 40 },
  pillTxt: { fontFamily: F.semibold, fontSize: 12, color: C.text },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 30 },
  qty: { flex: 1, height: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 15, paddingHorizontal: 5, borderWidth: 1, borderColor: C.border },
  qBtn: { width: 33, height: 33, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  qTxt: { fontFamily: F.dBold, fontSize: 16, color: C.text, minWidth: 22, textAlign: 'center' },
}));
