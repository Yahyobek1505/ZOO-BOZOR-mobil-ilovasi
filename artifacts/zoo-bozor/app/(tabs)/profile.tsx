import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { Alert } from '@/components/AppAlert';
import { Button, EmptyState, go, src, useTopInset } from '@/components/ui';
import { formatPrice, type Listing } from '@/constants/data';
import { useSession } from '@/context/AuthContext';
import { SignOutButton } from '@/components/SignOutButton';
import { displayPhone } from '@/constants/input';
import { useScreen } from '@/hooks/useScreen';
import { useLocale } from '@/context/LocaleContext';
import type { AppLanguage } from '@/constants/translations';

type Tab = 'info' | 'ads' | 'monitoring';
type InfoRow = { icon: keyof typeof Feather.glyphMap; label: string; value: string; verified?: boolean; testID?: string };

const MONTHS: Record<AppLanguage, string[]> = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** "12-noyabr, 2026" / "12 ноября 2026" / "12 November 2026"; Intl lacks Uzbek on many phones. */
function formatAccountDate(value: string | undefined, language: AppLanguage): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const day = date.getDate();
  const month = MONTHS[language][date.getMonth()];
  return language === 'uz' ? `${day}-${month}, ${date.getFullYear()}` : `${day} ${month} ${date.getFullYear()}`;
}

