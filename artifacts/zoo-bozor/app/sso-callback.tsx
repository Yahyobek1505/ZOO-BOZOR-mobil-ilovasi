import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useClerk } from '@clerk/expo';
import { C, F } from '@/constants/colors';
import { PillButton } from '@/components/FormKit';

export default function SSOCallback() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;
    if (Platform.OS !== 'web') {
      router.replace((isSignedIn ? '/' : '/login') as never);
      return;
    }
    clerk
      .handleRedirectCallback(
        { signInFallbackRedirectUrl: '/', signUpFallbackRedirectUrl: '/', continueSignUpUrl: '/login' },
        async (to: string) => { router.replace((to.startsWith('http') ? new URL(to).pathname || '/' : to) as never); },
      )
      .catch((e: unknown) => {
        const x = e as { errors?: { longMessage?: string; message?: string }[]; message?: string };
        setError(x?.errors?.[0]?.longMessage ?? x?.errors?.[0]?.message ?? x?.message ?? 'Google orqali kirish yakunlanmadi.');
      });
  }, [isLoaded, isSignedIn, clerk]);

  return (
    <View style={st.root}>
      {error ? (
        <>
          <Text style={st.title}>Kirish yakunlanmadi</Text>
          <Text style={st.err} testID="sso-error">{error}</Text>
          <PillButton label="Qaytadan urinish" onPress={() => router.replace('/login' as never)} testID="sso-retry" />
        </>
      ) : (
        <>
          <ActivityIndicator color={C.navy} />
          <Text style={st.title}>Google orqali kirilmoqda...</Text>
        </>
      )}
      <View nativeID="clerk-captcha" />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white, alignItems: 'stretch', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontFamily: F.dExtra, fontSize: 20, color: C.navy, textAlign: 'center' },
  err: { fontFamily: F.medium, fontSize: 14, color: C.destructive, textAlign: 'center' },
});
