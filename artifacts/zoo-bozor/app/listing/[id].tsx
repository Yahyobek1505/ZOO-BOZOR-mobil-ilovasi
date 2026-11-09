import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Alert } from '@/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { categoryLabel, formatPrice, mapsUrl, timeAgo } from '@/constants/data';
import { displayPhone, phoneHref } from '@/constants/input';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, ScreenHeader, go, src, useBottomInset, useTopInset } from '@/components/ui';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListing, favorites, toggleFavorite, allListings, deleteListing, profile, listingsLoading, listingsError, refreshListings } = useApp();
  const { width } = useWindowDimensions();
  const top = useTopInset();
  const bottom = useBottomInset();
  const [idx, setIdx] = useState(0);
  const item = getListing(String(id));

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <ScreenHeader title="Eʼlon" />
        <EmptyState icon="alert-circle" title={listingsLoading ? 'Yuklanmoqda...' : listingsError ? 'Eʼlonni yuklab boʻlmadi' : 'Eʼlon topilmadi'} text="Internet aloqasini tekshiring yoki qayta urinib koʻring." action={<Button label="Qayta urinish" onPress={refreshListings} />} />
      </View>
    );
  }

  const fav = favorites.includes(item.id);
  const W = Math.min(width, 700);
  const similar = allListings.filter((l) => l.category === item.category && l.id !== item.id).slice(0, 8);

  const share = () =>
    Share.share({ message: `${item.title} — ${formatPrice(item.price)} soʻm, ${item.city}. ZOO-BOZOR ilovasida.` }).catch(() => {});

  const call = () => {
    const uri = phoneHref(item.phone);
    if (!uri) {
      Alert.alert('Raqam mavjud emas', item.sample ? 'Bu namuna katalogdagi eʼlon, sotuvchining telefon raqami yoʻq.' : 'Sotuvchi bu eʼlon uchun toʻliq telefon raqamini kiritmagan.');
      return;
    }
    Linking.openURL(uri).catch(() => Alert.alert('Qoʻngʻiroq oynasi ochilmadi', 'Qurilmada qoʻngʻiroq ilovasi borligini tekshiring.'));
  };

  const openMap = () =>
    Linking.openURL(mapsUrl(item.geo, `${item.city}, ${item.district}`)).catch(() => Alert.alert('Xatolik', 'Xaritani ochib boʻlmadi.'));

  const remove = () =>
    Alert.alert('Eʼlonni oʻchirish', 'Bu eʼlon butunlay oʻchiriladi.', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Oʻchirish',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteListing(item.id);
            if (router.canGoBack()) router.back();
            else router.replace('/my-listings' as never);
          } catch (err) { Alert.alert('Oʻchirilmadi', err instanceof Error ? err.message : 'Qayta urinib koʻring.'); }
        },
      },
    ]);

  const info: { icon: keyof typeof Feather.glyphMap; v: string }[] = [
    { icon: 'tag', v: item.breed || categoryLabel(item.category) },
    { icon: 'user', v: item.gender === 'erkak' ? 'Erkak' : item.gender === 'urgochi' ? 'Urgʻochi' : item.gender === 'aralash' ? 'Aralash' : 'Koʻrsatilmagan' },
    { icon: 'calendar', v: item.age || '—' },
    { icon: 'activity', v: item.weight || '—' },
    { icon: 'droplet', v: item.color || '—' },
    ...(item.count ? [{ icon: 'hash' as const, v: `${item.count} dona` }] : []),
    ...(item.documents ? [{ icon: 'file-text' as const, v: item.documents }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      {item.localOnly ? <Text style={{ padding: 12, color: C.navy, backgroundColor: C.lime }}>Bu eski eʼlon faqat qurilmada. Uni hammaga koʻrsatish uchun tahrirlash oynasida importni tasdiqlang.</Text> : null}
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 440 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {(item.images.length ? item.images : [null]).map((im, i) =>
              im !== null ? (
                <Image key={i} source={src(im)} style={{ width, height: 440 }} contentFit="cover" />
              ) : (
                <View key={i} style={{ width, height: 440, backgroundColor: C.secondary }} />
              ),
            )}
          </ScrollView>
          <View style={[st.topBar, { top: top + 6 }]}>
            <Pressable onPress={() => router.back()} style={st.glass} accessibilityLabel="Orqaga" testID="back">
              <Feather name="chevron-left" size={24} color={C.white} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => toggleFavorite(item.id)} style={st.glass} accessibilityLabel="Saqlash" testID="fav">
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? C.lime : C.white} />
              </Pressable>
              <Pressable onPress={share} style={st.glass} accessibilityLabel="Ulashish" testID="share">
                <Feather name="share" size={20} color={C.white} />
              </Pressable>
            </View>
          </View>
          <View style={st.pager}>
            <View style={st.counter}>
              <Text style={st.counterTxt}>
                {idx + 1}/{Math.max(1, item.images.length)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {item.images.map((_, i) => (
                <View key={i} style={[st.pDot, i === idx && { width: 26, backgroundColor: C.lime }]} />
              ))}
            </View>
          </View>
        </View>

        <View style={[st.sheet, { maxWidth: W, alignSelf: 'center', width: '100%' }]}>
          <View style={st.grab} />
          <View style={st.titleRow}>
            <Text style={st.title}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="clock" size={13} color={C.mutedForeground} />
              <Text style={st.muted}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>

          <View style={st.priceBox}>
            <Text style={st.price}>
              {formatPrice(item.price)} <Text style={st.priceCur}>soʻm</Text>
            </Text>
            {item.negotiable ? (
              <View style={st.nego}>
                <Text style={st.negoTxt}>Kelishamiz!</Text>
              </View>
            ) : null}
          </View>

          <View style={st.locRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons name="location" size={16} color={C.navy} />
              <Text style={st.loc}>
                {item.city}, {item.district}
              </Text>
            </View>
            {item.delivery ? (
              <View style={st.delivery}>
                <Text style={st.deliveryTxt}>Yetkazib berish</Text>
                <View style={st.deliveryIcon}>
                  <Feather name="box" size={14} color={C.navy} />
                </View>
              </View>
            ) : null}
          </View>

          {item.vaccinated ? (
            <Pressable
              style={st.health}
              onPress={() => Alert.alert('Emlanganlik', 'Sotuvchi hayvon emlanganini bildirgan. Xariddan oldin veterinar pasportini koʻrib tekshiring.')}
            >
              <View style={st.healthIcon}>
                <Feather name="briefcase" size={18} color={C.destructive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.healthTitle}>Emlanganlik haqida maʼlumot</Text>
                <Text style={st.healthSub}>Sotuvchi tomonidan kiritilgan</Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.white} />
            </Pressable>
          ) : null}

          <Text style={st.h}>
            <Feather name="clipboard" size={16} color={C.navy} /> Maʼlumot
          </Text>
          <View style={st.infoGrid}>
            {info.map((x, i) => (
              <View key={i} style={st.infoCell}>
                <View style={st.infoIcon}>
                  <Feather name={x.icon} size={14} color={C.navy} />
                </View>
                <Text style={st.infoTxt} numberOfLines={1}>{x.v}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={call} accessibilityRole="button" accessibilityLabel={`Telefon: ${displayPhone(item.phone) || 'Raqam kiritilmagan'}`} testID="seller-phone" style={[st.box, { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }]}>
            <Feather name="phone" size={22} color={C.navy} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={st.muted}>Telefon</Text>
              <Text style={st.seller}>{displayPhone(item.phone) || (item.sample ? 'Namuna eʼlon — raqam yoʻq' : 'Raqam kiritilmagan')}</Text>
            </View>
            <Feather name="phone-call" size={20} color={C.navy} />
          </Pressable>

          <Text style={st.h}>
            <Feather name="file-text" size={16} color={C.navy} /> Hayvon haqida tavsif
          </Text>
          <View style={st.box}>
            <Text style={st.desc}>{item.description}</Text>
          </View>

          <Text style={st.h}>
            <Feather name="user" size={16} color={C.navy} /> Sotuvchi
          </Text>
          <View style={[st.box, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={st.sellerAv}>
              <Feather name="user" size={22} color={C.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.seller}>{item.own ? profile.name || 'Siz' : item.sellerName}</Text>
              <Text style={st.muted}>{item.own ? 'Bu sizning eʼloningiz' : item.sample ? 'Namuna katalog' : 'Sotuvchi'}</Text>
            </View>
            {item.own ? (
              <Pressable onPress={() => go('/profile')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={st.seller}>Profil</Text>
                <Feather name="chevron-right" size={18} color={C.navy} />
              </Pressable>
            ) : null}
          </View>

          <Text style={st.h}>
            <Ionicons name="location" size={16} color={C.navy} /> Joylashuv
          </Text>
          <View style={[st.box, { gap: 12 }]}>
            <Text style={st.seller}>
              {item.city}, {item.district}
            </Text>
            <Text style={st.muted}>
              Koordinatalar: {item.geo.lat.toFixed(4)}, {item.geo.lng.toFixed(4)}
            </Text>
            <Button label="Karta boʻyicha" icon="map" onPress={openMap} testID="open-map" />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <View style={[st.pill, { flex: 1 }]}>
              <Feather name="hash" size={14} color={C.navy} />
              <Text style={st.pillTxt}>Eʼlon ID: {item.id.slice(-6).toUpperCase()}</Text>
            </View>
            <Pressable
              style={st.pill}
              onPress={() => Alert.alert('Shikoyat', 'Shikoyatlar xizmati hali serverga ulanmagan. Shubhali eʼlon boʻlsa, mahalliy veterinariya yoki huquq-tartibot organlariga murojaat qiling.')}
            >
              <Feather name="flag" size={14} color={C.navy} />
              <Text style={st.pillTxt}>Shikoyat boʻlsa</Text>
            </Pressable>
          </View>

          {item.own ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button label="Tahrirlash" icon="edit-2" variant="navy" style={{ flex: 1 }} onPress={() => go(`/listing/edit?id=${item.id}`)} testID="edit-listing" />
              {!item.localOnly ? <Button label="Oʻchirish" icon="trash-2" variant="danger" onPress={remove} testID="delete-listing" /> : null}
            </View>
          ) : null}
        </View>

        {similar.length ? (
          <View style={st.similar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {similar.map((l) => (
                <Pressable key={l.id} onPress={() => router.push(`/listing/${l.id}` as never)} style={st.simCard}>
                  {l.images[0] !== undefined ? <Image source={src(l.images[0])} style={st.simImg} /> : <View style={[st.simImg, { backgroundColor: C.secondary }]} />}
                  <View style={{ padding: 8 }}>
                    <Text style={st.simTitle} numberOfLines={1}>{l.title}</Text>
                    <Text style={st.simPrice}>{formatPrice(l.price)} UZS</Text>
                    <View style={st.more}>
                      <Text style={st.moreTxt}>Batafsil</Text>
                      <Feather name="chevrons-right" size={12} color={C.lime} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          <Feather name="info" size={12} color={C.mutedForeground} />
          <Text style={st.muted}>Hayvon va hujjatlarni xariddan oldin tekshiring.</Text>
        </View>
      </ScrollView>

      {!item.own ? (
        <View style={[st.actionBar, { paddingBottom: bottom + 10 }]}>
          <Button label="Yozish" icon="message-circle" variant="navy" style={{ flex: 1 }} onPress={() => go(`/messages/${item.id}`)} testID="write" />
          <Button label="Qoʻngʻiroq" icon="phone" style={{ flex: 1 }} onPress={call} testID="call" />
        </View>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  glass: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center' },
  pager: { position: 'absolute', bottom: 36, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  counter: { backgroundColor: C.overlay, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  counterTxt: { fontFamily: F.semibold, fontSize: 12, color: C.white },
  pDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.white },
  sheet: { marginTop: -24, backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16 },
  grab: { width: 44, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: F.dExtra, fontSize: 21, color: C.navy },
  muted: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
  priceBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, borderRadius: 16, padding: 14, marginTop: 12 },
  price: { fontFamily: F.dExtra, fontSize: 24, color: C.lime },
  priceCur: { fontFamily: F.dBold, fontSize: 15, color: C.lime },
  nego: { backgroundColor: C.lime, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  negoTxt: { fontFamily: F.dBold, fontSize: 13, color: C.navy },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  loc: { fontFamily: F.dSemibold, fontSize: 14, color: C.navy },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.white, borderRadius: 14, paddingLeft: 12, padding: 4 },
  deliveryTxt: { fontFamily: F.semibold, fontSize: 12, color: C.navy },
  deliveryIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  health: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.destructive, borderRadius: 16, padding: 12, marginTop: 14 },
  healthIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  healthTitle: { fontFamily: F.dBold, fontSize: 14, color: C.white },
  healthSub: { fontFamily: F.regular, fontSize: 11, color: C.white, opacity: 0.85 },
  h: { fontFamily: F.dBold, fontSize: 16, color: C.navy, marginTop: 20, marginBottom: 10 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoCell: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.white, borderRadius: 12, padding: 6, paddingRight: 12, maxWidth: '100%' },
  infoIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  infoTxt: { fontFamily: F.semibold, fontSize: 13, color: C.navy, flexShrink: 1 },
  box: { backgroundColor: C.white, borderRadius: 16, padding: 14 },
  desc: { fontFamily: F.regular, fontSize: 14, color: C.navy, lineHeight: 21 },
  sellerAv: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  seller: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 12, height: 40 },
  pillTxt: { fontFamily: F.semibold, fontSize: 12, color: C.navy },
  similar: { backgroundColor: C.secondary, borderRadius: 24, paddingVertical: 14, marginTop: 8 },
  simCard: { width: 130, backgroundColor: C.white, borderRadius: 14, overflow: 'hidden' },
  simImg: { width: 130, height: 100 },
  simTitle: { fontFamily: F.dBold, fontSize: 12, color: C.navy },
  simPrice: { fontFamily: F.dExtra, fontSize: 13, color: C.navy, marginVertical: 4 },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: C.navy, borderRadius: 8, paddingVertical: 4 },
  moreTxt: { fontFamily: F.semibold, fontSize: 11, color: C.lime },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, backgroundColor: 'rgba(246,246,246,0.96)' },
});
