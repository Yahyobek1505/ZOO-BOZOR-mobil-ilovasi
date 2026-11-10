import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import Animated, { cancelAnimation, Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AuthProvider, useSession } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/context/AppContext';
import { C } from '@/constants/colors';
import { AppAlertHost } from '@/components/AppAlert';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { APP_LANGUAGES } from '@/constants/translations';
import { F } from '@/constants/colors';
import Welcome from '@/app/welcome';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AccountScopedApp({ children }: { children: React.ReactNode }) {
  const { accountId, user, loading, error, retry, signOut, isSignedIn } = useSession();
  const bridge = usePathname() === '/google-auth';
  const pathname = usePathname();
  const { onboardingComplete } = useLocale();
  useEffect(() => {
    queryClient.clear();
  }, [accountId]);
  if (!bridge && loading) {
    const isInitialHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    if (isInitialHome && !onboardingComplete) return <Welcome />;
    return <BootSplash />;
  }
  if (!bridge && error) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20, backgroundColor: C.white }}>
      {loading ? <ActivityIndicator color={C.navy} /> : <>
        <Text style={{ textAlign: 'center', color: C.navy }}>{error}</Text>
        <Pressable onPress={retry} accessibilityRole="button"><Text>Qayta urinish</Text></Pressable>
        <Pressable onPress={() => { void signOut().catch(() => Alert.alert('Hisobdan chiqib boʻlmadi', 'Qayta urinib koʻring.')); }} accessibilityRole="button"><Text>Hisobdan chiqish</Text></Pressable>
      </>}
    </View>
  );
  return (
    <AppProvider
      key={bridge ? 'google-bridge' : accountId ?? 'guest'}
      storageKey={!bridge && accountId ? `zoo-bozor/account/${accountId}/v1` : undefined}
      initialProfile={!bridge && isSignedIn && user ? {
        name: user.displayName || '',
        email: user.email || '',
        avatar: user.photoURL || '',
      } : undefined}
    >
      {children}
    </AppProvider>
  );
}

function RootLayoutNav() {
  const { prefs, ready } = useApp();
  const { ready: localeReady, onboardingComplete, completeOnboarding } = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready || !localeReady) return;
    if (prefs.welcomed && !onboardingComplete) completeOnboarding();
    if (!prefs.welcomed && !onboardingComplete && pathname !== '/welcome' && pathname !== '/login'
      && pathname !== '/google-auth' && pathname !== '/sso-callback') {
      router.replace('/welcome');
    }
  }, [ready, localeReady, prefs.welcomed, onboardingComplete, completeOnboarding, pathname]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.surface } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="listing/edit" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="story/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="welcome" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="sso-callback" />
      <Stack.Screen name="google-auth" />
    </Stack>
  );
}

function BootSplash() {
  const { language } = useLocale();
  const turn = useSharedValue(0);
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  const greeting = APP_LANGUAGES.find((item) => item.id === language)?.greeting ?? 'Salom';

  useEffect(() => {
    turn.value = withRepeat(withTiming(360, { duration: 1050, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(turn);
  }, [turn]);

  return (
    <View style={bootStyles.page}>
      <Animated.View>
        <Animated.View style={logoStyle}>
          <Image source={require('@/assets/images/icon.png')} style={bootStyles.logo} accessibilityLabel="ZOO-BOZOR" />
        </Animated.View>
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(760).duration(440)} style={bootStyles.brand}>ZOO BOZOR</Animated.Text>
      <Animated.Text entering={FadeInDown.delay(920).duration(440)} style={bootStyles.greeting}>{greeting}</Animated.Text>
    </View>
  );
}

const bootStyles = StyleSheet.create({
  page: { flex: 1, minHeight: '100%', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo: { width: 104, height: 104, borderRadius: 28 },
  brand: { fontFamily: F.dExtra, fontSize: 27, color: '#080D28', letterSpacing: 0.8 },
  greeting: { fontFamily: F.medium, fontSize: 16, color: '#626a7b' },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => { void SplashScreen.hideAsync(); }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <LocaleProvider>
          <BootSplash />
        </LocaleProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LocaleProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AccountScopedApp>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <StatusBar style="auto" />
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AccountScopedApp>
            <AppAlertHost />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
