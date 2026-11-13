import React, { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { APP_MAX_WIDTH, ScreenWidthContext } from '@/hooks/useScreen';
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
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/context/AppContext';
import { Alert, AppAlertHost } from '@/components/AppAlert';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { APP_LANGUAGES } from '@/constants/translations';
import { F } from '@/constants/colors';
import { ThemeProvider, makeStyles, useTheme } from '@/context/ThemeContext';
import { BrandMark, Button } from '@/components/ui';
import Welcome from '@/app/welcome';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AccountScopedApp({ children }: { children: React.ReactNode }) {
  const { C } = useTheme();
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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16, backgroundColor: C.surface }}>
      {loading ? <ActivityIndicator color={C.text} /> : <>
        <BrandMark size={56} color={C.text} />
        <Text style={{ fontFamily: F.dExtra, fontSize: 20, textAlign: 'center', color: C.text }}>Kirish yakunlanmadi</Text>
        <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, textAlign: 'center', color: C.mutedDark, maxWidth: 340 }}>{error}</Text>
        <Button label="Qayta urinish" icon="refresh-cw" onPress={retry} style={{ alignSelf: 'stretch', maxWidth: 340, width: '100%' }} testID="account-retry" />
        <Pressable onPress={() => { void signOut().catch(() => Alert.alert('Hisobdan chiqib boʻlmadi', 'Qayta urinib koʻring.')); }} accessibilityRole="button" hitSlop={8} testID="account-sign-out">
          <Text style={{ fontFamily: F.dBold, fontSize: 14, color: C.text, textDecorationLine: 'underline' }}>Hisobdan chiqish</Text>
        </Pressable>
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
  const { C } = useTheme();
  const { prefs, ready } = useApp();
  const { ready: localeReady, onboardingComplete, completeOnboarding } = useLocale();
  const { isSignedIn, takePostLoginRoute } = useSession();
  const pathname = usePathname();

  // Signing in swaps to the account's own storage, which remounts this navigator.
  // Continue to the screen the login was started for (the profile by default).
  useEffect(() => {
    if (!isSignedIn || !ready) return;
    const route = takePostLoginRoute();
    if (route && route !== pathname) router.replace(route as never);
  }, [isSignedIn, ready, takePostLoginRoute, pathname]);

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
      <Stack.Screen name="auction" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="seller/[id]" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="my-listings" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="sso-callback" />
      <Stack.Screen name="google-auth" />
    </Stack>
  );
}

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}

function BootSplash() {
  const { C } = useTheme();
  const bootStyles = useBootStyles();
  const turn = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));

  useEffect(() => {
    turn.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(turn);
  }, [turn]);

  return (
    <View style={bootStyles.page}>
      <View style={bootStyles.center}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <BrandMark size={76} color={C.text} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={bootStyles.brand}>
          ZOO BOZOR
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350).duration(400)} style={bootStyles.tagline}>
          hayvonlar savdosi
        </Animated.Text>
      </View>

      <View style={bootStyles.loaderContainer}>
        <Animated.View style={[bootStyles.spinner, spinStyle]}>
          <View style={bootStyles.spinnerArc} />
        </Animated.View>
      </View>
    </View>
  );
}

const useBootStyles = makeStyles((C) => ({
  page: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: C.dark ? C.surface : C.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: F.dExtra,
    fontSize: 30,
    color: C.text,
    letterSpacing: 0.5,
    marginTop: 12,
  },
  tagline: {
    fontFamily: F.dSemibold,
    fontSize: 16,
    color: C.text,
    letterSpacing: 1.6,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3.5,
    borderColor: C.border,
    borderTopColor: C.lime,
    borderRightColor: C.text,
  },
  spinnerArc: {
    width: '100%',
    height: '100%',
  },
}));

/**
 * The app is phone-first. On the web it is shown in a centred phone-width column so
 * wide browser windows never stretch the layout; native apps use the full screen.
 */
// Phone apps never show scrollbars; browsers draw them even when React Native's
// show*ScrollIndicator={false} is set. Hide them everywhere (scrolling still works).
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('zoo-hide-scrollbars')) {
  const style = document.createElement('style');
  style.id = 'zoo-hide-scrollbars';
  // !important: device-simulator pages and some browser themes inject their own scrollbar styles.
  style.textContent = '*{scrollbar-width:none!important;-ms-overflow-style:none!important}*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}';
  document.head.appendChild(style);
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  // Layouts size themselves from the column the app is really drawn in, not the window:
  // desktop scrollbars, page zoom and emulators can make the window wider than the column.
  const column = useRef<React.ComponentRef<typeof View>>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = column.current as unknown as HTMLElement | null;
    if (!node) return;
    const measure = () => {
      const next = Math.floor(node.getBoundingClientRect().width);
      if (next > 0) setWidth((old) => (old === next ? old : next));
    };
    measure();
    // react-native-web's onLayout does not fire when only the parent's size changes.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const frameStyles = useFrameStyles();
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={frameStyles.shell}>
      <View ref={column} style={frameStyles.column}>
        <ScreenWidthContext.Provider value={width}>{children}</ScreenWidthContext.Provider>
      </View>
    </View>
  );
}

const useFrameStyles = makeStyles((C) => ({
  shell: { flex: 1, alignItems: 'center', backgroundColor: C.dark ? '#03050d' : '#e3e5ec' },
  column: { flex: 1, width: '100%', maxWidth: APP_MAX_WIDTH, overflow: 'hidden', backgroundColor: C.surface, shadowColor: '#080d20', shadowOpacity: 0.12, shadowRadius: 24 },
}));

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => { void SplashScreen.hideAsync(); }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
        <PhoneFrame>
          <LocaleProvider>
            <BootSplash />
          </LocaleProvider>
        </PhoneFrame>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
      <PhoneFrame>
      <LocaleProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AccountScopedApp>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <ThemedStatusBar />
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AccountScopedApp>
            <AppAlertHost />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
      </LocaleProvider>
      </PhoneFrame>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
