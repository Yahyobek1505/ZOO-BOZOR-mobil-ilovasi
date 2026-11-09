import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { C } from '@/constants/colors';
import { CATEGORIES, PRODUCTS, PRODUCT_CATEGORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, Chip, EmptyState, ListingCard, ProductCard, ScreenHeader, go, useBottomInset } from '@/components/ui';

export default function Saved() {
  const { favorites, favoriteProducts, allListings } = useApp();
  const { width } = useWindowDimensions();
  const bottom = useBottomInset();
  const [tab, setTab] = useState<'animals' | 'products'>('animals');
  const [cat, setCat] = useState('all');
  const cardW = (Math.min(width, 600) - 44) / 2;

  const animals = allListings.filter((l) => favorites.includes(l.id) && (cat === 'all' || l.category === cat));
  const products = PRODUCTS.filter((p) => favoriteProducts.includes(p.id) && (cat === 'all' || p.category === cat));
  const cats = tab === 'animals' ? CATEGORIES.map((c) => ({ id: c.id, label: c.label })) : PRODUCT_CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Saqlanganlar" />
      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 24 }}>
        <View style={st.seg}>
          <Chip label={`Hayvonlar (${favorites.length})`} active={tab === 'animals'} onPress={() => { setTab('animals'); setCat('all'); }} testID="saved-animals" />
          <Chip label={`Mahsulotlar (${favoriteProducts.length})`} active={tab === 'products'} onPress={() => { setTab('products'); setCat('all'); }} testID="saved-products" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
          <Chip label="Hammasi" active={cat === 'all'} onPress={() => setCat('all')} />
          {cats.map((c) => (
            <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(c.id)} />
          ))}
        </ScrollView>
        <View style={st.grid}>
          {tab === 'animals'
            ? animals.map((l) => <ListingCard key={l.id} item={l} style={{ width: cardW }} />)
            : products.map((p) => <ProductCard key={p.id} item={p} style={{ width: cardW }} />)}
        </View>
        {(tab === 'animals' ? animals : products).length === 0 ? (
          <EmptyState
            icon="heart"
            title="Hozircha boʻsh"
            text={cat === 'all' ? 'Yoqqan eʼlon yoki mahsulotdagi yurakchani bosing — ular shu yerda saqlanadi.' : 'Bu kategoriyada saqlanganlar yoʻq.'}
            action={<Button label={tab === 'animals' ? 'Eʼlonlarni koʻrish' : 'Marketga oʻtish'} onPress={() => go(tab === 'animals' ? '/listings' : '/market')} />}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  seg: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
});
