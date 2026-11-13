import React, { useSyncExternalStore } from 'react';
import { type AlertButton, type AlertOptions, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Text } from '@/components/LocalizedText';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';

type Dialog = { title: string; message?: string; buttons: AlertButton[]; options?: AlertOptions };
let dialogs: Dialog[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const snapshot = () => dialogs;
const empty: Dialog[] = [];

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
    dialogs = [...dialogs, { title, message, buttons: buttons?.length ? buttons : [{ text: 'Tushunarli' }], options }];
    emit();
  },
};

export function AppAlertHost() {
  const { C } = useTheme();
  const styles = useStyles();
  const queue = useSyncExternalStore(subscribe, snapshot, () => empty);
  const dialog = queue[0];
  if (!dialog) return null;

  const dismiss = () => {
    dialogs = dialogs.slice(1);
    emit();
  };

  const isTwoButtons = dialog.buttons.length === 2;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      accessibilityViewIsModal
      onRequestClose={() => {
        if (dialog.options?.cancelable === false) return;
        dismiss();
        dialog.options?.onDismiss?.();
      }}
    >
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (dialog.options?.cancelable === false) return;
            dismiss();
            dialog.options?.onDismiss?.();
          }}
          accessibilityLabel="Yopish"
        />
        <Animated.View entering={FadeInUp.duration(280)} style={styles.card} accessibilityRole="alert">
          <View style={styles.grab} />
          <Text style={styles.title}>{dialog.title}</Text>
          {dialog.message ? <Text style={styles.message}>{dialog.message}</Text> : null}
          <View style={[styles.actions, isTwoButtons && styles.rowActions]}>
            {dialog.buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              const isPrimary = !isDestructive && !isCancel;

              const bg = isDestructive ? C.destructive : isCancel ? C.secondary : C.lime;
              const textCol = isDestructive ? C.white : isCancel ? C.text : C.ink;

              return (
                <Pressable
                  key={index}
                  accessibilityRole="button"
                  accessibilityLabel={button.text}
                  testID={`alert-action-${index}`}
                  onPress={() => {
                    dismiss();
                    button.onPress?.();
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    isTwoButtons && { flex: 1 },
                    { backgroundColor: bg },
                    isCancel && { borderWidth: 1, borderColor: C.border },
                    pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text style={[styles.label, { color: textCol }]}>{button.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const useStyles = makeStyles((C) => ({
  backdrop: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: C.dark ? C.border : 'rgba(8,13,32,0.06)',
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  grab: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: F.dExtra,
    fontSize: 20,
    color: C.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: F.dMedium,
    fontSize: 14.5,
    lineHeight: 22,
    color: C.mutedDark,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
  rowActions: {
    flexDirection: 'row',
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: F.dBold,
    fontSize: 15,
  },
}));
