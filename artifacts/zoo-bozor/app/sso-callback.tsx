import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '@/context/AuthContext';
import { C, F } from '@/constants/colors';
import { PillButton } from '@/components/FormKit';

export default function SSOCallback() {
  const { isSignedIn } = useSession();
  useEffect(() => { if (isSignedIn) router.replace('/'); }, [isSignedIn]);
  return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: C.white }}>
    <ActivityIndicator color={C.navy} />
    <Text style={{ fontFamily: F.dBold, fontSize: 18, color: C.navy, textAlign: 'center' }}>
      {Platform.OS === 'web' ? 'Bu eski kirish havolasi. Google orqali yangidan kiring.' : 'Google orqali kirish yakunlanmoqda...'}
    </Text>
    <PillButton label="Kirish sahifasiga" onPress={() => router.replace('/login')} />
  </View>;
}
