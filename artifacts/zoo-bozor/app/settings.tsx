import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { Prefs, useApp } from '@/context/AppContext';
import { Button, ScreenHeader, go, useBottomInset } from '@/components/ui';
import { ToggleRow, fieldStyles } from '@/components/Field';

const LANGS: { id: Prefs['language']; label: string; ready: boolean }[] = [
  { id: 'uz', label: 'Oʻzbekcha (lotin)', ready: true },
  { id: 'uzc', label: 'Ўзбекча (кирилл)', ready: false },
  { id: 'ru', label: 'Русский', ready: false },
];

export default function Settings() {
  const { prefs, setPrefs, resetAll } = useApp();
  const bottom = useBottomInset();

  const reset = () =>
    Alert.alert('Qurilmadagi maʼlumotlarni tozalash', 'Shu hisobning qurilmadagi eski eʼlonlari, profili, savati, saqlanganlari va xabar qoralamalari oʻchiriladi. Serverdagi ommaviy eʼlonlar oʻchirilmaydi; ularni «Mening eʼlonlarim» orqali alohida oʻchiring.', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Tozalash', style: 'destructive', onPress: resetAll },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Sozlamalar" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 24 }}>
        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Ilova tili</Text>
          {LANGS.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => (l.ready ? setPrefs({ language: l.id }) : Alert.alert(l.label, 'Bu til uchun tarjima hali tayyor emas. Hozircha ilova oʻzbek tilida (lotin) ishlaydi.'))}
              style={st.lang}
              testID={`lang-${l.id}`}
            >
              <Text style={[st.langTxt, !l.ready && { color: C.mutedForeground }]}>{l.label}</Text>
              {!l.ready ? <Text style={st.soon}>Tez kunda</Text> : null}
              <Feather name={prefs.language === l.id ? 'check-circle' : 'circle'} size={20} color={prefs.language === l.id ? C.navy : C.border} />
            </Pressable>
          ))}
        </View>

        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Afzalliklar</Text>
          <ToggleRow
            label="Bildirishnomalar"
            sub="Sozlama saqlanadi. Push-bildirishnomalar server ulanganidan keyin ishlaydi."
            value={prefs.notifications}
            onChange={(v) => setPrefs({ notifications: v })}
          />
        </View>

        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Yordam va maʼlumot</Text>
          <Text style={st.p}>
            ZOO-BOZOR — uy hayvonlariga gʻamxoʻr egalar topish va ular uchun mahsulotlar xarid qilish uchun oʻzbek bozori.
          </Text>
          <Text style={st.p}>
            Namuna deb belgilangan eʼlonlar va Market mahsulotlari — namuna katalog. Ulardagi sotuvchi raqamlari yoʻq. Joylangan haqiqiy eʼlonlar va ularning aloqa raqamlari serverda saqlanib, hammaga koʻrinadi. Profil, savat, xabar qoralamalari va eʼlon qoralamalari shu qurilmada saqlanadi. Eski mahalliy eʼlonlarni import qilish ixtiyoriy.
          </Text>
          <Text style={st.p}>
            Hali ulanmagan xizmatlar: xabar yuborish, toʻlov va hamyon, shikoyatlar, push-bildirishnomalar. Xaritalar Yandex Xaritalar orqali ochiladi.
          </Text>
          <Text style={st.p}>Muhim: hayvon va uning hujjatlarini xariddan oldin shaxsan tekshiring.</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Tanishuv" icon="compass" variant="ghost" style={{ flex: 1 }} onPress={() => go('/welcome')} />
          <Button label="Kirish" icon="log-in" variant="navy" style={{ flex: 1 }} onPress={() => go('/login')} />
        </View>
        <Button label="Qurilmadagi maʼlumotlarni tozalash" icon="trash-2" variant="danger" onPress={reset} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  lang: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  langTxt: { flex: 1, fontFamily: F.dSemibold, fontSize: 15, color: C.navy },
  soon: { fontFamily: F.semibold, fontSize: 11, color: C.navy, backgroundColor: C.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  p: { fontFamily: F.regular, fontSize: 13, color: C.navy, lineHeight: 20 },
});
