import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { CATEGORIES, PRODUCTS, PRODUCT_CATEGORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, Chip, EmptyState, ListingCard, ProductCard, ScreenHeader, SearchBar, go, useBottomInset } from '@/components/ui';
import { CardGrid } from '@/components/CardGrid';

export default function Saved() {
  const { C } = useTheme();
  const st = useSt();
  const { favorites, favoriteProducts, allListings } = useApp();
  const bottom = useBottomInset();
  const [tab, setTab] = useState<'all' | 'animals' | 'products'>('all');
  const [q, setQ] = useState('');

  const totalCount = favorites.length + favoriteProducts.length;

  const animals = allListings.filter(
    (l) => favorites.includes(l.id) && (q.trim() === '' || l.title.toLowerCase().includes(q.toLowerCase()))
  );
  const products = PRODUCTS.filter(
    (p) => favoriteProducts.includes(p.id) && (q.trim() === '' || p.title.toLowerCase().includes(q.toLowerCase()))
  );

  const showAnimals = tab === 'all' || tab === 'animals';
  const showProducts = tab === 'all' || tab === 'products';

  const isEmpty = (showAnimals ? animals.length : 0) + (showProducts ? products.length : 0) === 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Saqlangan" />

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder="Saqlanganlardan qidirish"
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 24 }}>
        {/* Figma 23:96 Tabs: Barchasi • 8, Hayvonlar • 5, Mahsulotlar • 3 */}
        <View style={st.seg}>
          <Chip
            label={`Barchasi • ${totalCount}`}
            active={tab === 'all'}
            onPress={() => setTab('all')}
            testID="saved-all"
          />
          <Chip
            label={`Hayvonlar • ${favorites.length}`}
            active={tab === 'animals'}
            onPress={() => setTab('animals')}
            testID="saved-animals"
          />
          <Chip
            label={`Mahsulotlar • ${favoriteProducts.length}`}
            active={tab === 'products'}
            onPress={() => setTab('products')}
            testID="saved-products"
          />
        </View>

        <CardGrid gap={12} style={st.grid}>
          {showAnimals ? animals.map((l) => <ListingCard key={l.id} item={l} />) : null}
          {showProducts ? products.map((p) => <ProductCard key={p.id} item={p} />) : null}
        </CardGrid>

        {isEmpty ? (
          <EmptyState
            icon="heart"
            title="Hozircha boʻsh"
            text={
              q
                ? 'Qidiruv boʻyicha hech narsa topilmadi.'
                : 'Yoqqan eʼlon yoki mahsulotdagi yurakchani bosing — ular shu yerda saqlanadi.'
            }
            action={
              <Button
                label={tab === 'products' ? 'Marketga oʻtish' : 'Eʼlonlarni koʻrish'}
                onPress={() => go(tab === 'products' ? '/market' : '/listings')}
              />
            }
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  seg: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  grid: { paddingHorizontal: 16 },
}));
