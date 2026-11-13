import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { useLocalSearchParams } from 'expo-router';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { CATEGORIES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, Chip, EmptyState, ListingCard, ScreenHeader, SearchBar, go } from '@/components/ui';
import { CardGrid } from '@/components/CardGrid';
import { hiddenBarContent, hiddenBarOuter, hiddenBarScroll } from '@/components/AutoScrollRow';

type Sort = 'new' | 'asc' | 'desc';

export default function ListingsScreen() {
  const { C } = useTheme();
  const st = useSt();
  const params = useLocalSearchParams<{ q?: string; category?: string; sort?: string }>();
  const { allListings, myListings, listingsLoading, refreshListings } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('new');

  useEffect(() => {
    setQ(params.q ?? '');
    setCat(params.category || 'all');
    setSort(params.sort === 'asc' || params.sort === 'desc' ? params.sort : 'new');
  }, [params.q, params.category, params.sort]);


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
      data={data.length % 2 ? [...data, null] : data}
      refreshing={listingsLoading}
      onRefresh={refreshListings}
      keyExtractor={(l) => l?.id ?? 'filler'}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          {/* Figma's 4th tab is Savdo, so the catalogue is a pushed screen reached from Home. */}
          <ScreenHeader title="Eʼlonlar" />
          <View style={{ paddingHorizontal: 16 }}>
            <SearchBar value={q} onChangeText={setQ} placeholder="Zot, shahar yoki nom" />
          </View>
          <View style={st.mine}>
            <View style={{ flex: 1 }}>
              <Text style={st.mineTitle}>Mening eʼlonlarim</Text>
              <Text style={st.mineSub}>{myListings.length ? `${myListings.length} ta eʼlon` : 'Hali eʼlon joylamadingiz'}</Text>
            </View>
            <Button label={myListings.length ? 'Ochish' : 'Qoʻshish'} icon={myListings.length ? 'list' : 'plus'} style={{ height: 40 }} onPress={() => go(myListings.length ? '/my-listings' : '/listing/edit')} />
          </View>
          <View style={hiddenBarOuter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hiddenBarScroll} contentContainerStyle={[{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }, hiddenBarContent]}>
            <Chip label="Hammasi" active={cat === 'all'} onPress={() => setCat('all')} />
            {CATEGORIES.map((c) => (
              <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(c.id)} testID={`filter-${c.id}`} />
            ))}
          </ScrollView>
          </View>
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
      // Odd count: an empty cell keeps the last card at half width, like the other grids.
      renderItem={({ item }) => <View style={{ flex: 1, minWidth: 0 }}>{item ? <ListingCard item={item} /> : null}</View>}
    />
  );
}

const useSt = makeStyles((C) => ({
  mine: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, margin: 16, marginBottom: 0, padding: 14, borderRadius: 18, gap: 10 },
  mineTitle: { fontFamily: F.dBold, fontSize: 15, color: C.text },
  mineSub: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, marginTop: 2 },
  // Wraps on narrow phones so the result count and the three sort chips never overflow.
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 8, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 4 },
  count: { fontFamily: F.semibold, fontSize: 13, color: C.mutedForeground },
}));
