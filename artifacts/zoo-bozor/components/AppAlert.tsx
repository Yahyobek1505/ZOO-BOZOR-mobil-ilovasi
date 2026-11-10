import React, { useSyncExternalStore } from 'react';
import { Alert as NativeAlert, type AlertButton, type AlertOptions, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { C, F } from '@/constants/colors';

type Dialog = { title: string; message?: string; buttons: AlertButton[]; options?: AlertOptions };
let dialogs: Dialog[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => dialogs;
const empty: Dialog[] = [];

// React Native Web's Alert.alert is a no-op. Listing confirmations and draft
// recovery need real, selectable actions on web, not just informational text.
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
    if (Platform.OS !== 'web') { NativeAlert.alert(title, message, buttons, options); return; }
    dialogs = [...dialogs, { title, message, buttons: buttons?.length ? buttons : [{ text: 'Tushunarli' }], options }];
    emit();
  },
};

export function AppAlertHost() {
  const queue = useSyncExternalStore(subscribe, snapshot, () => empty);
  const dialog = queue[0];
  if (Platform.OS !== 'web' || !dialog) return null;
  const dismiss = () => {
    dialogs = dialogs.slice(1);
    emit();
  };
  return (
    <Modal visible transparent animationType="fade" accessibilityViewIsModal onRequestClose={() => {
      if (dialog.options?.cancelable === false) return;
      dismiss();
      dialog.options?.onDismiss?.();
    }}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{dialog.title}</Text>
          {dialog.message ? <Text style={styles.message}>{dialog.message}</Text> : null}
          <View style={styles.actions}>
            {dialog.buttons.map((button, index) => (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={button.text}
                testID={`alert-action-${index}`}
                onPress={() => { dismiss(); button.onPress?.(); }}
                style={[styles.button, { backgroundColor: button.style === 'destructive' ? C.destructive : button.style === 'cancel' ? C.secondary : C.navy }]}
              >
                <Text style={[styles.label, { color: button.style === 'cancel' ? C.navy : C.white }]}>{button.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, backgroundColor: C.white, borderRadius: 20, padding: 22, gap: 16 },
  title: { fontFamily: F.bold, fontSize: 20, color: C.navy },
  message: { fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.navy },
  actions: { gap: 10 },
  button: { minHeight: 46, padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  label: { fontFamily: F.bold, fontSize: 15 },
});
