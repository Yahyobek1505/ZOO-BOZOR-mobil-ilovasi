import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text as NativeText, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_LANGUAGES, translate, type AppLanguage } from "@/constants/translations";

const LANGUAGE_KEY = "zoo-bozor/language/v1";
const ONBOARDING_KEY = "zoo-bozor/onboarding/v1";
const LocaleContext = createContext<{
  language: AppLanguage;
  t: (value: string) => string;
  ready: boolean;
  completeOnboarding: () => void;
  onboardingComplete: boolean;
  setLanguage: (language: AppLanguage) => void;
} | null>(null);

function isLanguage(value: unknown): value is AppLanguage {
  return value === "uz" || value === "ru" || value === "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<AppLanguage>("uz");
  const languageRef = useRef<AppLanguage>("uz");
  const [onboardingComplete, updateOnboarding] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    Promise.all([
      AsyncStorage.getItem(LANGUAGE_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem("zoo-bozor/state/v1"),
    ]).then(([savedLanguage, savedOnboarding, oldGuestState]) => {
      if (!active) return;
      if (isLanguage(savedLanguage)) {
        languageRef.current = savedLanguage;
        updateLanguage(savedLanguage);
      }
      else if (oldGuestState) {
        const prefs = (JSON.parse(oldGuestState) as { prefs?: { language?: string; welcomed?: boolean } }).prefs;
        if (prefs?.language === "ru" || prefs?.language === "en") {
          languageRef.current = prefs.language;
          updateLanguage(prefs.language);
        }
        if (prefs?.welcomed === true) updateOnboarding(true);
      }
      if (savedOnboarding === "complete") updateOnboarding(true);
      setReady(true);
    }).catch(() => {
      if (active) { setLoadError(true); setReady(false); }
    });
    return () => { active = false; };
  }, [attempt]);

  const setLanguage = useCallback((next: AppLanguage) => {
    const previous = languageRef.current;
    languageRef.current = next;
    updateLanguage(next);
    void AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {
      if (languageRef.current === next) {
        languageRef.current = previous;
        updateLanguage(previous);
      }
      Alert.alert(
        translate("Til tanlovi saqlanmadi", next),
        translate("Xotira joyini tekshirib, tilni qayta tanlang.", next),
      );
    });
  }, [language]);

  const completeOnboarding = useCallback(() => {
    updateOnboarding(true);
    void AsyncStorage.setItem(ONBOARDING_KEY, "complete").catch(() => {
      updateOnboarding(false);
      Alert.alert(
        translate("Sozlama saqlanmadi", language),
        translate("Ilova tanishtiruvini saqlab boʻlmadi. Qayta urinib koʻring.", language),
      );
    });
  }, [language]);

  const value = useMemo(() => ({
    language, t: (source: string) => translate(source, language),
    ready, completeOnboarding, onboardingComplete, setLanguage,
  }), [language, ready, completeOnboarding, onboardingComplete, setLanguage]);

  if (loadError) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 }}>
      <NativeText>Til sozlamalarini oʻqib boʻlmadi. Ular oʻchirilmagan.</NativeText>
      <Pressable onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button">
        <NativeText>Qayta urinish</NativeText>
      </Pressable>
    </View>
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) return {
    language: "uz" as const,
    ready: false,
    onboardingComplete: false,
    completeOnboarding: () => {},
    setLanguage: (_language: AppLanguage) => {},
    t: (source: string) => source,
  };
  return context;
}

export { APP_LANGUAGES };
