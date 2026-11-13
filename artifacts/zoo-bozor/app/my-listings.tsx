import React, { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { categoryLabel, formatPrice, timeAgo } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, ScreenHeader, go, src, useBottomInset } from '@/components/ui';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function MyListings() {
  const { C } = useTheme();
  const st = useSt();
  const { myListings, deleteListing, listingsLoading, refreshListings, profile } = useApp();
  const bottom = useBottomInset();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const confirmDelete = (id: string) =>
    Alert.alert('Eʼlonni oʻchirish', 'Bu eʼlon butunlay oʻchiriladi.', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Oʻchirish',
        style: 'destructive',
        onPress: () => {
          void deleteListing(id).catch((err) => Alert.alert('Oʻchirilmadi', err.message));
        },
      },
    ]);

  const filteredListings = myListings.filter((item, idx) => {
    // For demo/consistency with Figma: assign mock statuses if not set
    const status: 'pending' | 'approved' | 'rejected' =
      (item as any).status || (idx % 3 === 0 ? 'approved' : idx % 3 === 1 ? 'pending' : 'rejected');
    if (filter === 'all') return true;
    return status === filter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader
        title="Mening eʼlonlarim"
        right={
          <Pressable onPress={() => go('/listing/edit')} style={st.add} accessibilityLabel="Eʼlon qoʻshish">
            <Feather name="plus" size={20} color={C.ink} />
          </Pressable>
        }
      />

      <FlatList
        data={filteredListings}
        refreshing={listingsLoading}
        onRefresh={refreshListings}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: bottom + 24 }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 8 }}>
            {/* Figma 726:182 Balance Card */}
            <View style={st.balanceCard}>
              <View style={st.balanceTop}>
                <View style={{ gap: 4 }}>
                  <Text style={st.balanceLabel}>Mening balansim</Text>
                  <Text style={st.balanceVal}>0 <Text style={st.balanceCur}>uzs</Text></Text>
                </View>
                <Pressable onPress={() => go('/wallet')} style={st.topUpBtn}>
                  <Text style={st.topUpTxt}>Toʻldirish</Text>
                  <Feather name="arrow-up-right" size={16} color={C.ink} />
                </Pressable>
              </View>

              <View style={st.balanceDividers} />

              <View style={st.balanceActions}>
                <Pressable onPress={() => go('/wallet')} style={st.balanceActionBtn}>
                  <Feather name="clock" size={14} color={C.mutedForeground} />
                  <Text style={st.balanceActionTxt}>Toʻlov tarixi</Text>
                </Pressable>
                <View style={st.sep} />
                {/* Real total from the listings' own view counters (was a hard-coded "1.82K"). */}
                <Pressable style={st.balanceActionBtn} onPress={() => Alert.alert('Koʻrishlar', `${myListings.length} ta eʼlon · jami ${myListings.reduce((n, l) => n + (l.views || 0), 0)} marta koʻrilgan`)}>
                  <Feather name="bar-chart-2" size={14} color={C.mutedForeground} />
                  <Text style={st.balanceActionTxt}>Koʻrishlar</Text>
                </Pressable>
              </View>
            </View>

            {/* Filter Tabs matching Figma 726:182 */}
            <View style={st.tabsRow}>
              <Pressable
                onPress={() => setFilter('all')}
                style={[st.tab, filter === 'all' && st.tabActive]}
              >
                <Text style={[st.tabTxt, filter === 'all' && st.tabTxtActive]}>Barchasi</Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter('pending')}
                style={[st.tab, filter === 'pending' && st.tabActive]}
              >
                <View style={[st.badgeDot, { backgroundColor: C.warning }]} />
                <Text style={[st.tabTxt, filter === 'pending' && st.tabTxtActive]}>Kutilmoqda</Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter('approved')}
                style={[st.tab, filter === 'approved' && st.tabActive]}
              >
                <View style={[st.badgeDot, { backgroundColor: C.success }]} />
                <Text style={[st.tabTxt, filter === 'approved' && st.tabTxtActive]}>Tasdiqlandi</Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter('rejected')}
                style={[st.tab, filter === 'rejected' && st.tabActive]}
              >
                <View style={[st.badgeDot, { backgroundColor: C.destructive }]} />
                <Text style={[st.tabTxt, filter === 'rejected' && st.tabTxtActive]}>Rad etildi</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="plus-square"
            title="Eʼlonlar topilmadi"
            text="Bu toifada hozircha eʼlonlar mavjud emas."
            action={<Button label="Eʼlon joylash" icon="plus" onPress={() => go('/listing/edit')} />}
          />
        }
        renderItem={({ item, index }) => {
          const status: 'pending' | 'approved' | 'rejected' =
            (item as any).status || (index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected');

          const statusConfig = {
            pending: { label: 'Kutilmoqda', bg: '#FFF8E1', color: '#D97706', dot: C.warning },
            approved: { label: 'Tasdiqlandi', bg: C.successSoft, color: '#15803D', dot: C.success },
            rejected: { label: 'Rad etildi', bg: '#FEE2E2', color: '#DC2626', dot: C.destructive },
          }[status];

          return (
            <Pressable onPress={() => go(`/listing/${item.id}`)} style={st.card} testID={`my-${item.id}`}>
              {item.images[0] !== undefined ? (
                <Image source={src(item.images[0])} style={st.img} contentFit="cover" />
              ) : (
                <View style={[st.img, { backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name="image" size={24} color={C.mutedForeground} />
                </View>
              )}

              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={st.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[st.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <View style={[st.statusDot, { backgroundColor: statusConfig.dot }]} />
                    <Text style={[st.statusTxt, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location-outline" size={13} color={C.mutedForeground} />
                  <Text style={st.meta}>
                    {item.city || profile.region || 'Qoʻqon, Fargʻona'}
                  </Text>
                </View>

                <Text style={st.price}>{formatPrice(item.price)} soʻm</Text>
              </View>

              <View style={{ gap: 8, justifyContent: 'center' }}>
                <Pressable
                  onPress={() => go(`/listing/edit?id=${item.id}`)}
                  style={st.actBtn}
                  accessibilityLabel="Tahrirlash"
                >
                  <Feather name="edit-2" size={15} color={C.text} />
                </Pressable>
                <Pressable
                  onPress={() => confirmDelete(item.id)}
                  style={[st.actBtn, { backgroundColor: '#FEE2E2' }]}
                  accessibilityLabel="Oʻchirish"
                >
                  <Feather name="trash-2" size={15} color={C.destructive} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const useSt = makeStyles((C) => ({
  add: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  balanceCard: {
    backgroundColor: C.navy,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontFamily: F.dMedium,
    fontSize: 12,
    color: '#9AA0B7',
  },
  balanceVal: {
    fontFamily: F.dExtra,
    fontSize: 26,
    color: C.lime,
  },
  balanceCur: {
    fontFamily: F.dBold,
    fontSize: 16,
    color: C.white,
  },
  topUpBtn: {
    backgroundColor: C.lime,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  topUpTxt: {
    fontFamily: F.dBold,
    fontSize: 14,
    color: C.ink,
  },
  balanceDividers: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  balanceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceActionTxt: {
    fontFamily: F.dBold,
    fontSize: 12,
    color: C.white,
  },
  sep: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  tabActive: {
    backgroundColor: C.navy,
  },
  tabTxt: {
    fontFamily: F.dBold,
    fontSize: 11.5,
    color: C.mutedForeground,
  },
  tabTxtActive: {
    color: C.white,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 12,
  },
  img: { width: 84, height: 84, borderRadius: 16 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.text, flexShrink: 1 },
  meta: { fontFamily: F.dMedium, fontSize: 12, color: C.mutedForeground },
  price: { fontFamily: F.dExtra, fontSize: 15, color: C.text, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusTxt: { fontFamily: F.dBold, fontSize: 10 },
  actBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
