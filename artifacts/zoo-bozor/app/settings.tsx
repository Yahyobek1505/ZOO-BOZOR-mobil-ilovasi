import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { APP_LANGUAGES } from '@/constants/translations';
import { useLocale } from '@/context/LocaleContext';
import { Button, ScreenHeader, go, useBottomInset } from '@/components/ui';
import { ToggleRow, fieldStyles } from '@/components/Field';

export default function Settings() {
  const { prefs, setPrefs, resetAll } = useApp();
  const { language, setLanguage, t } = useLocale();
  const bottom = useBottomInset();

  const reset = () =>
    Alert.alert(t('Qurilmadagi maʼlumotlarni tozalash'), t('Shu hisobning qurilmadagi eski eʼlonlari, profili, savati, saqlanganlari va xabar qoralamalari oʻchiriladi. Serverdagi ommaviy eʼlonlar oʻchirilmaydi; ularni «Mening eʼlonlarim» orqali alohida oʻchiring.'), [
      { text: t('Bekor qilish'), style: 'cancel' },
      { text: t('Tozalash'), style: 'destructive', onPress: resetAll },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Sozlamalar" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 24 }}>
        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Ilova tili</Text>
          {APP_LANGUAGES.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => { setLanguage(l.id); setPrefs({ language: l.id }); }}
              style={st.lang}
              testID={`lang-${l.id}`}
              accessibilityRole="button"
              accessibilityState={{ selected: language === l.id }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={st.langTxt}>{l.name}</Text>
                <Text style={st.greeting}>{l.greeting}</Text>
              </View>
              <Feather name={language === l.id ? 'check-circle' : 'circle'} size={20} color={language === l.id ? C.navy : C.border} />
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
  greeting: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  p: { fontFamily: F.regular, fontSize: 13, color: C.navy, lineHeight: 20 },
});