export default function ProfileScreen() {
  const { C } = useTheme();
  const st = useSt();
  const top = useTopInset();
  const { compact } = useScreen();
  const { isSignedIn, user } = useSession();
  const { language } = useLocale();
  const { profile, myListings } = useApp();
  const [tab, setTab] = useState<Tab>('info');
  const initials = profile.name
    ? profile.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  // Only the Firebase-verified sign-in email earns the green check; the phone is never verified.
  const account = isSignedIn && user ? user : null;
  const viaGoogle = !!account?.providerData.some((p) => p.providerId === 'google.com');
  const accountRows: InfoRow[] = account ? [
    { icon: 'user', label: 'Ism-familiya', value: profile.name || account.displayName || '', testID: 'account-name' },
    { icon: 'at-sign', label: 'Elektron pochta', value: account.email || '', verified: account.emailVerified, testID: 'account-email' },
    { icon: 'log-in', label: 'Kirish usuli', value: viaGoogle ? 'Google hisobi' : 'Email va parol', testID: 'account-provider' },
    { icon: 'calendar', label: 'Roʻyxatdan oʻtgan sana', value: formatAccountDate(account.metadata.creationTime, language), testID: 'account-created' },
    { icon: 'clock', label: 'Oxirgi kirish', value: formatAccountDate(account.metadata.lastSignInTime, language), testID: 'account-last-sign-in' },
  ] : [];
  const personalRows: InfoRow[] = [
    ...(account ? [] : [
      { icon: 'user', label: 'Ism-familiya', value: profile.name } as InfoRow,
      { icon: 'at-sign', label: 'Elektron pochta', value: profile.email } as InfoRow,
    ]),
    { icon: 'smartphone', label: 'Telefon raqami', value: displayPhone(profile.phone) },
    { icon: 'map-pin', label: 'Hudud', value: profile.region },
    { icon: 'gift', label: 'Tugʻilgan sana', value: profile.birth },
    { icon: 'users', label: 'Jinsi', value: profile.gender === 'erkak' ? 'Erkak' : profile.gender === 'ayol' ? 'Ayol' : '' },
  ];

  const renderRows = (rows: InfoRow[]) => rows.map((r, i) => (
    <View key={r.label} style={[st.infoRow, i < rows.length - 1 && st.sep]} testID={r.testID}>
      <Feather name={r.icon} size={22} color={C.text} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={st.infoLabel}>{r.label}</Text>
        <Text style={[st.infoVal, !r.value && { color: C.mutedForeground }]} numberOfLines={1}>{r.value || 'Kiritilmagan'}</Text>
      </View>
      {r.verified ? (
        <View style={st.verified} accessibilityLabel="Tasdiqlangan">
          <Ionicons name="checkmark-circle" size={16} color={C.success} />
          <Text style={st.verifiedTxt}>Tasdiqlangan</Text>
        </View>
      ) : null}
    </View>
  ));

  const listingMenu = (l: Listing) => Alert.alert(l.title, undefined, [
    { text: 'Koʻrish', onPress: () => go(`/listing/${l.id}`) },
    { text: 'Tahrirlash', onPress: () => go(`/listing/edit?id=${l.id}`) },
    { text: 'Yopish', style: 'cancel' },
  ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.surface }} contentContainerStyle={{ paddingTop: top + 8, paddingBottom: 130, paddingHorizontal: 14 }}>
      <View style={st.head}>
        <View style={st.row}>
          <Feather name="user" size={24} color={C.text} />
          <Text style={st.headTitle}>Profil</Text>
        </View>
        <View style={[st.row, { gap: 14 }]}>
          <Pressable onPress={() => go('/saved')} hitSlop={8} accessibilityLabel="Saqlanganlar">
            <Ionicons name="heart" size={26} color={C.text} />
          </Pressable>
          <Pressable onPress={() => go('/messages')} hitSlop={8} accessibilityLabel="Xabarlar">
            <Ionicons name="mail" size={26} color={C.text} />
          </Pressable>
          <Pressable onPress={() => go('/settings')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Sozlamalar" testID="profile-settings">
            <Ionicons name="settings-sharp" size={25} color={C.text} />
          </Pressable>
        </View>
      </View>

      <View style={st.card}>
        <View style={st.row}>
          <Pressable onPress={() => go('/profile-edit')} style={st.avatar}>
            {profile.avatar || account?.photoURL ? (
              <Image source={{ uri: profile.avatar || account?.photoURL || '' }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
            ) : initials ? (
              <Text style={st.initials}>{initials}</Text>
            ) : (
              <Feather name="user" size={34} color={C.lime} />
            )}
            <View style={st.cam}>
              <Feather name="camera" size={10} color={C.ink} />
            </View>
          </Pressable>
          <View style={{ flex: 1, marginLeft: 22 }}>
            <Text style={st.name} numberOfLines={1} testID="user-name-display">{profile.name || (isSignedIn ? user?.displayName || 'Foydalanuvchi' : 'Mehmon')}</Text>
            {account ? (
              <View style={[st.row, { marginTop: 4, gap: 4 }]}>
                {viaGoogle ? <Ionicons name="logo-google" size={11} color={C.mutedForeground} /> : <Feather name="at-sign" size={11} color={C.mutedForeground} />}
                <Text style={[st.region, { flexShrink: 1 }]} numberOfLines={1} testID="user-email-display">{account.email}</Text>
              </View>
            ) : null}
            <View style={[st.row, { marginTop: 6, gap: 4 }]}>
              <Ionicons name="location" size={12} color={C.mutedForeground} />
              <Text style={st.region}>{profile.region || 'Hudud koʻrsatilmagan'}</Text>
            </View>
          </View>
          <Pressable onPress={() => go('/profile-edit')} style={st.edit} testID="edit-profile" accessibilityLabel="Tahrirlash">
            <Ionicons name="pencil" size={18} color={C.lime} />
          </Pressable>
        </View>
        <View style={st.divider} />
        <View style={st.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={[st.row, { gap: 6 }]}>
              <Feather name="credit-card" size={16} color={C.mutedForeground} />
              <Text style={st.balLabel}>Mening balansim</Text>
            </View>
            <Text style={[st.balVal, compact && { fontSize: 22 }]} numberOfLines={1} adjustsFontSizeToFit>0 <Text style={[st.balCur, compact && { fontSize: 15 }]}>soʻm</Text></Text>
          </View>
          <Pressable onPress={() => go('/wallet')} style={[st.fill, compact && st.fillCompact]} accessibilityRole="button">
            <Feather name="plus" size={compact ? 16 : 20} color={C.ink} />
            <Text style={[st.fillTxt, compact && { fontSize: 13 }]}>Toʻldirish</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => go('/wallet')} style={[st.row, { gap: 4, marginTop: 8, alignSelf: 'flex-start' }]} accessibilityRole="link">
          <Text style={st.history}>Toʻlov tarixi</Text>
          <Feather name="chevron-right" size={13} color={C.white} />
        </Pressable>
      </View>

      {/* Figma: icon-only segmented control; the active tab's name sits under it with a green bar. */}
      <View style={st.tabs}>
        {/* Figma glyphs: person / listings-with-clock / wallet. */}
        {([
          ['info', 'account-outline', 'Maʼlumotlarim'],
          ['ads', 'calendar-clock-outline', 'Mening eʼlonlarim'],
          ['monitoring', 'wallet', 'Monitoring'],
        ] as const).map(([k, icon, label]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={st.tab} testID={`ptab-${k}`} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} accessibilityLabel={label}>
            <View style={[st.tabPill, tab === k && st.tabActive]}>
              <MaterialCommunityIcons name={icon} size={26} color={tab === k ? C.lime : '#b5b7bd'} />
            </View>
          </Pressable>
        ))}
      </View>
      <View style={st.tabLabels}>
        {(['info', 'ads', 'monitoring'] as const).map((k) => (
          <View key={k} style={st.tabLabelCell}>
            {tab === k ? <>
              <View style={st.tabBar} />
              <Text style={st.tabTxt}>{k === 'info' ? 'Maʼlumotlarim' : k === 'ads' ? 'Mening eʼlonlarim' : 'Monitoring'}</Text>
            </> : null}
          </View>
        ))}
      </View>

      {tab === 'info' ? (
        <View style={{ gap: 6 }}>
          {!isSignedIn ? (
            <View style={[st.list, { padding: 12, gap: 10 }]}>
              <Text style={st.guest}>Siz mehmon sifatida foydalanyapsiz. Maʼlumotlaringizni kiriting — ular faqat shu qurilmada saqlanadi.</Text>
              <Button label="Hisobga kirish" icon="log-in" onPress={() => go('/login')} />
              <Button label="Profilni toʻldirish" icon="edit-2" variant="ghost" onPress={() => go('/profile-edit')} />
            </View>
          ) : null}
          {accountRows.length ? <>
            <Text style={st.groupTitle}>Hisob maʼlumotlari</Text>
            <View style={st.list} testID="account-details">{renderRows(accountRows)}</View>
          </> : null}
          <View style={[st.row, st.groupHead]}>
            <Text style={[st.groupTitle, { marginTop: 0, marginHorizontal: 0 }]}>Shaxsiy maʼlumotlar</Text>
            <Pressable onPress={() => go('/profile-edit')} hitSlop={8} accessibilityRole="button" testID="edit-personal">
              <Text style={st.groupAction}>Tahrirlash</Text>
            </Pressable>
          </View>
          <View style={st.list}>{renderRows(personalRows)}</View>
        </View>
      ) : null}

      {tab === 'ads' ? (
        myListings.length ? (
          <View style={{ gap: 10 }}>
            {/* Figma "Eʼlonlar tahlili" rows. There is no moderation queue, so the badge shows whether the
                listing is live for everyone or still only on this device. */}
            {myListings.map((l) => (
              <View key={l.id} style={[st.adRow, !l.localOnly && st.adLive]}>
                {/* Sibling, not parent, of the menu button: nested buttons are invalid on the web. */}
                <Pressable onPress={() => go(`/listing/${l.id}`)} style={st.adMain} accessibilityRole="button" testID={`my-ad-${l.id}`}>
                {l.images[0] !== undefined
                  ? <Image source={src(l.images[0])} style={st.adImg} contentFit="cover" />
                  : <View style={[st.adImg, { backgroundColor: C.secondary }]} />}
                <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                  <Text style={st.adTitle} numberOfLines={1}>{l.title}</Text>
                  <Text style={st.adPrice} numberOfLines={1}>{formatPrice(l.price)} soʻm</Text>
                  <View style={[st.row, { gap: 4 }]}>
                    <Ionicons name="location" size={13} color={C.text} />
                    <Text style={st.adMeta} numberOfLines={1}>{l.city}</Text>
                  </View>
                </View>
                </Pressable>
                <Pressable onPress={() => listingMenu(l)} hitSlop={10} style={st.adMore} accessibilityRole="button" accessibilityLabel="Amallar" testID={`my-ad-menu-${l.id}`}>
                  <Feather name="more-horizontal" size={22} color={C.dark ? C.mutedDark : '#4a4f63'} />
                </Pressable>
                <View style={[st.badge, l.localOnly ? st.badgeLocal : st.badgeLive]}>
                  <Feather name={l.localOnly ? 'smartphone' : 'check-circle'} size={13} color={l.localOnly ? C.text : C.white} />
                  <Text style={[st.badgeTxt, !l.localOnly && { color: C.white }]}>{l.localOnly ? 'Faqat qurilmada' : 'Joylangan'}</Text>
                </View>
              </View>
            ))}
            <Button label="Barcha eʼlonlarim" icon="list" variant="navy" onPress={() => go('/my-listings')} />
          </View>
        ) : (
          <EmptyState icon="plus-square" title="Eʼlonlaringiz yoʻq" text="Hayvoningiz uchun gʻamxoʻr egasini topishga birinchi qadam." action={<Button label="Eʼlon joylash" icon="plus" onPress={() => go('/listing/edit')} />} />
        )
      ) : null}

      {tab === 'monitoring' ? (
        <EmptyState icon="credit-card" title="Toʻlovlar yoʻq" text="Balans va toʻlovlar tarixi toʻlov xizmati ulanganidan keyin koʻrinadi." action={<Button label="Hamyon" icon="credit-card" variant="navy" onPress={() => go('/wallet')} />} />
      ) : null}

      {isSignedIn ? <SignOutButton /> : null}

      <View style={[st.row, { justifyContent: 'center', gap: 6, marginTop: 18 }]}>
        <Feather name="lock" size={12} color={C.mutedForeground} />
        <Text style={st.foot}>Shaxsiy maʼlumotlaringiz faqat shu qurilmada saqlanadi</Text>
      </View>
    </ScrollView>
  );
}

