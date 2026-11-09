import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { Button, EmptyState, ListingCard, go, useTopInset } from '@/components/ui';

type Tab = 'info' | 'ads' | 'menu';

export default function ProfileScreen() {
  const top = useTopInset();
  const { profile, myListings, favorites, favoriteProducts, cart, conversations } = useApp();
  const [tab, setTab] = useState<Tab>('info');
  const initials = profile.name
    ? profile.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  const rows: { icon: keyof typeof Feather.glyphMap; label: string; value: string }[] = [
    { icon: 'user', label: 'Ism-familiya', value: profile.name },
    { icon: 'smartphone', label: 'Telefon raqami', value: profile.phone },
    { icon: 'at-sign', label: 'Elektron pochta', value: profile.email },
    { icon: 'map-pin', label: 'Hudud', value: profile.region },
    { icon: 'calendar', label: 'Tugʻilgan sana', value: profile.birth },
    { icon: 'users', label: 'Jinsi', value: profile.gender === 'erkak' ? 'Erkak' : profile.gender === 'ayol' ? 'Ayol' : '' },
  ];

  const menu: { icon: keyof typeof Feather.glyphMap; label: string; to: string; count?: number }[] = [
    { icon: 'heart', label: 'Saqlanganlar', to: '/saved', count: favorites.length + favoriteProducts.length },
    { icon: 'shopping-cart', label: 'Savat', to: '/cart', count: cart.length },
    { icon: 'mail', label: 'Xabarlar (qoralamalar)', to: '/messages', count: conversations.length },
    { icon: 'credit-card', label: 'Hamyon va toʻlovlar', to: '/wallet' },
    { icon: 'globe', label: 'Til va sozlamalar', to: '/settings' },
    { icon: 'log-in', label: 'Hisobga kirish', to: '/login' },
    { icon: 'compass', label: 'Ilova bilan tanishuv', to: '/welcome' },
    { icon: 'help-circle', label: 'Yordam va maʼlumot', to: '/settings#help' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.surface }} contentContainerStyle={{ paddingTop: top + 8, paddingBottom: 120, paddingHorizontal: 16 }}>
      <View style={st.head}>
        <View style={st.row}>
          <Feather name="user" size={24} color={C.navy} />
          <Text style={st.headTitle}>Profil</Text>
        </View>
        <View style={[st.row, { gap: 14 }]}>
          <Pressable onPress={() => go('/saved')} hitSlop={8} accessibilityLabel="Saqlanganlar">
            <Ionicons name="heart" size={26} color={C.navy} />
          </Pressable>
          <Pressable onPress={() => go('/messages')} hitSlop={8} accessibilityLabel="Xabarlar">
            <Ionicons name="mail" size={26} color={C.navy} />
          </Pressable>
        </View>
      </View>

      <View style={st.card}>
        <View style={st.row}>
          <Pressable onPress={() => go('/profile-edit')} style={st.avatar}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
            ) : initials ? (
              <Text style={st.initials}>{initials}</Text>
            ) : (
              <Feather name="user" size={34} color={C.lime} />
            )}
            <View style={st.cam}>
              <Feather name="camera" size={12} color={C.navy} />
            </View>
          </Pressable>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={st.name} numberOfLines={1}>{profile.name || 'Mehmon'}</Text>
            <View style={[st.row, { marginTop: 4, gap: 4 }]}>
              <Feather name="map-pin" size={12} color={C.mutedForeground} />
              <Text style={st.region}>{profile.region || 'Hudud koʻrsatilmagan'}</Text>
            </View>
          </View>
          <Pressable onPress={() => go('/profile-edit')} style={st.edit} testID="edit-profile" accessibilityLabel="Tahrirlash">
            <Feather name="edit-2" size={18} color={C.lime} />
          </Pressable>
        </View>
        <View style={st.divider} />
        <View style={st.row}>
          <View style={{ flex: 1 }}>
            <View style={[st.row, { gap: 6 }]}>
              <Feather name="credit-card" size={14} color={C.mutedForeground} />
              <Text style={st.balLabel}>Mening balansim</Text>
            </View>
            <Text style={st.balNone}>Ulanmagan</Text>
          </View>
          <Pressable onPress={() => go('/wallet')} style={st.fill}>
            <Feather name="info" size={16} color={C.navy} />
            <Text style={st.fillTxt}>Batafsil</Text>
          </Pressable>
        </View>
      </View>

      <View style={st.tabs}>
        {([
          ['info', 'user', 'Maʼlumotlarim'],
          ['ads', 'calendar', 'Eʼlonlarim'],
          ['menu', 'grid', 'Boshqalar'],
        ] as const).map(([k, icon, label]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[st.tab, tab === k && st.tabActive]} testID={`ptab-${k}`}>
            <Feather name={icon} size={20} color={tab === k ? C.lime : C.mutedForeground} />
            <Text style={[st.tabTxt, tab === k && { color: C.white }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'info' ? (
        <View style={st.list}>
          {!profile.name ? (
            <View style={{ padding: 12, gap: 10 }}>
              <Text style={st.guest}>Siz mehmon sifatida foydalanyapsiz. Maʼlumotlaringizni kiriting — ular faqat shu qurilmada saqlanadi.</Text>
              <Button label="Profilni toʻldirish" icon="edit-2" onPress={() => go('/profile-edit')} />
            </View>
          ) : null}
          {rows.map((r, i) => (
            <View key={r.label} style={[st.infoRow, i < rows.length - 1 && st.sep]}>
              <Feather name={r.icon} size={22} color={C.navy} />
              <View style={{ flex: 1 }}>
                <Text style={st.infoLabel}>{r.label}</Text>
                <Text style={[st.infoVal, !r.value && { color: C.mutedForeground }]}>{r.value || 'Kiritilmagan'}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'ads' ? (
        myListings.length ? (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {myListings.map((l) => (
                <ListingCard key={l.id} item={l} style={{ width: '47.5%' }} />
              ))}
            </View>
            <Button label="Eʼlonlarni boshqarish" icon="settings" variant="navy" onPress={() => go('/my-listings')} />
          </View>
        ) : (
          <EmptyState icon="plus-square" title="Eʼlonlaringiz yoʻq" text="Hayvoningiz uchun gʻamxoʻr egasini topishga birinchi qadam." action={<Button label="Eʼlon joylash" icon="plus" onPress={() => go('/listing/edit')} />} />
        )
      ) : null}

      {tab === 'menu' ? (
        <View style={st.list}>
          {menu.map((m, i) => (
            <Pressable key={m.label} onPress={() => go(m.to.replace('#help', ''))} style={[st.infoRow, i < menu.length - 1 && st.sep]}>
              <Feather name={m.icon} size={20} color={C.navy} />
              <Text style={[st.infoVal, { flex: 1 }]}>{m.label}</Text>
              {m.count ? <Text style={st.count}>{m.count}</Text> : null}
              <Feather name="chevron-right" size={18} color={C.mutedForeground} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={[st.row, { justifyContent: 'center', gap: 6, marginTop: 18 }]}>
        <Feather name="lock" size={12} color={C.mutedForeground} />
        <Text style={st.foot}>Shaxsiy maʼlumotlaringiz faqat shu qurilmada saqlanadi</Text>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headTitle: { fontFamily: F.dExtra, fontSize: 22, color: C.navy, marginLeft: 8 },
  card: { backgroundColor: C.navy, borderRadius: 26, padding: 18 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: F.dExtra, fontSize: 26, color: C.lime },
  cam: { position: 'absolute', right: -2, bottom: 0, width: 24, height: 24, borderRadius: 8, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: F.dBold, fontSize: 19, color: C.white },
  region: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground },
  edit: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: C.navySoft, marginVertical: 16 },
  balLabel: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  balNone: { fontFamily: F.dExtra, fontSize: 24, color: C.lime, marginTop: 4 },
  fill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.lime, borderRadius: 12, paddingHorizontal: 16, height: 42 },
  fillTxt: { fontFamily: F.dBold, fontSize: 14, color: C.navy },
  tabs: { flexDirection: 'row', backgroundColor: C.secondary, borderRadius: 26, padding: 4, marginVertical: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 22, gap: 2 },
  tabActive: { backgroundColor: C.navy },
  tabTxt: { fontFamily: F.medium, fontSize: 11, color: C.mutedForeground },
  list: { backgroundColor: C.white, borderRadius: 20, paddingHorizontal: 14 },
  guest: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground, lineHeight: 19 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  sep: { borderBottomWidth: 1, borderBottomColor: C.border },
  infoLabel: { fontFamily: F.regular, fontSize: 11, color: C.mutedForeground },
  infoVal: { fontFamily: F.dSemibold, fontSize: 15, color: C.navy, marginTop: 2 },
  count: { fontFamily: F.bold, fontSize: 12, color: C.navy, backgroundColor: C.lime, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, overflow: 'hidden' },
  foot: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
});
