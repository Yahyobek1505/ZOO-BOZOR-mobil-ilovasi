import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C, F } from '@/constants/colors';
import { CATEGORIES, IMAGES, STORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { BrandHeader } from '@/components/BrandHeader';
import { ListingCard, SaleCard, SearchBar, SectionTitle, go } from '@/components/ui';

export default function HomeScreen() {
  const { allListings } = useApp();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const cardW = (Math.min(width, 600) - 16 * 2 - 12) / 2;
  const bannerW = Math.min(width, 600) - 32;
  const recommended = allListings.filter((l) => !l.weekSale).slice(0, 4);
  const more = allListings.filter((l) => !l.weekSale).slice(4, 10);
  const sale = allListings.filter((l) => l.weekSale);
  const banners = [
    { img: IMAGES.homeBanner, to: '/listings?category=kuchuk' },
    { img: IMAGES.promoCats, to: '/listings?category=mushuk' },
    { img: IMAGES.marketBanner, to: '/market' },
  ];

  const submit = () => go(`/listings?q=${encodeURIComponent(q.trim())}`);

  const grid = (items: typeof recommended) => (
    <View style={st.grid}>
      {items.map((l) => (
        <ListingCard key={l.id} item={l} style={{ width: cardW }} />
      ))}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.surface }} contentContainerStyle={{ paddingBottom: 170 }} showsVerticalScrollIndicator={false}>
      <BrandHeader>
        <SearchBar value={q} onChangeText={setQ} onSubmit={submit} placeholder="Nima qidiryapsiz?" onFilter={submit} filterIcon="search" />
      </BrandHeader>

      <View style={{ marginTop: 14 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (bannerW + 12)))}
          snapToInterval={bannerW + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {banners.map((b, i) => (
            <Pressable key={i} onPress={() => go(b.to)} testID={`banner-${i}`}>
              <Image source={b.img} style={[st.banner, { width: bannerW }]} contentFit="cover" />
            </Pressable>
          ))}
        </ScrollView>
        <View style={st.dots}>
          {banners.map((_, i) => (
            <View key={i} style={[st.dot, i === bannerIdx && st.dotActive]} />
          ))}
        </View>
      </View>

      <View style={st.catPanel}>
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16 }}>
          <Pressable onPress={() => go('/listings')} style={st.allPill}>
            <Text style={st.allTxt}>Barchasi</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 10 }}>
          {CATEGORIES.map((c) => {
            const count = allListings.filter((l) => l.category === c.id).length;
            return (
              <Pressable key={c.id} onPress={() => go(`/listings?category=${c.id}`)} style={st.cat} testID={`cat-${c.id}`}>
                <Image source={c.image} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={['rgba(8,13,32,0)', 'rgba(8,13,32,0.65)']} style={StyleSheet.absoluteFill} />
                <View style={st.catCount}>
                  <Text style={st.catCountTxt}>{count} ta eʼlon</Text>
                </View>
                <Text style={st.catLabel}>{c.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        horizontal
        data={STORIES}
        keyExtractor={(s) => s.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 16 }}
        renderItem={({ item }) => (
          <Pressable style={st.story} onPress={() => go(`/story/${item.id}`)} testID={`story-${item.id}`}>
            <View style={st.storyRing}>
              <Image source={item.image} style={st.storyImg} />
            </View>
            <Text style={st.storyTxt} numberOfLines={1}>{item.label}</Text>
          </Pressable>
        )}
      />

      <SectionTitle title="Tavsiya qilamiz" onMore={() => go('/listings')} />
      {grid(recommended)}

      <Pressable onPress={() => go('/listings?category=mushuk')} style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Image source={IMAGES.promoCats} style={st.promo} contentFit="cover" />
      </Pressable>

      <View style={st.salePanel}>
        <SectionTitle title="Xafta sotuvi" dark onMore={() => go('/listings?sort=asc')} moreLabel="Arzonlari" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {sale.map((l) => (
            <SaleCard
              key={l.id}
              item={l}
              image={l.images[0]}
              title={l.title}
              price={l.price}
              desc={l.description}
              rating={l.rating}
              sub={l.views}
              onPress={() => go(`/listing/${l.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ height: 16 }} />
      {grid(more)}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  banner: { height: 150, borderRadius: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  dotActive: { width: 22, backgroundColor: C.navy },
  catPanel: { backgroundColor: C.secondary, marginTop: 14, paddingVertical: 12, borderRadius: 24, marginHorizontal: 0 },
  allPill: { backgroundColor: C.lime, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  allTxt: { fontFamily: F.dBold, fontSize: 12, color: C.navy },
  cat: { width: 92, height: 150, borderRadius: 18, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 10 },
  catCount: { position: 'absolute', top: 8, alignSelf: 'center', backgroundColor: C.lime, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  catCountTxt: { fontFamily: F.bold, fontSize: 9, color: C.navy },
  catLabel: { fontFamily: F.dExtra, fontSize: 14, color: C.white },
  story: { width: 64, alignItems: 'center', gap: 4 },
  storyRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: C.lime, padding: 2 },
  storyImg: { width: '100%', height: '100%', borderRadius: 28 },
  storyTxt: { fontFamily: F.medium, fontSize: 10, color: C.navy },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  promo: { width: '100%', height: 70, borderRadius: 16 },
  salePanel: { backgroundColor: C.secondary, marginTop: 18, paddingBottom: 16, borderRadius: 24 },
});
