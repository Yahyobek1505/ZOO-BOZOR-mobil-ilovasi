import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useScreenWidth } from '@/hooks/useScreen';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { Alert } from '@/components/AppAlert';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { IMAGES, PRODUCTS, PRODUCT_CATEGORIES } from '@/constants/data';
import { BrandHeader } from '@/components/BrandHeader';
import { ShopFilterIcon } from '@/components/FigmaIcons';
import { AutoCarousel } from '@/components/AutoCarousel';
import { EmptyState, ProductCard, SaleCard, SearchBar, SectionTitle, go } from '@/components/ui';
import { CardGrid } from '@/components/CardGrid';
import { AutoScrollRow } from '@/components/AutoScrollRow';

type Sort = 'none' | 'asc' | 'desc';

// Figma "7-Market" (node 23:97): 345×150 banner carousel with peeking neighbours,
// pager below it, then the product grid (178px cards, 7px gutter, 20px margins).
const BANNER_W = 345;
const BANNERS = [
  { img: IMAGES.marketBanner, to: '/market' },
  { img: IMAGES.promoCats, to: '/listings?category=mushuk' },
  { img: IMAGES.homeBanner, to: '/listings?category=kuchuk' },
];

export default function MarketScreen() {
  const { C } = useTheme();
  const st = useSt();
  const width = useScreenWidth();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('none');
  const screenW = width;
  const bannerW = Math.min(BANNER_W, screenW - 40);
  const bannerSide = (screenW - bannerW) / 2;

  const items = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) => (cat === 'all' || p.category === cat) && (!q.trim() || p.title.toLowerCase().includes(q.trim().toLowerCase())),
    );
    if (sort !== 'none') list = [...list].sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price));
    return list;
  }, [q, cat, sort]);

  // The design has no chip row: category and sort live behind the search field's filter button.
  const openFilter = () =>
    Alert.alert('Saralash', undefined, [
      ...PRODUCT_CATEGORIES.map((c) => ({ text: c.label, onPress: () => setCat(c.id) })),
      { text: 'Arzonroq avval', onPress: () => setSort('asc') },
      { text: 'Qimmatroq avval', onPress: () => setSort('desc') },
      { text: 'Yopish', style: 'cancel' as const },
    ]);

  const sortLabel = sort === 'asc' ? 'Arzonroq avval' : sort === 'desc' ? 'Qimmatroq avval' : '';
  const catLabel = cat === 'all' ? '' : PRODUCT_CATEGORIES.find((c) => c.id === cat)?.label ?? '';
  const top = items.slice(0, 4);
  const rest = items.slice(4);
  const sale = PRODUCTS.filter((p) => p.oldPrice || p.sold > 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.surface }} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      <BrandHeader title="Market" icon="shopping-bag" showCart>
        <SearchBar value={q} onChangeText={setQ} placeholder="Kategoriya boʻyicha qidirish" onFilter={openFilter} filterNode={<ShopFilterIcon size={20} />} />
      </BrandHeader>

      {/* Auto-advancing carousel: the centred banner peeks its neighbours, pager below (Figma 7-Market). */}
      <AutoCarousel
        slides={BANNERS}
        slideWidth={bannerW}
        sidePadding={bannerSide}
        imageStyle={st.banner}
        contentStyle={{ paddingTop: 10 }}
        testIDPrefix="market-banner"
        renderDots={(active) => (
          <View style={st.dots}>
            {BANNERS.map((_, i) => <View key={i} style={[st.dot, i === active && st.dotActive]} />)}
          </View>
        )}
      />

      {catLabel || sortLabel ? (
        <View style={st.activeRow}>
          {[catLabel && { label: catLabel, clear: () => setCat('all') }, sortLabel && { label: sortLabel, clear: () => setSort('none') }]
            .filter((x): x is { label: string; clear: () => void } => !!x)
            .map((f) => (
              <Pressable key={f.label} onPress={f.clear} style={st.activePill} accessibilityRole="button" accessibilityLabel={`${f.label} filtrini olib tashlash`}>
                <Text style={st.activeTxt}>{f.label}</Text>
                <Feather name="x" size={14} color={C.lime} />
              </Pressable>
            ))}
        </View>
      ) : null}

      <View style={st.panel}>
        {items.length === 0 ? (
          <EmptyState icon="search" title="Hech narsa topilmadi" text="Boshqa soʻz bilan qidirib koʻring yoki kategoriyani almashtiring." />
        ) : (
          <CardGrid gap={7} style={st.grid}>
            {top.map((p) => <ProductCard key={p.id} item={p} />)}
          </CardGrid>
        )}
      </View>

      <Pressable onPress={() => go('/product/p7')} style={{ paddingHorizontal: 20, marginTop: 21 }}>
        <View style={st.fold}>
          <Image source={IMAGES.foldBall} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Text style={st.foldTxt}>Fold</Text>
        </View>
      </Pressable>

      {rest.length ? <CardGrid gap={7} style={[st.grid, { marginTop: 14 }]}>{rest.map((p) => <ProductCard key={p.id} item={p} />)}</CardGrid> : null}

      <View style={st.salePanel}>
        <SectionTitle title="Xafta sotuvi" dark />
        <AutoScrollRow padding={16} gap={10} testID="market-sale-row">
          {sale.map((p) => (
            <SaleCard key={p.id} item={p} image={p.image} title={p.title} price={p.price} desc={p.description} rating={p.rating} sub={`${p.sold} sotildi`} onPress={() => go(`/product/${p.id}`)} />
          ))}
        </AutoScrollRow>
      </View>
    </ScrollView>
  );
}

const useSt = makeStyles((C) => ({
  banner: { height: 150, borderRadius: 15, backgroundColor: C.secondary },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, marginTop: 11 },
  dot: { width: 6, height: 6, borderRadius: 4.5, backgroundColor: '#b5b7bd' },
  dotActive: { width: 35, backgroundColor: C.dark ? C.lime : '#424b69' },
  activeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: C.navy },
  activeTxt: { fontFamily: F.dSemibold, fontSize: 13, color: C.lime },
  panel: { marginTop: 12 },
  grid: { paddingHorizontal: 20 },
  fold: { height: 84, borderRadius: 15, overflow: 'hidden', justifyContent: 'center', paddingLeft: 39, backgroundColor: C.secondary },
  foldTxt: { fontFamily: F.dExtra, fontSize: 30, color: C.white },
  salePanel: { backgroundColor: C.dark ? '#2A3150' : '#b7bbc5', marginTop: 21, paddingBottom: 16, borderRadius: 20 },
}));
