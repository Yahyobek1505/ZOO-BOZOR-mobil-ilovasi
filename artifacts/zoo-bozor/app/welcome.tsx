import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text as NativeText, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { cancelAnimation, Easing, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { IMAGES } from '@/constants/data';
import { useOptionalApp } from '@/context/AppContext';
import { APP_LANGUAGES } from '@/constants/translations';
import { useLocale } from '@/context/LocaleContext';
import { BrandMark, Button, useBottomInset, useTopInset } from '@/components/ui';

const SLIDES = [
  { image: IMAGES.catHero, title: 'Har bir hayvonga — gʻamxoʻr uy', text: 'Mushuk, kuchuk, qush va chorva eʼlonlarini bir joyda koʻring.' },
  { image: IMAGES.marketBanner, title: 'Ozuqa va jihozlar', text: 'Marketdan kerakli mahsulotlarni savatga yigʻing.' },
  { image: IMAGES.golden, title: 'Oʻz eʼloningizni joylang', text: 'Rasm, narx va manzil — bir necha daqiqada tayyor.' },
];

export default function Welcome() {
  const top = useTopInset();
  const bottom = useBottomInset();
  const app = useOptionalApp();
  const { language, setLanguage, completeOnboarding } = useLocale();
  const [step, setStep] = useState(-1);
  const rotation = useSharedValue(0);
  const markAnimation = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const finish = () => {
    app?.setPrefs({ welcomed: true });
    completeOnboarding();
    if (router.canGoBack()) router.back();
    else router.replace('/' as never);
  };

  useEffect(() => {
    if (step !== -1) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }
    rotation.value = withTiming(360, { duration: 650, easing: Easing.linear });
    return () => cancelAnimation(rotation);
  }, [rotation, step]);

  if (step === -1) {
    return (
      <View style={[st.splash, { paddingTop: top + 10, paddingBottom: bottom + 12 }]}>
        <View style={st.main}>
          <View style={st.hero}>
            <Animated.View entering={FadeInUp.duration(450)} style={st.heroImage}>
              <Image source={require('@/assets/figma/login-illustration-2.png')} style={StyleSheet.absoluteFill} contentFit="contain" transition={250} accessibilityLabel="Mushuk va kuchuk eshik oldida" />
              <View style={st.logoBadge}>
                <Animated.View style={markAnimation}>
                  <BrandMark size={34} color={C.navy} />
                </Animated.View>
              </View>
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(660).duration(420)} style={st.brand}>ZOO BOZOR</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(730).duration(420)} style={st.tag}>Hayvonlar va ular uchun hamma narsa</Animated.Text>
          </View>

          <Animated.Text entering={FadeInUp.delay(790).duration(400)} style={st.langTitle}>Qulay tilni tanlang!</Animated.Text>
          <View style={st.languages}>
            {APP_LANGUAGES.map((option, index) => {
              const selected = language === option.id;
              return (
                <Animated.View key={option.id} entering={FadeInUp.delay(840 + index * 55).duration(350)}>
                  <Pressable
                    style={[st.lang, selected ? st.langActive : st.langInactive]}
                    onPress={() => { setLanguage(option.id); app?.setPrefs({ language: option.id }); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    testID={`lang-${option.id}`}
                  >
                    <View style={st.langWords}>
                      <Text style={[st.langTxt, selected && st.langTxtActive]}>{option.name}</Text>
                      <NativeText style={[st.greeting, selected && st.greetingActive]}>{option.greeting}</NativeText>
                    </View>
                    <Feather name={selected ? 'check-circle' : 'circle'} size={22} color={selected ? C.lime : C.border} />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
          <Text style={st.note}>Tilni keyin ham oʻzgartira olasiz!</Text>
        </View>
        <View style={st.actions}>
          <Button label="Davom etish" icon="arrow-right" onPress={() => setStep(0)} testID="welcome-continue" />
          <Pressable onPress={finish} style={st.skipButton} accessibilityRole="button">
            <Text style={st.skip}>Oʻtkazib yuborish</Text>
          </Pressable>
        </View>
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
  splash: { flex: 1, backgroundColor: C.white, paddingHorizontal: 24 },
  main: { flex: 1, justifyContent: 'center', gap: 13 },
  hero: { height: 230, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  heroImage: { width: '100%', maxWidth: 330, height: 142, marginBottom: 6, position: 'relative' },
  logoBadge: { position: 'absolute', top: 3, right: 32, width: 50, height: 50, borderRadius: 25, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.white },
  brand: { fontFamily: F.dExtra, fontSize: 25, color: C.navy, letterSpacing: 1 },
  tag: { fontFamily: F.medium, fontSize: 13, color: C.mutedForeground, textAlign: 'center', marginTop: 2 },
  langTitle: { fontFamily: F.dBold, fontSize: 20, color: C.navy, marginTop: 6 },
  languages: { gap: 9 },
  lang: { minHeight: 54, paddingHorizontal: 17, borderRadius: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1 },
  langActive: { backgroundColor: C.navy, borderColor: C.navy },
  langInactive: { backgroundColor: C.surface, borderColor: C.border },
  langWords: { gap: 2 },
  langTxt: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  langTxtActive: { color: C.white },
  greeting: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  greetingActive: { color: C.lime },
  note: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, textAlign: 'center', marginTop: 1 },
  actions: { gap: 2 },
  skipButton: { alignSelf: 'center', padding: 10 },
  skip: { fontFamily: F.semibold, fontSize: 13, color: C.mutedForeground },
  topRow: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bar: { width: 34, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  card: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, gap: 12 },
  title: { fontFamily: F.dExtra, fontSize: 26, color: C.navy, lineHeight: 32 },
  text: { fontFamily: F.regular, fontSize: 15, color: C.mutedForeground, lineHeight: 22, marginBottom: 8 },
});
