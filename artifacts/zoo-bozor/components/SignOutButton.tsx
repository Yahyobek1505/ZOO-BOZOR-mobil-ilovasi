import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { PillButton } from './FormKit';

export function SignOutButton() {
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
    <Pressable onPress={() => setOpen(true)} style={st.row} accessibilityRole="button" testID="sign-out">
      <Feather name="log-out" size={20} color={C.destructive} />
      <Text style={st.link}>Hisobdan chiqish</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={st.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Bekor qilish" />
        <View style={st.dialog}>
          <View style={st.icon}><Feather name="log-out" size={30} color={C.navy} /></View>
          <Text style={st.title}>Chiqishni tasdiqlaysizmi?</Text>
          <Text style={st.text}>Qayta kirish uchun email yoki Google hisobingiz kerak boʻladi. Saqlangan eʼlonlaringiz oʻchirilmaydi.</Text>
          {error ? <Text style={[st.text, { color: C.destructive }]} accessibilityLiveRegion="assertive">{error}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <PillButton label="Bekor qilish" onPress={close} variant="outline" icon={null} disabled={busy} flex />
            <Pressable onPress={confirm} disabled={busy} style={st.confirm} accessibilityRole="button" testID="confirm-sign-out">
              <Text style={st.confirmText}>{busy ? 'Kuting...' : 'Chiqish'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, marginTop: 12, borderRadius: 16, backgroundColor: '#fff0f0' },
  link: { fontFamily: F.bold, color: C.destructive, fontSize: 14 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,13,32,0.4)', padding: 24 },
  dialog: { width: '100%', maxWidth: 380, padding: 22, gap: 20, backgroundColor: C.white, borderRadius: 26 },
  icon: { alignSelf: 'center', backgroundColor: C.surface, padding: 16, borderRadius: 40 },
  title: { fontFamily: F.dExtra, fontSize: 20, textAlign: 'center', color: C.navy },
  text: { fontFamily: F.regular, fontSize: 13, lineHeight: 20, textAlign: 'center', color: C.mutedForeground },
  confirm: { flex: 1, borderRadius: 18, backgroundColor: C.destructive, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  confirmText: { fontFamily: F.bold, fontSize: 16, color: C.white },
});
