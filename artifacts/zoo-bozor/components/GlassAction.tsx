import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';

/** Translucent bottom action from the Figma detail screens (navy 20%, white 50% border, glass blur). */
export function GlassAction({ label, icon, onPress, testID, small }: { label: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; testID: string; small?: boolean }) {
  const { C } = useTheme();
  const st = useSt();
  return (
    <Pressable onPress={onPress} testID={testID} accessibilityRole="button" style={({ pressed }) => [st.btn, small && { gap: 5 }, pressed && { opacity: 0.85 }]}>
      {Platform.OS === 'web'
        ? <View style={[StyleSheet.absoluteFill, st.web]} />
        : <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
      <Feather name={icon} size={small ? 16 : 18} color={C.white} />
      <Text style={[st.txt, small && { fontSize: 12.5 }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const useSt = makeStyles((C) => ({
  btn: { flex: 1, height: 43, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(8,13,32,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  web: { backgroundColor: 'rgba(8,13,32,0.35)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as object,
  txt: { fontFamily: F.dBold, fontSize: 14, color: C.white },
}));
