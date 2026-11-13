import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { BrandMark, go, useTopInset } from '@/components/ui';
import { useLocale } from '@/context/LocaleContext';

type Tab = 'upcoming' | 'finished';

const EMPTY_ART = require('@/assets/figma/savdo-empty.png');

/**
 * Figma "Savdo" tab (16-To'lov usuli-7/8). There is no auction backend yet, so both
 * lists show the design's empty states instead of sample lots and fake bidders.
 */
export default function SavdoScreen() {
  const { C, dark, toggleTheme } = useTheme();
  const st = useSt();
  const top = useTopInset();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('upcoming');

  const notifyMe = () =>
    Alert.alert('Bildirishnomalar hali ulanmagan', 'Savdo boshlanishi haqidagi xabarlar bildirishnoma xizmati ulanganidan keyin keladi.');

  return (
    <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
      <View style={[st.header, { paddingTop: top + 12 }]}>
        <View style={st.brand}>
          <Ionicons name="hammer" size={20} color={C.white} />
          <Text style={st.title}>SAVDO</Text>
        </View>
        <View style={st.actions}>
          <Pressable onPress={toggleTheme} hitSlop={8} accessibilityRole="switch" accessibilityState={{ checked: dark }} accessibilityLabel={t('Tungi rejim')} testID="theme-toggle" style={[st.moon, dark && { backgroundColor: C.lime, borderColor: C.lime }]}>
            <Ionicons name={dark ? 'sunny' : 'moon'} size={13} color={dark ? C.ink : C.white} />
          </Pressable>
          <Pressable onPress={() => go('/settings')} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Sozlamalar')} testID="savdo-settings">
            <Ionicons name="settings-sharp" size={25} color={C.white} />
          </Pressable>
        </View>
      </View>

      <View style={st.segment}>
        {(['upcoming', 'finished'] as const).map((key) => {
          const active = tab === key;
          return (
            <View key={key} style={{ flex: 1, alignItems: 'center' }}>
              <Pressable onPress={() => setTab(key)} style={[st.segBtn, active && st.segBtnActive]} accessibilityRole="tab" accessibilityState={{ selected: active }} testID={`savdo-${key}`}>
                <Text style={[st.segTxt, active && st.segTxtActive]}>{key === 'upcoming' ? 'Kutilayotgan' : 'Yakunlangan'}</Text>
              </Pressable>
              {active ? <View style={st.segBar} /> : null}
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {tab === 'upcoming' ? (
          <View style={st.empty} testID="savdo-empty">
            <Image source={EMPTY_ART} style={st.art} resizeMode="contain" />
            <Text style={st.emptyTitle}>Hozircha savdo rejalashtirilmagan</Text>
            <Text style={st.emptyText}>Yangi savdo belgilansa, shu yerda koʻrinadi. Boshlanishidan xabardor boʻlishingiz mumkin.</Text>
            <Pressable onPress={notifyMe} style={({ pressed }) => [st.notify, pressed && { opacity: 0.85 }]} accessibilityRole="button" testID="savdo-notify">
              <Ionicons name="notifications" size={20} color={C.lime} />
              <Text style={st.notifyTxt}>Savdolardan xabardor boʻlish</Text>
            </Pressable>
            {/* Figma promises "turn off any time"; push is not connected yet, so say so instead. */}
            <Text style={st.hint}>Bildirishnoma xizmati ulanganidan keyin ishlaydi.</Text>
            <Pressable onPress={() => go('/')} style={st.home} accessibilityRole="link" testID="savdo-home">
              <BrandMark size={18} color={C.text} />
              <Text style={st.homeTxt}>Bosh sahifaga</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
            <Text style={st.listTitle}>Yakunlangan savdolar</Text>
            <Text style={st.listSub}>Savdo natijalari</Text>
            <View style={st.finishedEmpty} testID="savdo-finished-empty">
              <Feather name="award" size={26} color={C.mutedForeground} />
              <Text style={st.finishedTxt}>Hozircha yakunlangan savdo yoʻq</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  // Figma: navy bar, 20px bottom radius, white moon-in-ring and gear on the right.
  header: {
    backgroundColor: C.navy,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: F.dExtra, fontSize: 16, color: C.white, letterSpacing: 0.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  moon: { width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: C.white, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', backgroundColor: C.dark ? C.card : '#F1F1F1', borderRadius: 12, marginHorizontal: 17, marginTop: 17, padding: 2, paddingBottom: 0, height: 42 },
  segBtn: { alignSelf: 'stretch', height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: { backgroundColor: C.navy },
  segTxt: { fontFamily: F.dBold, fontSize: 15, color: '#737373' },
  segTxtActive: { color: C.lime },
  segBar: { width: 94, height: 3, borderRadius: 1.5, backgroundColor: C.success, marginTop: 4 },
  empty: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 48 },
  art: { width: 245, height: 110 },
  emptyTitle: { fontFamily: F.dExtra, fontSize: 28, lineHeight: 34, color: C.text, textAlign: 'center', marginTop: 24 },
  emptyText: { fontFamily: F.dMedium, fontSize: 12, lineHeight: 18, color: '#8A8F9C', textAlign: 'center', marginTop: 10 },
  notify: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.navy, height: 52, borderRadius: 12, alignSelf: 'stretch', marginTop: 120 },
  notifyTxt: { fontFamily: F.dBold, fontSize: 16, color: C.white },
  hint: { fontFamily: F.dMedium, fontSize: 12, color: '#8A8F9C', marginTop: 10 },
  home: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28, padding: 6 },
  homeTxt: { fontFamily: F.dBold, fontSize: 15, color: C.text, textDecorationLine: 'underline' },
  listTitle: { fontFamily: F.dBold, fontSize: 20, color: C.text },
  listSub: { fontFamily: F.dMedium, fontSize: 14, color: '#737373', marginTop: 2 },
  finishedEmpty: { alignItems: 'center', gap: 10, backgroundColor: C.dark ? C.card : '#F6F6F6', borderRadius: 16, paddingVertical: 32, marginTop: 18 },
  finishedTxt: { fontFamily: F.dMedium, fontSize: 13, color: C.mutedDark },
}));
