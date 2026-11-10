import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { GoogleAuthProvider } from 'firebase/auth';
import { createGoogleHandoff } from '@workspace/api-client-react';
import { startGoogleSignIn } from '@/lib/google-sign-in';
import { authErrorText } from '@/hooks/useLogin';
import { C, F } from '@/constants/colors';
import { PillButton } from '@/components/FormKit';

/** System-browser page for native Firebase Google sign-in (including Expo Go). */
export default function GoogleAuthBridge() {
  const params = useLocalSearchParams<{ codeChallenge?: string; state?: string; returnUrl?: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = Platform.OS === 'web' && /^[a-f0-9]{64}$/.test(params.codeChallenge ?? '') && /^[a-f0-9]{64}$/.test(params.state ?? '') && !!params.returnUrl;
  const login = async () => {
    if (!valid || busy) return;
    setBusy(true); setError('');
    try {
      const result = await startGoogleSignIn();
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.idToken) throw new Error('Google tasdiqlash maʼlumoti kelmadi. Qayta urinib koʻring.');
      const response = await createGoogleHandoff({
        firebaseIdToken: await result.user.getIdToken(),
        googleIdToken: credential.idToken,
        codeChallenge: params.codeChallenge!,
        state: params.state!,
        returnUrl: params.returnUrl!,
      });
      // The return URI contains only an encrypted proof-bound credential.
      // No raw ID token is placed in browser history, a query string or logs.
      window.location.assign(response.returnUrl);
    } catch (cause) {
      setError(authErrorText(cause));
      setBusy(false);
    }
  };
  return <View style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 24, backgroundColor: C.white, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
    <Image source={require('@/assets/figma/login-illustration-2.png')} style={{ width: 260, height: 140, alignSelf: 'center' }} contentFit="contain" />
    <Text style={{ fontFamily: F.dExtra, fontSize: 23, textAlign: 'center', color: C.navy }}>ZOO-BOZOR’ga kirish</Text>
    <Text style={{ fontFamily: F.regular, fontSize: 14, lineHeight: 22, textAlign: 'center', color: C.navy }}>
      {valid ? 'Google hisobingizni brauzerda tasdiqlang. Keyin ilovaga qaytasiz.' : 'Kirishni ilovadagi Google tugmasidan boshlang.'}
    </Text>
    {error ? <Text accessibilityLiveRegion="assertive" style={{ color: C.destructive, fontFamily: F.medium }} testID="google-bridge-error">{error}</Text> : null}
    {valid ? <PillButton label={busy ? 'Kuting...' : 'Google orqali davom etish'} onPress={login} disabled={busy} testID="google-bridge-start" /> : null}
  </View>;
}
