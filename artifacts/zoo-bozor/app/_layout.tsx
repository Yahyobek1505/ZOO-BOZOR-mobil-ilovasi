import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkLoaded, ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/context/AppContext';
import { C } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const proxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined;

function AccountScopedApp({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { user } = useUser();
  useEffect(() => {
    queryClient.clear();
  }, [userId]);
  return (
    <AppProvider
      key={userId ?? 'guest'}
      storageKey={userId ? `zoo-bozor/account/${userId}/v1` : undefined}
      initialProfile={user ? {
        name: user.fullName || user.firstName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        avatar: user.hasImage ? user.imageUrl : '',
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
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} proxyUrl={proxyUrl}>
    <ClerkLoaded>
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AccountScopedApp>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <StatusBar style="auto" />
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AccountScopedApp>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
    </ClerkLoaded>
    </ClerkProvider>
  );
}
