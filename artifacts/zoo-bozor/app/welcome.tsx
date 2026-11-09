import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { C, F } from '@/constants/colors';
import { IMAGES } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { BrandMark, Button, useBottomInset, useTopInset } from '@/components/ui';

const SLIDES = [
  { image: IMAGES.catHero, title: 'Har bir hayvonga — gʻamxoʻr uy', text: 'Mushuk, kuchuk, qush va chorva eʼlonlarini bir joyda koʻring.' },
  { image: IMAGES.marketBanner, title: 'Ozuqa va jihozlar', text: 'Marketdan kerakli mahsulotlarni savatga yigʻing.' },
  { image: IMAGES.golden, title: 'Oʻz eʼloningizni joylang', text: 'Rasm, narx va manzil — bir necha daqiqada tayyor.' },
];

export default function Welcome() {
  const top = useTopInset();
  const bottom = useBottomInset();
  const { setPrefs } = useApp();
  const [step, setStep] = useState(-1);

  const finish = () => {
    setPrefs({ welcomed: true });
    if (router.canGoBack()) router.back();
    else router.replace('/' as never);
  };

  if (step === -1) {
    return (
      <View style={[st.splash, { paddingTop: top + 20, paddingBottom: bottom + 20 }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <View style={st.logo}>
            <BrandMark size={64} color={C.navy} />
          </View>
          <Text style={st.brand}>ZOO BOZOR</Text>
          <Text style={st.tag}>Hayvonlar va ular uchun hamma narsa</Text>
        </View>
        <Text style={st.langTitle}>Tilni tanlang</Text>
        <Pressable style={[st.lang, st.langActive]} onPress={() => setStep(0)} testID="lang-uz">
          <Text style={[st.langTxt, { color: C.navy }]}>Oʻzbekcha</Text>
        </Pressable>
        <Text style={st.note}>Boshqa tillar tez orada qoʻshiladi</Text>
        <Pressable onPress={finish} style={{ alignSelf: 'center', padding: 10 }}>
          <Text style={st.skip}>Oʻtkazib yuborish</Text>
        </Pressable>
      </View>
    );
  }

  const s = SLIDES[step];
  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <Image source={s.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <View style={[st.topRow, { top: top + 8 }]}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[st.bar, i <= step && { backgroundColor: C.lime }]} />
          ))}
        </View>
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={[st.skip, { color: C.white }]}>Oʻtkazish</Text>
        </Pressable>
      </View>
      <View style={[st.card, { paddingBottom: bottom + 20 }]}>
        <Text style={st.title}>{s.title}</Text>
        <Text style={st.text}>{s.text}</Text>
        <Button label={step === SLIDES.length - 1 ? 'Boshlash' : 'Davom etish'} icon="arrow-right" onPress={() => (step === SLIDES.length - 1 ? finish() : setStep(step + 1))} testID="next" />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  splash: { flex: 1, backgroundColor: C.navy, paddingHorizontal: 24, gap: 10 },
  logo: { width: 120, height: 120, borderRadius: 36, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: F.dExtra, fontSize: 34, color: C.white, letterSpacing: 1 },
  tag: { fontFamily: F.medium, fontSize: 14, color: C.mutedForeground },
  langTitle: { fontFamily: F.dBold, fontSize: 16, color: C.white },
  lang: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.navySoft },
  langActive: { backgroundColor: C.lime, borderColor: C.lime },
  langTxt: { fontFamily: F.dBold, fontSize: 16, color: C.white },
  note: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, textAlign: 'center' },
  skip: { fontFamily: F.semibold, fontSize: 14, color: C.mutedForeground },
  topRow: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bar: { width: 34, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  card: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, gap: 12 },
  title: { fontFamily: F.dExtra, fontSize: 26, color: C.navy, lineHeight: 32 },
  text: { fontFamily: F.regular, fontSize: 15, color: C.mutedForeground, lineHeight: 22, marginBottom: 8 },
});
