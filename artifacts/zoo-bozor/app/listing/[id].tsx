import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { COMPACT_WIDTH, useScreenWidth } from '@/hooks/useScreen';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { categoryLabel, formatPrice, mapsUrl, sellerKey, timeAgo } from '@/constants/data';
import { phoneHref } from '@/constants/input';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, ScreenHeader, go, src, useBottomInset, useTopInset } from '@/components/ui';
import { AutoScrollRow } from '@/components/AutoScrollRow';
import { GlassAction } from '@/components/GlassAction';
import { MiniMap } from '@/components/MiniMap';

// Figma "11-Tanlangan mushuk ma'lumoti" (node 30:5) writes the headline price with spaces.
const spacedPrice = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// Figma hero is 400pt on an 874pt-tall frame; short phones get a proportionally shorter hero.
const HERO_MAX = 400;

export default function ListingDetail() {
  const { C } = useTheme();
  const st = useSt();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListing, favorites, toggleFavorite, allListings, deleteListing, profile, listingsLoading, listingsError, refreshListings } = useApp();
  const width = useScreenWidth();
  const { width: windowW, height: windowH } = useWindowDimensions();
  const HERO_H = Math.min(HERO_MAX, Math.round(windowH * 0.46));
  const compact = width < COMPACT_WIDTH;
  const top = useTopInset();
  const bottom = useBottomInset();
  const [idx, setIdx] = useState(0);
  const [viewer, setViewer] = useState(false);
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
    <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
      {item.localOnly ? <Text style={{ padding: 12, color: C.ink, backgroundColor: C.lime }}>Bu eski eʼlon faqat qurilmada. Uni hammaga koʻrsatish uchun tahrirlash oynasida importni tasdiqlang.</Text> : null}
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ height: HERO_H }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {(item.images.length ? item.images : [null]).map((im, i) =>
              im !== null ? (
                <Image key={i} source={src(im)} style={{ width, height: HERO_H }} contentFit="cover" />
              ) : (
                <View key={i} style={{ width, height: HERO_H, backgroundColor: C.secondary }} />
              ),
            )}
          </ScrollView>
          {/* Figma: bare white icons straight on the photo (a soft shadow keeps them readable on light shots). */}
          <View style={[st.topBar, { top: top + 6 }]}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as never))} hitSlop={8} style={st.heroBtn} accessibilityLabel="Orqaga" testID="back">
              <Feather name="chevron-left" size={32} color={C.white} style={st.iconShadow} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={8} style={st.heroBtn} accessibilityLabel="Saqlash" testID="fav">
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={30} color={fav ? C.lime : C.white} style={st.iconShadow} />
              </Pressable>
              <Pressable onPress={share} hitSlop={8} style={st.heroBtn} accessibilityLabel="Ulashish" testID="share">
                <Feather name="share" size={26} color={C.white} style={st.iconShadow} />
              </Pressable>
            </View>
          </View>
          <View pointerEvents="box-none" style={st.pager}>
            <View style={st.counter}>
              <Text style={st.counterTxt}>
                {idx + 1}/{Math.max(1, item.images.length)}
              </Text>
            </View>
            <View pointerEvents="none" style={st.pDots}>
              {item.images.length > 1 ? item.images.map((_, i) => (
                <View key={i} style={[st.pDot, i === idx && st.pDotActive]} />
              )) : null}
            </View>
            {item.images.length ? (
              <Pressable onPress={() => setViewer(true)} hitSlop={8} style={st.expand} accessibilityRole="button" accessibilityLabel="Rasmni kattalashtirish" testID="expand-photo">
                <Feather name="maximize-2" size={18} color={C.white} />
              </Pressable>
            ) : <View style={{ width: 30 }} />}
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

          <View style={[st.priceBox, compact && { paddingHorizontal: 14 }]}>
            <Text style={[st.price, compact && { fontSize: 18 }]} numberOfLines={1} adjustsFontSizeToFit>
              {spacedPrice(item.price)} <Text style={[st.priceCur, compact && { fontSize: 12 }]}>soʻm</Text>
            </Text>
            {item.negotiable ? (
              <View style={[st.nego, compact && { paddingHorizontal: 10 }]}>
                <Text style={[st.negoTxt, compact && { fontSize: 12 }]}>Kelishamiz!</Text>
              </View>
            ) : null}
          </View>

          <View style={st.locRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons name="location" size={16} color={C.text} />
              <Text style={st.loc} numberOfLines={2}>
                {item.city}, {item.district}
              </Text>
            </View>
            {item.delivery ? (
              <View style={st.delivery}>
                <Text style={st.deliveryTxt}>Yetkazib berish</Text>
                <View style={st.deliveryIcon}>
                  <Feather name="box" size={16} color={C.white} />
                </View>
              </View>
            ) : null}
          </View>

          {item.vaccinated ? (
            <Pressable
              style={st.health}
              onPress={() => Alert.alert('Emlanganlik', 'Sotuvchi hayvon emlanganini bildirgan. Xariddan oldin veterinar pasportini koʻrib tekshiring.')}
            >
              <Ionicons name="medkit" size={30} color={C.white} />
              <View style={{ flex: 1 }}>
                <Text style={st.healthTitle}>Emlanganlik haqida maʼlumot</Text>
                <Text style={st.healthSub}>Sotuvchi tomonidan kiritilgan</Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.white} />
            </Pressable>
          ) : null}

          <Text style={st.h}>
            <Feather name="clipboard" size={16} color={C.text} /> Maʼlumot
          </Text>
          <View style={[st.box, st.infoGrid]}>
            {info.map((x, i) => (
              <View key={i} style={st.infoCell}>
                <View style={st.infoIcon}>
                  <Feather name={x.icon} size={16} color={C.text} />
                </View>
                <Text style={st.infoTxt} numberOfLines={1}>{x.v}</Text>
              </View>
            ))}
          </View>


          <Text style={st.h}>
            <Feather name="file-text" size={16} color={C.text} /> Hayvon haqida tavsif
          </Text>
          <View style={st.box}>
            <Text style={st.desc}>{item.description}</Text>
          </View>

          <Text style={st.h}>
            <Feather name="user" size={16} color={C.text} /> Sotuvchi
          </Text>
          <View style={[st.box, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={st.sellerAv}>
              <Feather name="user" size={26} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.seller}>{item.own ? profile.name || 'Siz' : item.sellerName}</Text>
              <Text style={st.muted}>{item.own ? 'Bu sizning eʼloningiz' : item.sample ? 'Namuna katalog' : 'Sotuvchi'}</Text>
            </View>
            {item.own || sellerKey(item) ? (
              <Pressable onPress={() => go(item.own ? '/profile' : `/seller/${sellerKey(item)}`)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityRole="link" testID="seller-profile">
                <Text style={st.seller}>Profil</Text>
                <Feather name="chevron-right" size={18} color={C.text} />
              </Pressable>
            ) : null}
          </View>

          <Text style={st.h}>
            <Ionicons name="location" size={16} color={C.text} /> Joylashuv
          </Text>
          <View style={[st.box, { gap: 12 }]}>
            <Text style={st.seller}>
              {item.city}, {item.district}
            </Text>
            <Pressable onPress={openMap} accessibilityRole="button" accessibilityLabel="Karta boʻyicha">
              <MiniMap geo={item.geo} width={W - 60} height={150} />
            </Pressable>
            <Button label="Karta boʻyicha" icon="map" onPress={openMap} testID="open-map" />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <View style={[st.pill, { flex: 1 }]}>
              <Feather name="hash" size={14} color={C.text} />
              <Text style={st.pillTxt}>Eʼlon ID: {item.id.slice(-6).toUpperCase()}</Text>
            </View>
            <Pressable
              style={st.pill}
              onPress={() => Alert.alert('Shikoyat', 'Shikoyatlar xizmati hali serverga ulanmagan. Shubhali eʼlon boʻlsa, mahalliy veterinariya yoki huquq-tartibot organlariga murojaat qiling.')}
            >
              <Feather name="flag" size={14} color={C.text} />
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
            <AutoScrollRow padding={16} gap={10} testID="similar-row">
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
            </AutoScrollRow>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          <Feather name="info" size={12} color={C.mutedForeground} />
          <Text style={st.muted}>Hayvon va hujjatlarni xariddan oldin tekshiring.</Text>
        </View>
      </ScrollView>

      {/* Figma expand button: full-screen photo viewer, swipe between photos. */}
      <Modal visible={viewer} animationType="fade" onRequestClose={() => setViewer(false)} transparent={false}>
        <View style={st.viewer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: idx * windowW, y: 0 }}
            onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / windowW))}
          >
            {item.images.map((im, i) => (
              <Image key={i} source={src(im)} style={{ width: windowW, height: windowH }} contentFit="contain" />
            ))}
          </ScrollView>
          <View style={[st.viewerBar, { top: top + 10 }]}>
            <Text style={st.counterTxt}>{idx + 1}/{item.images.length}</Text>
            <Pressable onPress={() => setViewer(false)} hitSlop={10} style={st.viewerClose} accessibilityLabel="Yopish" testID="close-viewer">
              <Feather name="x" size={24} color={C.white} />
            </Pressable>
          </View>
        </View>
      </Modal>

      {!item.own ? (
        <View pointerEvents="box-none" style={[st.actionBar, { paddingBottom: bottom + 16 }]}>
          <GlassAction label="Yozish" icon="message-circle" onPress={() => go(`/messages/${item.id}`)} testID="write" />
          <GlassAction label="Qoʻngʻiroq" icon="phone" onPress={call} testID="call" />
        </View>
      ) : null}
    </View>
  );
}

