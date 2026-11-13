import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';

export type PopupItem = { label: string; icon: React.ReactNode; onPress: () => void; testID?: string };

/** Figma dropdown (Xabarlar / chat 3-dot menus): white rounded card under the header's right edge. */
export function PopupMenu({ visible, top, items, onClose }: { visible: boolean; top: number; items: PopupItem[]; onClose: () => void }) {
  const { C } = useTheme();
  const st = useSt();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Yopish" />
      <View style={[st.card, { top }]} accessibilityRole="menu">
        {items.map((it) => (
          <Pressable
            key={it.label}
            onPress={() => { onClose(); it.onPress(); }}
            style={({ pressed }) => [st.item, pressed && { backgroundColor: C.secondary }]}
            accessibilityRole="menuitem"
            testID={it.testID}
          >
            <View style={st.icon}>{it.icon}</View>
            <Text style={st.label}>{it.label}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const useSt = makeStyles((C) => ({
  card: { position: 'absolute', right: 14, minWidth: 230, maxWidth: 300, backgroundColor: C.card, borderRadius: 20, paddingVertical: 8, borderWidth: C.dark ? 1 : 0, borderColor: C.border, shadowColor: C.navy, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, marginHorizontal: 4 },
  icon: { width: 26, alignItems: 'center' },
  label: { fontFamily: F.dBold, fontSize: 16, color: C.text, flexShrink: 1 },
}));
