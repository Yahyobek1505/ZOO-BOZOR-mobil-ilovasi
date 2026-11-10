import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { router } from 'expo-router';
import { useSession } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { C, F } from '@/constants/colors';
import { PillButton } from '@/components/FormKit';

export default function SSOCallback() {
  const { isSignedIn, googleFlowError, setGoogleFlowError } = useSession();
  const { t } = useLocale();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), 9000);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (isSignedIn) {
      setGoogleFlowError('');
      router.replace('/');
    }
  }, [isSignedIn, setGoogleFlowError]);
  const canRetry = timedOut || !!googleFlowError || Platform.OS === 'web';
  return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: C.white }}>
    {!canRetry ? <ActivityIndicator color={C.navy} /> : null}
    <Text style={{ fontFamily: F.dBold, fontSize: 18, color: C.navy, textAlign: 'center' }}>
      {googleFlowError || (Platform.OS === 'web'
        ? 'Bu eski kirish havolasi. Google orqali yangidan kiring.'
        : timedOut ? 'Kirish hali yakunlanmadi.' : 'Hisobni tekshirish davom etyapti.')}
    </Text>
    {canRetry
      ? <PillButton label="Google orqali qaytadan kirish" onPress={() => { setGoogleFlowError(''); router.replace('/login'); }} />
      : null}
  </View>;
}
