import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useScreenWidth } from '@/hooks/useScreen';
import { Text } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { CATEGORIES, IMAGES, STORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import Welcome from '@/app/welcome';
import { BrandHeader } from '@/components/BrandHeader';
import { ListingCard, SaleCard, SearchBar, compactViews, go } from '@/components/ui';
import { CardGrid } from '@/components/CardGrid';
import { AutoScrollRow } from '@/components/AutoScrollRow';
import { PawIcon } from '@/components/FigmaIcons';
import { AutoCarousel } from '@/components/AutoCarousel';

const GUTTER = 7;

export default function HomeScreen() {
  const { C } = useTheme();
  const st = useSt();
  const { allListings, ready: appReady, prefs } = useApp();
  const { ready: localeReady, onboardingComplete } = useLocale();
  const width = useScreenWidth();
  const [q, setQ] = useState('');
  const bannerW = width - 40; // Figma: 362px banner, 20px side margins
  const recommended = allListings.filter((l) => !l.weekSale).slice(0, 4);
  // Figma: up to four more cards under "Xafta sotuvi", always in full pairs so no card sits alone.
  const moreAll = allListings.filter((l) => !l.weekSale).slice(4, 8);
  const more = moreAll.slice(0, moreAll.length - (moreAll.length % 2));
  const sale = allListings.filter((l) => l.weekSale);
  const banners = [
    { img: IMAGES.homeBanner, to: '/listings?category=kuchuk' },
    { img: IMAGES.promoCats, to: '/listings?category=mushuk' },
    { img: IMAGES.marketBanner, to: '/market' },
  ];

  const submit = () => go(`/listings?q=${encodeURIComponent(q.trim())}`);

  const grid = (items: typeof recommended) => (
    <CardGrid gap={GUTTER} style={st.grid}>
      {items.map((l) => <ListingCard key={l.id} item={l} />)}
    </CardGrid>
  );

  if (!localeReady || !appReady || (!onboardingComplete && !prefs.welcomed)) {
    return <Welcome />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <BrandHeader>
        <SearchBar value={q} onChangeText={setQ} onSubmit={submit} placeholder="Nima qidiryapsiz?" onFilter={submit} filterNode={<PawIcon size={25} />} />
      </BrandHeader>

      <AutoCarousel
        slides={banners}
        slideWidth={bannerW}
        sidePadding={20}
        imageStyle={st.banner}
        style={{ marginTop: 13 }}
        testIDPrefix="banner"
        renderDots={(active) => (
          // Figma: pager capsule sits inside the banner, 23px from its left and 20px from its bottom.
          <View pointerEvents="none" style={st.dots}>
            {banners.map((_, i) => <View key={i} style={[st.dot, i === active && st.dotActive]} />)}
          </View>
        )}
      />

      <View style={st.catPanel}>
        <Pressable onPress={() => go('/listings')} style={st.allPill} accessibilityRole="button">
          <Text style={st.allTxt}>Barchasi</Text>
          <Feather name="chevron-right" size={14} color={C.ink} />
        </Pressable>
        <AutoScrollRow padding={20} gap={10} testID="cat-row">
          {CATEGORIES.map((c) => {
            const count = allListings.filter((l) => l.category === c.id).length;
            return (
              <Pressable key={c.id} onPress={() => go(`/listings?category=${c.id}`)} style={st.cat} testID={`cat-${c.id}`}>
                <Image source={c.image} style={StyleSheet.absoluteFill} contentFit="cover" />
                <View style={[st.catPill, st.catCount]}>
                  <Text style={st.catCountTxt}>{count} eʼlon</Text>
                </View>
                <View style={[st.catPill, st.catName]}>
                  <Text style={st.catLabel} numberOfLines={1}>{c.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </AutoScrollRow>
      </View>

      <AutoScrollRow padding={20} gap={8} style={{ paddingTop: 14 }} testID="story-row">
        {STORIES.map((item) => (
          <Pressable key={item.id} style={st.story} onPress={() => go(`/story/${item.id}`)} testID={`story-${item.id}`}>
            <Image source={item.image} style={st.storyImg} />
            <Text style={st.storyTxt} numberOfLines={1}>{item.label}</Text>
          </Pressable>
        ))}
      </AutoScrollRow>

      {/* Figma: light panel holding the recommended grid and the "Cats" promo; its lime title pill straddles the top edge. */}
      <View style={st.recPanel}>
        <Pressable onPress={() => go('/listings')} style={st.recPill} accessibilityRole="button" testID="recommended-more">
          <Text style={st.recTxt}>Tavsiya qilamiz</Text>
          <Feather name="chevron-right" size={18} color={C.ink} />
        </Pressable>
        {grid(recommended)}
        <Pressable onPress={() => go('/listings?category=mushuk')} style={{ paddingHorizontal: 20, marginTop: 25 }}>
          <View style={st.promo}>
            <Image source={IMAGES.promoCats} style={StyleSheet.absoluteFill} contentFit="cover" />
            {/* Figma lays the promo copy over the artwork. */}
            <Text style={st.promoBig}>Cats</Text>
            <View style={st.promoRight}>
              <Text style={st.promoPct}>70%</Text>
              <Text style={st.promoSub}>Terranium</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* The grey panel continues behind the rounded "Xafta sotuvi" block and closes under the last grid. */}
      <View style={st.lowerPanel}>
        <View style={st.salePanel}>
          <Pressable onPress={() => go('/listings?sort=asc')} style={st.saleHead} accessibilityRole="button">
            <Text style={st.saleTitle}>Xafta sotuvi</Text>
            <Feather name="chevron-right" size={20} color={C.white} />
          </Pressable>
          <AutoScrollRow padding={20} gap={7} testID="sale-row">
            {sale.map((l) => (
              <SaleCard
                key={l.id}
                item={l}
                image={l.images[0]}
                title={l.title}
                price={l.price}
                desc={l.description}
                rating={l.rating}
                sub={compactViews(l.views)}
                onPress={() => go(`/listing/${l.id}`)}
              />
            ))}
          </AutoScrollRow>
        </View>
        {more.length ? <View style={{ marginTop: 14 }}>{grid(more)}</View> : null}
      </View>
    </ScrollView>
  );
}

const useSt = makeStyles((C) => ({
  // Values below mirror Figma "10-Bosh Sahifa" (node 38:230).
  banner: { height: 185, borderRadius: 20 },
  dots: { position: 'absolute', left: 43, bottom: 20, height: 16, borderRadius: 4.5, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(8,13,32,0.7)' },
  dot: { width: 6, height: 6, borderRadius: 4.5, backgroundColor: '#d2d2d2' },
  dotActive: { width: 31, backgroundColor: C.lime },
  catPanel: { backgroundColor: C.dark ? C.card : '#eeeeee', marginTop: 25, paddingTop: 25, paddingBottom: 16, borderRadius: 20 },
  allPill: { position: 'absolute', top: -11, right: 11, zIndex: 1, width: 101, height: 24, borderRadius: 10, backgroundColor: C.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  allTxt: { fontFamily: F.dSemibold, fontSize: 15, color: C.ink },
  cat: { width: 104, height: 155, borderRadius: 20, overflow: 'hidden' },
  catPill: { position: 'absolute', alignSelf: 'center', minWidth: 65, height: 17, borderRadius: 7, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  catCount: { top: 13, backgroundColor: 'rgba(181,183,189,0.5)' },
  catName: { bottom: 16, backgroundColor: 'rgba(8,13,32,0.5)' },
  catCountTxt: { fontFamily: F.dExtra, fontSize: 10, color: C.white },
  catLabel: { fontFamily: F.dExtra, fontSize: 12, color: C.white },
  story: { width: 70, alignItems: 'center', gap: 2 },
  storyImg: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: C.white },
  storyTxt: { fontFamily: F.dSemibold, fontSize: 10, color: C.text },
  grid: { paddingHorizontal: 20 },
  recPanel: { backgroundColor: C.surface, marginTop: 30, paddingTop: 23, paddingBottom: 26, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  recPill: { position: 'absolute', top: -12, left: 20, zIndex: 1, height: 24, borderRadius: 10, paddingLeft: 12, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.lime },
  recTxt: { fontFamily: F.dSemibold, fontSize: 16, color: C.ink },
  promo: { height: 84, borderRadius: 15, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 22, paddingRight: 22 },
  promoBig: { fontFamily: F.dExtra, fontSize: 40, color: C.white, textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 6 },
  promoRight: { alignItems: 'flex-end' },
  promoPct: { fontFamily: F.dExtra, fontSize: 28, lineHeight: 30, color: C.white, textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 6 },
  promoSub: { fontFamily: F.dBold, fontSize: 18, lineHeight: 20, color: C.white, textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 6 },
  salePanel: { backgroundColor: C.dark ? '#2A3150' : '#b7bbc5', paddingBottom: 16, borderRadius: 25 },
  saleHead: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 27, paddingTop: 12, paddingBottom: 10 },
  saleTitle: { fontFamily: F.dSemibold, fontSize: 17, color: C.white },
  lowerPanel: { backgroundColor: C.surface, paddingBottom: 36, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
}));
