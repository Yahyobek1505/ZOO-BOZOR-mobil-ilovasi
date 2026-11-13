import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { PRODUCTS } from '@/constants/data';
import { displayPhone } from '@/constants/input';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, Notice, go, src, useBottomInset, useTopInset } from '@/components/ui';

const spaced = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const PAYMENT_METHODS = ['Karta orqali', 'Click', 'Payme', 'Uzum Bank'];

/**
 * Figma "Rasmilashtirish". Orders and payments are not connected, so the page only shows what would
 * be ordered: delivery choice is local, payment methods are marked "tez orada" and the order button
 * explains that ordering is not available yet. No card details are collected.
 */
export default function Cart() {
  const { C } = useTheme();
  const st = useSt();
  const { cart, setQty, profile } = useApp();
  const top = useTopInset();
  const bottom = useBottomInset();
  const [delivery, setDelivery] = useState(true);
  const rows = cart
    .map((c) => ({ c, p: PRODUCTS.find((p) => p.id === c.productId) }))
    .filter((r): r is { c: typeof r.c; p: NonNullable<typeof r.p> } => !!r.p);
  const count = rows.reduce((a, r) => a + r.c.qty, 0);
  const total = rows.reduce((a, r) => a + r.p.price * r.c.qty, 0);

  const header = (
    <View style={[st.head, { paddingTop: top + 14 }]}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/market' as never))} hitSlop={10} style={{ width: 40 }} accessibilityRole="button" accessibilityLabel="Orqaga" testID="back">
        <Feather name="chevron-left" size={28} color={C.text} />
      </Pressable>
      <Text style={st.headTitle}>Rasmilashtirish</Text>
      <Pressable onPress={() => go('/saved')} hitSlop={8} style={{ width: 40, alignItems: 'flex-end' }} accessibilityRole="button" accessibilityLabel="Saqlanganlar">
        <Ionicons name="heart" size={26} color={C.text} />
      </Pressable>
    </View>
  );

  if (!rows.length) {
    return (
      <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
        {header}
        <EmptyState icon="shopping-cart" title="Savat boʻsh" text="Marketdan ozuqa yoki oʻyinchoq qoʻshing." action={<Button label="Marketga oʻtish" onPress={() => go('/market')} />} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
      {header}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, gap: 12, paddingBottom: bottom + 100 }}>
        <View style={st.box}>
          <Text style={st.h}>Qabul qilish <Text style={st.req}>*</Text></Text>
          <View style={st.toggle}>
            <Pressable onPress={() => setDelivery(true)} style={[st.toggleBtn, delivery && st.toggleOn]} accessibilityRole="radio" accessibilityState={{ selected: delivery }} testID="cart-delivery">
              <Feather name="truck" size={18} color={delivery ? C.lime : C.mutedDark} />
              <Text style={[st.toggleTxt, delivery && { color: C.white }]}>Yetkazib berish</Text>
            </Pressable>
            <Pressable onPress={() => setDelivery(false)} style={[st.toggleBtn, !delivery && st.toggleOn]} accessibilityRole="radio" accessibilityState={{ selected: !delivery }} testID="cart-pickup">
              <Feather name="package" size={18} color={!delivery ? C.lime : C.mutedDark} />
              <Text style={[st.toggleTxt, !delivery && { color: C.white }]}>Olib ketish</Text>
            </Pressable>
          </View>
          <View style={[st.line, st.sep]}>
            <Ionicons name="location" size={18} color={C.text} />
            <Text style={st.lineTxt} numberOfLines={1}>{profile.region || 'Hudud koʻrsatilmagan'}</Text>
            <Pressable onPress={() => go('/profile-edit')} hitSlop={8} style={st.editLink} accessibilityRole="button" testID="cart-edit-address">
              <Text style={st.editTxt}>Manzilni tahrirlash</Text>
              <Feather name="edit-2" size={13} color={C.text} />
            </Pressable>
          </View>
          <View style={st.line}>
            <Feather name="user" size={18} color={C.text} />
            <Text style={st.lineTxt} numberOfLines={1}><Text style={{ fontFamily: F.dBold }}>F.I.O: </Text>{profile.name || 'Kiritilmagan'}</Text>
            <Feather name="phone-call" size={16} color={C.text} />
            <Text style={st.phone}>{displayPhone(profile.phone) || '—'}</Text>
          </View>
        </View>

        <View style={[st.box, { backgroundColor: C.card, borderWidth: 1, borderColor: C.dark ? C.border : '#efefef' }]}>
          <View style={[st.line, { marginBottom: 4 }]}>
            <Text style={[st.h, { flex: 1 }]}>Tanlangan mahsulotlar <Text style={st.req}>*</Text></Text>
            <Pressable onPress={() => go('/market')} hitSlop={8} accessibilityRole="link">
              <Text style={[st.editTxt, { color: C.success }]}>Mahsulot qoʻshish</Text>
            </Pressable>
          </View>
          {rows.map(({ c, p }, i) => (
            <View key={p.id} style={[st.item, i < rows.length - 1 && st.sep]} testID={`cart-item-${p.id}`}>
              <Pressable onPress={() => go(`/product/${p.id}`)} accessibilityRole="button" accessibilityLabel={p.title}>
                <Image source={src(p.image)} style={st.img} contentFit="cover" />
              </Pressable>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={st.title} numberOfLines={1}>{p.title}</Text>
                <View style={st.qty}>
                  <Pressable onPress={() => setQty(p.id, c.qty - 1)} style={st.q} accessibilityLabel="Kamaytirish" testID={`cart-minus-${p.id}`}>
                    <Feather name="minus" size={14} color={C.white} />
                  </Pressable>
                  <Text style={st.qTxt}>{c.qty}</Text>
                  <Pressable onPress={() => setQty(p.id, c.qty + 1)} style={st.q} accessibilityLabel="Koʻpaytirish" testID={`cart-plus-${p.id}`}>
                    <Feather name="plus" size={14} color={C.white} />
                  </Pressable>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={st.price}>{spaced(p.price * c.qty)} <Text style={st.cur}>soʻm</Text></Text>
                {c.qty > 1 ? <Text style={st.unit}>{spaced(p.price)} soʻm / dona</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View style={st.box}>
          <Text style={st.h}>Toʻlov usuli <Text style={st.req}>*</Text></Text>
          {PAYMENT_METHODS.map((m, i) => (
            <View key={m} style={[st.pay, i < PAYMENT_METHODS.length - 1 && st.sep]} accessibilityState={{ disabled: true }}>
              <Text style={st.payTxt}>{m}</Text>
              <Text style={st.soon}>tez orada</Text>
              <View style={st.radio} />
            </View>
          ))}
        </View>

        <View style={[st.box, { backgroundColor: C.card, borderWidth: 1, borderColor: C.dark ? C.border : '#efefef' }]}>
          <Text style={st.h}>Buyurtmalar hisobi</Text>
          <View style={[st.sum, st.sep]}>
            <Text style={st.sumLabel}>Mahsulotlar ({count})</Text>
            <Text style={st.sumVal}>{spaced(total)} soʻm</Text>
          </View>
          <View style={st.sum}>
            <Text style={st.sumLabel}>{delivery ? 'Yetkazib berish' : 'Olib ketish'}</Text>
            <Text style={[st.sumVal, { color: C.mutedDark }]}>Sotuvchi bilan kelishiladi</Text>
          </View>
        </View>

        <Notice text="Toʻlov va buyurtma xizmati hali ulanmagan. Savat faqat shu qurilmada saqlanadi, hech qanday toʻlov amalga oshirilmaydi." />
      </ScrollView>

      <View pointerEvents="box-none" style={[st.orderWrap, { paddingBottom: bottom + 14 }]}>
        <Pressable
          onPress={() => Alert.alert('Buyurtma berish', 'Buyurtma va toʻlov xizmati hali ulanmagan. Mahsulot uchun sotuvchi bilan bevosita bogʻlaning.')}
          style={({ pressed }) => [st.order, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          testID="cart-order"
        >
          <Text style={st.orderTxt}>Buyurtma berish</Text>
          <View style={st.orderArrow}><Feather name="arrow-right" size={14} color={C.ink} /></View>
        </Pressable>
      </View>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  headTitle: { fontFamily: F.dBold, fontSize: 18, color: C.text },
  box: { backgroundColor: C.dark ? C.card : '#f6f6f6', borderRadius: 12, padding: 14 },
  h: { fontFamily: F.dBold, fontSize: 15, color: C.text, marginBottom: 10 },
  req: { color: C.success },
  toggle: { flexDirection: 'row', backgroundColor: C.dark ? '#1f3a24' : '#d5f0c9', borderRadius: 12, padding: 3 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 38, borderRadius: 10 },
  toggleOn: { backgroundColor: C.navy },
  toggleTxt: { fontFamily: F.dBold, fontSize: 14, color: C.mutedDark },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  lineTxt: { flex: 1, fontFamily: F.dMedium, fontSize: 15, color: C.text },
  sep: { borderBottomWidth: 1, borderBottomColor: C.dark ? C.border : '#e6e6e6' },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editTxt: { fontFamily: F.dMedium, fontSize: 12, color: C.success, textDecorationLine: 'underline' },
  phone: { fontFamily: F.dMedium, fontSize: 13, color: C.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  img: { width: 72, height: 72, borderRadius: 14, backgroundColor: C.secondary },
  title: { fontFamily: F.dBold, fontSize: 14, color: C.text },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  q: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  qTxt: { fontFamily: F.dMedium, fontSize: 14, color: C.text, minWidth: 26, textAlign: 'center' },
  price: { fontFamily: F.dBold, fontSize: 15, color: C.text },
  cur: { fontFamily: F.dMedium, fontSize: 11 },
  unit: { fontFamily: F.dMedium, fontSize: 10, color: C.mutedDark, marginTop: 2 },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, opacity: 0.55 },
  payTxt: { flex: 1, fontFamily: F.dMedium, fontSize: 15, color: C.text },
  soon: { fontFamily: F.dMedium, fontSize: 11, color: C.mutedDark },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#c4c4c4' },
  sum: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingVertical: 9 },
  sumLabel: { fontFamily: F.dMedium, fontSize: 14, color: C.text },
  sumVal: { flexShrink: 1, fontFamily: F.dBold, fontSize: 14, color: C.text, textAlign: 'right' },
  orderWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  order: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 48, borderRadius: 14, backgroundColor: C.navy, paddingHorizontal: 44 },
  orderTxt: { fontFamily: F.dBold, fontSize: 16, color: C.white },
  orderArrow: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
}));
