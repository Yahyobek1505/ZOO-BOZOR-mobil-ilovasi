import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { router } from 'expo-router';
import { useSession } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { PillButton } from '@/components/FormKit';

export default function SSOCallback() {
  const { C } = useTheme();
  const { isSignedIn, googleFlowError, setGoogleFlowError, takePostLoginRoute } = useSession();
  const { t } = useLocale();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), 9000);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (isSignedIn) {
      setGoogleFlowError('');
      router.replace((takePostLoginRoute() ?? '/profile') as never);
    }
  }, [isSignedIn, setGoogleFlowError, takePostLoginRoute]);
  const canRetry = timedOut || !!googleFlowError || Platform.OS === 'web';
  return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: C.dark ? C.surface : C.card }}>
    {!canRetry ? <ActivityIndicator color={C.text} /> : null}
    <Text style={{ fontFamily: F.dBold, fontSize: 18, color: C.text, textAlign: 'center' }}>
      {googleFlowError || (Platform.OS === 'web'
        ? 'Bu eski kirish havolasi. Google orqali yangidan kiring.'
        : timedOut ? 'Kirish hali yakunlanmadi.' : 'Hisobni tekshirish davom etyapti.')}
    </Text>
    {canRetry
      ? <PillButton label="Google orqali qaytadan kirish" onPress={() => { setGoogleFlowError(''); router.replace('/login'); }} />
      : null}
  </View>;
}
