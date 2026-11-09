import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { AuthProvider, useSession } from '@/context/AuthContext';
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
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/context/AppContext';
import { C } from '@/constants/colors';
import { AppAlertHost } from '@/components/AppAlert';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AccountScopedApp({ children }: { children: React.ReactNode }) {
  const { accountId, user, loading, error, retry, signOut, isSignedIn } = useSession();
  const bridge = usePathname() === '/google-auth';
  useEffect(() => {
    queryClient.clear();
  }, [accountId]);
  if (!bridge && (loading || error)) return (
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
