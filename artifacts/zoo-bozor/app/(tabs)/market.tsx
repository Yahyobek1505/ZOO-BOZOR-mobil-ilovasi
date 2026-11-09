import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { C, F } from '@/constants/colors';
import { IMAGES, PRODUCTS, PRODUCT_CATEGORIES } from '@/constants/data';
import { BrandHeader } from '@/components/BrandHeader';
import { Chip, EmptyState, ProductCard, SaleCard, SearchBar, SectionTitle, go } from '@/components/ui';

type Sort = 'none' | 'asc' | 'desc';

export default function MarketScreen() {
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('none');
  const cardW = (Math.min(width, 600) - 32 - 12) / 2;

  const items = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) => (cat === 'all' || p.category === cat) && (!q.trim() || p.title.toLowerCase().includes(q.trim().toLowerCase())),
    );
    if (sort !== 'none') list = [...list].sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price));
    return list;
  }, [q, cat, sort]);

  const cycleSort = () => setSort((s) => (s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none'));
  const sortLabel = sort === 'asc' ? 'Arzonroq avval' : sort === 'desc' ? 'Qimmatroq avval' : 'Saralash';
  const top = items.slice(0, 4);
  const rest = items.slice(4);
  const sale = PRODUCTS.filter((p) => p.oldPrice || p.sold > 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.surface }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <BrandHeader title="Market" icon="shopping-bag" showCart>
        <SearchBar value={q} onChangeText={setQ} placeholder="Kategoriya boʻyicha qidirish" onFilter={cycleSort} filterIcon="bar-chart-2" />
      </BrandHeader>

      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <Image source={IMAGES.marketBanner} style={st.banner} contentFit="cover" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 14 }}>
        {PRODUCT_CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(c.id)} testID={`pcat-${c.id}`} />
        ))}
        <Chip label={sortLabel} active={sort !== 'none'} onPress={cycleSort} testID="sort" />
      </ScrollView>

      <View style={st.panel}>
        {items.length === 0 ? (
          <EmptyState icon="search" title="Hech narsa topilmadi" text="Boshqa soʻz bilan qidirib koʻring yoki kategoriyani almashtiring." />
        ) : (
          <View style={st.grid}>
            {top.map((p) => (
              <ProductCard key={p.id} item={p} style={{ width: cardW }} />
            ))}
          </View>
        )}
      </View>

      <Pressable onPress={() => go('/product/p7')} style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View style={st.fold}>
          <Image source={IMAGES.foldBall} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Text style={st.foldTxt}>Fold</Text>
        </View>
      </Pressable>

      {rest.length ? <View style={[st.grid, { marginTop: 14 }]}>{rest.map((p) => <ProductCard key={p.id} item={p} style={{ width: cardW }} />)}</View> : null}

      <View style={st.salePanel}>
        <SectionTitle title="Xafta sotuvi" dark />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {sale.map((p) => (
            <SaleCard key={p.id} item={p} image={p.image} title={p.title} price={p.price} desc={p.description} rating={p.rating} sub={`${p.sold} sotildi`} onPress={() => go(`/product/${p.id}`)} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  banner: { width: '100%', height: 160, borderRadius: 18 },
  panel: { marginTop: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  fold: { height: 76, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', paddingLeft: 22, backgroundColor: C.secondary },
  foldTxt: { fontFamily: F.dExtra, fontSize: 26, color: C.white },
  salePanel: { backgroundColor: C.secondary, marginTop: 18, paddingBottom: 16, borderRadius: 24 },
});
