import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { phoneHref } from '@/constants/input';
import { SAMPLE_SELLER } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { EmptyState, ListingCard, ScreenHeader, go, useBottomInset, useTopInset } from '@/components/ui';
import { CardGrid } from '@/components/CardGrid';
import { GlassAction } from '@/components/GlassAction';
import { MailIcon } from '@/components/FigmaIcons';

type Tab = 'listings' | 'goods';
const GUTTER = 7;

/** Figma "15-Shaxsiy Profil 08": public seller page with their listings. */
export default function SellerProfile() {
  const { C } = useTheme();
  const st = useSt();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allListings } = useApp();
  const top = useTopInset();
  const bottom = useBottomInset();
  const [tab, setTab] = useState<Tab>('listings');

  const listings = useMemo(
    () => allListings.filter((l) => (id === SAMPLE_SELLER ? l.sample : l.ownerId === id)),
    [allListings, id],
  );

  if (!listings.length) {
    return (
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <ScreenHeader title="Profil" />
        <EmptyState icon="user-x" title="Sotuvchi topilmadi" text="Bu sotuvchining faol eʼlonlari yoʻq." />
      </View>
    );
  }

  const first = listings[0];
  const own = !!first.own;
  const name = first.sellerName || 'Sotuvchi';
  // The seller's most common city stands in for their region.
  const cities = listings.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.city]: (acc[l.city] ?? 0) + 1 }), {});
  const city = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const rated = listings.filter((l) => l.rating > 0);
  const rating = rated.length ? rated.reduce((a, l) => a + l.rating, 0) / rated.length : 0;
  const shortId = id === SAMPLE_SELLER ? 'NAMUNA' : String(id).slice(-6).toUpperCase();

  const call = () => {
    const uri = listings.map((l) => phoneHref(l.phone)).find(Boolean);
    if (!uri) {
      Alert.alert('Raqam mavjud emas', id === SAMPLE_SELLER ? 'Bu namuna katalogdagi sotuvchi, telefon raqami yoʻq.' : 'Sotuvchi telefon raqamini kiritmagan.');
      return;
    }
    Linking.openURL(uri).catch(() => Alert.alert('Qoʻngʻiroq oynasi ochilmadi', 'Qurilmada qoʻngʻiroq ilovasi borligini tekshiring.'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[st.head, { paddingTop: top + 14 }]}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as never))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Orqaga" testID="back" style={st.headLeft}>
            <Feather name="chevron-left" size={28} color={C.text} />
            <Text style={st.headTitle}>Profil</Text>
          </Pressable>
          <View style={st.headActions}>
            <Pressable onPress={() => go('/saved')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Saqlangan">
              <Ionicons name="heart" size={26} color={C.text} />
            </Pressable>
            <Pressable onPress={() => go('/messages')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Xabarlar">
              <MailIcon size={28} color={C.text} />
            </Pressable>
          </View>
        </View>

        <View style={st.card} testID="seller-card">
          <View style={st.cardTop}>
            <View style={st.avatar}>
              <Feather name="user" size={34} color={C.white} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={st.name} numberOfLines={1}>{name}</Text>
              <View style={st.metaRow}>
                <Feather name="user" size={13} color="#9AA0B7" />
                <Text style={st.meta}>Sotuvchi</Text>
                {city ? <>
                  <Ionicons name="location" size={13} color="#9AA0B7" style={{ marginLeft: 8 }} />
                  <Text style={st.meta} numberOfLines={1}>{city}</Text>
                </> : null}
              </View>
            </View>
          </View>
          <View style={st.divider} />
          <View style={st.cardBottom}>
            <MaterialCommunityIcons name="card-account-details-outline" size={26} color={C.lime} />
            <Text style={st.about} numberOfLines={3}>
              {id === SAMPLE_SELLER ? 'Namuna katalogdagi eʼlonlar' : `${listings.length} ta faol eʼlon`}
            </Text>
            <View style={st.vSep} />
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              {rating > 0 ? (
                <View style={st.metaRow}>
                  <Ionicons name="star" size={16} color={C.star} />
                  <Text style={st.rating}>{rating.toFixed(1)}</Text>
                </View>
              ) : null}
              <Text style={st.idTxt}><Text style={{ color: C.lime }}>ID </Text>{shortId}</Text>
            </View>
          </View>
        </View>

        <View style={st.segment}>
          {(['listings', 'goods'] as const).map((key) => {
            const active = tab === key;
            return (
              <View key={key} style={{ flex: 1, alignItems: 'center' }}>
                <Pressable onPress={() => setTab(key)} style={[st.segBtn, active && st.segActive]} accessibilityRole="tab" accessibilityState={{ selected: active }} testID={`seller-${key}`}>
                  <Text style={[st.segTxt, active && st.segTxtActive]}>{key === 'listings' ? 'Eʼlonlar' : 'Buyumlar'}</Text>
                </Pressable>
                {active ? <View style={st.segBar} /> : null}
              </View>
            );
          })}
        </View>

        <View style={st.panel}>
          {tab === 'listings' ? (
            <CardGrid gap={GUTTER}>
              {listings.map((l) => <ListingCard key={l.id} item={l} />)}
            </CardGrid>
          ) : (
            <EmptyState icon="package" title="Buyumlar yoʻq" text="Bu sotuvchi hozircha buyum sotmayapti." />
          )}
        </View>
      </ScrollView>

      {!own ? (
        <View pointerEvents="box-none" style={[st.actionBar, { paddingBottom: bottom + 16 }]}>
          <GlassAction label="Yozish" icon="message-circle" onPress={() => go(`/messages/${first.id}`)} testID="seller-write" />
          <GlassAction label="Qoʻngʻiroq" icon="phone" onPress={call} testID="seller-call" />
        </View>
      ) : null}
    </View>
  );
}

const useSt = makeStyles((C) => ({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 12 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headTitle: { fontFamily: F.dBold, fontSize: 22, color: C.text },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  card: { backgroundColor: C.navy, borderRadius: 25, marginHorizontal: 14, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#5b6074', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: F.dBold, fontSize: 18, color: C.white },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontFamily: F.dMedium, fontSize: 12, color: '#9AA0B7', flexShrink: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.45)', marginVertical: 14 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  about: { flex: 1, fontFamily: F.dMedium, fontSize: 12, lineHeight: 15, color: C.white },
  vSep: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.35)' },
  rating: { fontFamily: F.dMedium, fontSize: 15, color: C.white },
  idTxt: { fontFamily: F.dMedium, fontSize: 14, color: C.white },
  segment: { flexDirection: 'row', marginHorizontal: 20, marginTop: 10, borderWidth: 1, borderColor: C.border, borderRadius: 25, padding: 4, paddingBottom: 0, height: 50 },
  segBtn: { alignSelf: 'stretch', height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  segActive: { backgroundColor: C.navy },
  segTxt: { fontFamily: F.dBold, fontSize: 16, color: '#b8b8b8' },
  segTxtActive: { color: C.lime },
  segBar: { width: 104, height: 3, borderRadius: 1.5, backgroundColor: C.success, marginTop: 5 },
  panel: { backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 16, paddingTop: 16, paddingHorizontal: 20, minHeight: 300 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 30 },
}));
