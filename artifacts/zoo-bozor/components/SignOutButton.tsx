import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export function SignOutButton() {
  const { C } = useTheme();
  const st = useSt();
  const { signOut } = useSession();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const close = () => { if (!busy) { setOpen(false); setError(''); } };
  const confirm = async () => {
    setBusy(true); setError('');
    try {
      await signOut();
      router.replace('/');
    } catch {
      setError('Hisobdan chiqib boʻlmadi. Internetni tekshirib, qayta urinib koʻring.');
    } finally {
      setBusy(false);
    }
  };
  return <>
    <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [st.row, pressed && { opacity: 0.85 }]} accessibilityRole="button" testID="sign-out">
      <Feather name="log-out" size={20} color={C.white} />
      <Text style={st.link}>Profildan chiqish</Text>
      <Feather name="chevron-right" size={18} color={C.white} />
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={st.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Bekor qilish" />
        <View style={st.dialog}>
          <View style={st.icon}><Feather name="log-out" size={30} color={C.text} /></View>
          <Text style={st.title}>Chiqishni tasdiqlaysizmi?</Text>
          <Text style={st.text}>Qayta kirish uchun email yoki Google hisobingiz kerak boʻladi. Saqlangan eʼlonlaringiz oʻchirilmaydi.</Text>
          {error ? <Text style={[st.text, { color: C.destructive }]} accessibilityLiveRegion="assertive">{error}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={close} disabled={busy} style={st.cancel} accessibilityRole="button" testID="cancel-sign-out">
              <Text style={st.cancelText}>Bekor qilish</Text>
            </Pressable>
            <Pressable onPress={confirm} disabled={busy} style={st.confirm} accessibilityRole="button" testID="confirm-sign-out">
              <Text style={st.confirmText}>{busy ? 'Kuting...' : 'Chiqish'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

const useSt = makeStyles((C) => ({
  // Figma "Profildan chiqish": 362×53 red (#ff1810) bar, radius 20, white label and chevron.
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 53, paddingHorizontal: 19, marginTop: 11, marginHorizontal: 6, borderRadius: 20, backgroundColor: C.destructive },
  link: { flex: 1, fontFamily: F.dBold, color: C.white, fontSize: 15 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.dark ? 'rgba(8,13,32,0.6)' : 'rgba(255,255,255,0.55)', padding: 24, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as object,
  dialog: { width: '100%', maxWidth: 380, padding: 22, gap: 18, backgroundColor: C.card, borderRadius: 26, borderWidth: 1, borderColor: C.dark ? C.border : '#d9d9d9', shadowColor: C.navy, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 },
  icon: { alignSelf: 'center', backgroundColor: C.secondary, padding: 16, borderRadius: 40 },
  title: { fontFamily: F.dExtra, fontSize: 20, textAlign: 'center', color: C.text },
  text: { fontFamily: F.regular, fontSize: 13, lineHeight: 20, textAlign: 'center', color: C.mutedForeground },
  cancel: { flex: 1, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  cancelText: { fontFamily: F.dBold, fontSize: 16, color: C.ink },
  confirm: { flex: 1, borderRadius: 10, backgroundColor: C.destructive, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  confirmText: { fontFamily: F.dBold, fontSize: 16, color: C.white },
}));
