import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text as NativeText, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { IMAGES } from '@/constants/data';
import { useOptionalApp } from '@/context/AppContext';
import { APP_LANGUAGES } from '@/constants/translations';
import { useLocale } from '@/context/LocaleContext';
import { BrandMark, Button, useBottomInset, useTopInset } from '@/components/ui';

const SLIDES = [
  {
    image: IMAGES.catHero,
    title: 'Uy hayvoningizni\nsuratga oling!',
    text: 'Hayvoningizni chiroyli va aniq suratga olib platformaga yuklang.',
    btn: 'Keyingi',
  },
  {
    image: IMAGES.marketBanner,
    title: 'Hayvoningiz haqida\nTo’liq va batafsil ma’lumot bering!',
    text: 'Zoti, yoshi, vazni va emlanganlik holatini koʻrsatib xaridorlar ishonchini qozoning.',
    btn: 'Keyingi',
  },
  {
    image: IMAGES.golden,
    title: 'Biz bilan Hayvonlaringizni mehrli\nqo’llarga topshiring!',
    text: 'Minglab mehrli insonlar orasidan yangi doʻst yoki ishonchli xaridor toping.',
    btn: 'Tayyor',
  },
];

export default function Welcome() {
  const { C } = useTheme();
  const st = useSt();
  const top = useTopInset();
  const bottom = useBottomInset();
  const app = useOptionalApp();
  const { language, setLanguage, completeOnboarding } = useLocale();
  const [step, setStep] = useState(0);

  const finish = () => {
    app?.setPrefs({ welcomed: true });
    completeOnboarding();
    if (router.canGoBack()) router.back();
    else router.replace('/' as never);
  };

  // Step 3 is the Language Selection Screen ("5-Til tanlash")
  if (step === 3) {
    return (
      <View style={[st.splash, { paddingTop: top + 10, paddingBottom: bottom + 16 }]}>
        <View style={st.main}>
          <View style={st.hero}>
            <Animated.View entering={FadeInUp.duration(400)} style={st.logoBadge}>
              <BrandMark size={44} color={C.text} />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={st.brand}>
              ZOO BOZOR
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(250).duration(400)} style={st.tag}>
              hayvonlar savdosi
            </Animated.Text>
          </View>

          <Animated.Text entering={FadeInUp.delay(350).duration(400)} style={st.langTitle}>
            Qulay tilni tanlang!
          </Animated.Text>

          <View style={st.languages}>
            {APP_LANGUAGES.map((option, index) => {
              const selected = language === option.id;
              return (
                <Animated.View key={option.id} entering={FadeInUp.delay(400 + index * 60).duration(350)}>
                  <Pressable
                    style={[st.lang, selected ? st.langActive : st.langInactive]}
                    onPress={() => {
                      setLanguage(option.id);
                      app?.setPrefs({ language: option.id });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    testID={`lang-${option.id}`}
                  >
                    <View style={st.langWords}>
                      <Text style={[st.langTxt, selected && st.langTxtActive]}>{option.name}</Text>
                      <NativeText style={[st.greeting, selected && st.greetingActive]}>{option.greeting}</NativeText>
                    </View>
                    <Feather
                      name={selected ? 'check-circle' : 'circle'}
                      size={22}
                      color={selected ? C.lime : C.mutedForeground}
                    />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <Text style={st.note}>Tilni keyin ham oʻzgartira olasiz!</Text>
        </View>

        <View style={st.actions}>
          <Button label="Davom etish" icon="arrow-right" onPress={finish} testID="welcome-continue" />
        </View>
      </View>
    );
  }

  const s = SLIDES[step];

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <Image source={s.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <View style={[st.topRow, { top: top + 10 }]}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[st.bar, i <= step && { backgroundColor: C.lime }]} />
          ))}
        </View>
        <Pressable onPress={() => setStep(3)} hitSlop={10}>
          <Text style={[st.skip, { color: C.white }]}>Oʻtkazish</Text>
        </Pressable>
      </View>

      <View style={[st.card, { paddingBottom: bottom + 24 }]}>
        <Text style={st.title}>{s.title}</Text>
        <Text style={st.text}>{s.text}</Text>
        <Button
          label={s.btn}
          icon={step === SLIDES.length - 1 ? 'check' : 'arrow-right'}
          onPress={() => setStep(step + 1)}
          testID="next"
        />
      </View>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  splash: { flex: 1, backgroundColor: C.dark ? C.surface : C.card, paddingHorizontal: 24 },
  main: { flex: 1, justifyContent: 'center', gap: 14 },
  hero: { alignItems: 'center', justifyContent: 'center', paddingBottom: 10 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: { fontFamily: F.dExtra, fontSize: 28, color: C.text, letterSpacing: 0.5 },
  tag: { fontFamily: F.dSemibold, fontSize: 15, color: C.text, letterSpacing: 1.4, marginTop: 2 },
  langTitle: { fontFamily: F.dExtra, fontSize: 20, color: C.text, marginTop: 12, textAlign: 'center' },
  languages: { gap: 10, marginTop: 6 },
  lang: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  langActive: { backgroundColor: C.navy, borderColor: C.dark ? C.lime : C.navy },
  langInactive: { backgroundColor: C.dark ? C.secondary : C.surface, borderColor: C.border },
  langWords: { gap: 2 },
  langTxt: { fontFamily: F.dBold, fontSize: 16, color: C.text },
  langTxtActive: { color: C.white },
  greeting: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  greetingActive: { color: C.lime },
  note: { fontFamily: F.dMedium, fontSize: 13, color: C.mutedDark, textAlign: 'center', marginTop: 4 },
  actions: { gap: 4, marginTop: 8 },
  skip: { fontFamily: F.semibold, fontSize: 13, color: C.mutedForeground },
  topRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bar: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    gap: 12,
  },
  title: { fontFamily: F.dExtra, fontSize: 24, color: C.text, lineHeight: 30 },
  text: { fontFamily: F.dMedium, fontSize: 14, color: C.mutedDark, lineHeight: 21, marginBottom: 8 },
}));