const useSt = makeStyles((C) => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headTitle: { fontFamily: F.dBold, fontSize: 20, color: C.text, marginLeft: 12 },
  // Card, tabs and list values follow Figma "15-Shaxsiy Profil" (node 25:311).
  card: { backgroundColor: C.navy, borderRadius: 20, paddingHorizontal: 13, paddingTop: 15, paddingBottom: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: F.dExtra, fontSize: 24, color: C.lime },
  cam: { position: 'absolute', left: 46, top: 51, width: 19, height: 19, borderRadius: 9.5, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: F.dBold, fontSize: 18, color: C.white },
  region: { fontFamily: F.dMedium, fontSize: 11, color: C.mutedForeground },
  edit: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0f152c', borderWidth: 1, borderColor: 'rgba(43,56,103,0.3)', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.5)', marginTop: 14, marginBottom: 12, marginHorizontal: 2 },
  balLabel: { fontFamily: F.dSemibold, fontSize: 11, color: C.mutedForeground },
  balVal: { fontFamily: F.dExtra, fontSize: 28, color: C.lime, marginTop: 4 },
  balCur: { fontFamily: F.dBold, fontSize: 18, color: C.white },
  fill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.lime, borderRadius: 10, width: 127, height: 38 },
  fillCompact: { width: 'auto', paddingHorizontal: 12, gap: 4 },
  fillTxt: { fontFamily: F.dExtra, fontSize: 15, color: C.ink },
  history: { fontFamily: F.dBold, fontSize: 10, color: C.white },
  tabs: { flexDirection: 'row', backgroundColor: C.subtle, borderRadius: 37, height: 51, padding: 4, marginTop: 11, marginHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  tabPill: { width: '100%', maxWidth: 102, height: 43, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: C.navy },
  tabLabels: { flexDirection: 'row', marginHorizontal: 6, height: 33 },
  tabLabelCell: { flex: 1, alignItems: 'center' },
  tabBar: { width: 58, height: 3, borderRadius: 1.5, backgroundColor: C.success, marginTop: 2 },
  tabTxt: { fontFamily: F.dMedium, fontSize: 11, color: '#c7c7c7', marginTop: 4 },
  list: { backgroundColor: C.subtle, borderRadius: 12, paddingHorizontal: 20, marginHorizontal: 6 },
  groupTitle: { fontFamily: F.dBold, fontSize: 13, color: '#737373', marginTop: 6, marginHorizontal: 16 },
  groupHead: { justifyContent: 'space-between', marginTop: 12, marginHorizontal: 16 },
  groupAction: { fontFamily: F.dBold, fontSize: 12, color: C.text, textDecorationLine: 'underline' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.successSoft, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  verifiedTxt: { fontFamily: F.dBold, fontSize: 10, color: C.success },
  guest: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground, lineHeight: 19 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 56, paddingVertical: 8 },
  sep: { borderBottomWidth: 1, borderBottomColor: C.dark ? C.border : '#ebebeb' },
  infoLabel: { fontFamily: F.dSemibold, fontSize: 9, color: '#737373' },
  infoVal: { fontFamily: F.dBold, fontSize: 15, color: C.text, marginTop: 2 },
  adRow: { borderWidth: 1, borderColor: C.dark ? C.border : '#ececec', borderRadius: 10, padding: 7, paddingRight: 12, backgroundColor: C.card },
  adMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adLive: { backgroundColor: C.successSoft, borderColor: C.successSoft },
  adImg: { width: 86, height: 86, borderRadius: 8 },
  adTitle: { fontFamily: F.dMedium, fontSize: 13, color: C.text, paddingRight: 28 },
  adPrice: { fontFamily: F.dExtra, fontSize: 17, color: C.text },
  adMeta: { fontFamily: F.dMedium, fontSize: 12, color: C.text, flexShrink: 1, paddingRight: 96 },
  adMore: { position: 'absolute', top: 6, right: 10 },
  badge: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, paddingHorizontal: 8, height: 22 },
  badgeLive: { backgroundColor: C.success },
  badgeLocal: { backgroundColor: C.dark ? C.secondary : '#e8e8e8' },
  badgeTxt: { fontFamily: F.dBold, fontSize: 11, color: C.text },
  foot: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
}));
