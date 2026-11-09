import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { C, F } from '@/constants/colors';
import { CATEGORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { BrandHeader } from '@/components/BrandHeader';
import { Button, Chip, EmptyState, ListingCard, SearchBar, go } from '@/components/ui';

type Sort = 'new' | 'asc' | 'desc';

export default function ListingsScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string; sort?: string }>();
  const { allListings, myListings, listingsLoading, refreshListings } = useApp();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('new');

  useEffect(() => {
    if (params.q !== undefined) setQ(params.q);
    if (params.category) setCat(params.category);
    if (params.sort === 'asc' || params.sort === 'desc') setSort(params.sort);
  }, [params.q, params.category, params.sort]);

  const cardW = (Math.min(width, 600) - 32 - 12) / 2;

  const data = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = allListings.filter(
      (l) =>
        (cat === 'all' || l.category === cat) &&
        (!t || [l.title, l.breed, l.city, l.district, l.description].join(' ').toLowerCase().includes(t)),
    );
    list = [...list].sort((a, b) => (sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : b.createdAt - a.createdAt));
    return list;
  }, [allListings, q, cat, sort]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.surface }}
      data={data}
      refreshing={listingsLoading}
      onRefresh={refreshListings}
      keyExtractor={(l) => l.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 12, paddingBottom: 170 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          <BrandHeader title="Eʼlonlar">
            <SearchBar value={q} onChangeText={setQ} placeholder="Zot, shahar yoki nom" />
          </BrandHeader>
          <View style={st.mine}>
            <View style={{ flex: 1 }}>
              <Text style={st.mineTitle}>Mening eʼlonlarim</Text>
              <Text style={st.mineSub}>{myListings.length ? `${myListings.length} ta eʼlon` : 'Hali eʼlon joylamadingiz'}</Text>
            </View>
            <Button label={myListings.length ? 'Ochish' : 'Qoʻshish'} icon={myListings.length ? 'list' : 'plus'} style={{ height: 40 }} onPress={() => go(myListings.length ? '/my-listings' : '/listing/edit')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
            <Chip label="Hammasi" active={cat === 'all'} onPress={() => setCat('all')} />
            {CATEGORIES.map((c) => (
              <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(c.id)} testID={`filter-${c.id}`} />
            ))}
          </ScrollView>
          <View style={st.sortRow}>
            <Text style={st.count}>{data.length} ta natija</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Chip label="Yangi" active={sort === 'new'} onPress={() => setSort('new')} />
              <Chip label="Arzon" active={sort === 'asc'} onPress={() => setSort('asc')} testID="sort-asc" />
              <Chip label="Qimmat" active={sort === 'desc'} onPress={() => setSort('desc')} testID="sort-desc" />
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState icon="search" title="Eʼlon topilmadi" text="Filtrlarni oʻzgartiring yoki birinchi boʻlib eʼlon joylang." />}
      renderItem={({ item }) => <ListingCard item={item} style={{ width: cardW }} />}
    />
  );
}

const st = StyleSheet.create({
  mine: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, margin: 16, marginBottom: 0, padding: 14, borderRadius: 18, gap: 10 },
  mineTitle: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  mineSub: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, marginTop: 2 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 4 },
  count: { fontFamily: F.semibold, fontSize: 13, color: C.mutedForeground },
});