const useSt = makeStyles((C) => ({
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  heroBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  iconShadow: { textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  expand: { width: 30, height: 30, borderRadius: 7, backgroundColor: 'rgba(8,13,32,0.8)', alignItems: 'center', justifyContent: 'center' },
  viewer: { flex: 1, backgroundColor: '#000' },
  viewerBar: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewerClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  pager: { position: 'absolute', bottom: 48, left: 26, right: 31, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { width: 53, height: 28, borderRadius: 27, backgroundColor: 'rgba(8,13,32,0.8)', alignItems: 'center', justifyContent: 'center' },
  counterTxt: { fontFamily: F.dBold, fontSize: 14, color: C.white },
  pDots: { flexDirection: 'row', alignItems: 'center', gap: 3.5 },
  pDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: C.card },
  pDotActive: { width: 43, backgroundColor: C.lime },
  sheet: { marginTop: -27, backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16 },
  grab: { width: 35, height: 5, borderRadius: 4.5, backgroundColor: '#d2d2d2', alignSelf: 'center', marginBottom: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: F.dBold, fontSize: 20, color: C.text },
  muted: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
  priceBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, borderRadius: 15, height: 58, paddingHorizontal: 22, marginTop: 12 },
  price: { flexShrink: 1, marginRight: 8, fontFamily: F.dExtra, fontSize: 24, color: C.lime },
  priceCur: { fontFamily: F.dBold, fontSize: 15, color: C.lime },
  nego: { backgroundColor: C.lime, borderRadius: 27, height: 28, paddingHorizontal: 14, justifyContent: 'center' },
  negoTxt: { fontFamily: F.dBold, fontSize: 14, color: C.ink },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  loc: { flexShrink: 1, fontFamily: F.dSemibold, fontSize: 14, color: C.text },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.dark ? C.border : 'rgba(182,187,206,0.5)', height: 43, paddingLeft: 14, paddingRight: 4 },
  deliveryTxt: { fontFamily: F.dBold, fontSize: 12, color: C.text },
  deliveryIcon: { width: 35, height: 35, borderRadius: 30, backgroundColor: C.success, alignItems: 'center', justifyContent: 'center' },
  health: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.sale, borderRadius: 15, minHeight: 63, padding: 12, marginTop: 14 },
  healthTitle: { fontFamily: F.dBold, fontSize: 14, color: C.white },
  healthSub: { fontFamily: F.regular, fontSize: 11, color: C.white, opacity: 0.85 },
  h: { fontFamily: F.dBold, fontSize: 16, color: C.text, marginTop: 20, marginBottom: 10 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, padding: 10 },
  infoCell: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.dark ? C.border : 'rgba(182,187,206,0.5)', height: 43, padding: 3, paddingRight: 12, flexGrow: 1, maxWidth: '100%' },
  infoIcon: { width: 35, height: 35, borderRadius: 10, backgroundColor: C.dark ? C.secondary : '#ebecf2', alignItems: 'center', justifyContent: 'center' },
  infoTxt: { fontFamily: F.dBold, fontSize: 12, color: C.text, flexShrink: 1 },
  box: { backgroundColor: C.card, borderRadius: 10, padding: 14 },
  desc: { fontFamily: F.regular, fontSize: 14, color: C.text, lineHeight: 21 },
  sellerAv: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: C.dark ? C.navySoft : '#cccccc', alignItems: 'center', justifyContent: 'center' },
  seller: { fontFamily: F.dBold, fontSize: 15, color: C.text },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 12, height: 40 },
  pillTxt: { fontFamily: F.semibold, fontSize: 12, color: C.text },
  similar: { backgroundColor: C.secondary, borderRadius: 24, paddingVertical: 14, marginTop: 8 },
  simCard: { width: 130, backgroundColor: C.card, borderRadius: 14, overflow: 'hidden' },
  simImg: { width: 130, height: 100 },
  simTitle: { fontFamily: F.dBold, fontSize: 12, color: C.text },
  simPrice: { fontFamily: F.dExtra, fontSize: 13, color: C.text, marginVertical: 4 },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: C.navy, borderRadius: 8, paddingVertical: 4 },
  moreTxt: { fontFamily: F.semibold, fontSize: 11, color: C.lime },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 30 },
}));
