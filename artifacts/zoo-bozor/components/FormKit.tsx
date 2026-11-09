import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { useBottomInset, useTopInset } from '@/components/ui';

/** Navy curved-bottom header used by Figma posting/editing screens. */
export function CurvedHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  const top = useTopInset();
  return (
    <View style={[k.header, { paddingTop: top + 14 }]}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Orqaga" testID="header-back" style={k.side}>
        <Feather name="chevron-left" size={26} color={C.white} />
      </Pressable>
      <Text style={k.title} numberOfLines={1}>{title}</Text>
      <View style={[k.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function HeaderAction({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label} testID={testID}>
      <Text style={k.action}>{label}</Text>
    </Pressable>
  );
}

export function StepDots({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={k.dots} accessibilityLabel={`${step + 1}-qadam, jami ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <View style={[k.line, i <= step && { backgroundColor: C.lime }]} /> : null}
          <View style={[k.dot, i <= step && { backgroundColor: C.lime }, i === step && k.dotNow]}>
            <View style={k.dotCore} />
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

export function Label({ text, required }: { text: string; required?: boolean }) {
  return <Text style={k.label}>{text}{required ? ' *' : ''}</Text>;
}

export function Hint({ text, error }: { text?: string; error?: string }) {
  if (error) return <Text style={k.err}>{error}</Text>;
  return text ? <Text style={k.hint}>{text}</Text> : null;
}

export type Option = { value: string; label: string };

/** Pill select that opens a bottom sheet of options. */
export function Select({ label, required, value, options, onChange, placeholder = 'Tanlang', error, hint, testID, center }: {
  label?: string; required?: boolean; value: string; options: Option[]; onChange: (v: string) => void;
  placeholder?: string; error?: string; hint?: string; testID?: string; center?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const bottom = useBottomInset();
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ gap: 6, flex: 1 }}>
      {label ? <Label text={label} required={required} /> : null}
      <Pressable
        onPress={Platform.OS === 'web' ? undefined : () => setOpen(true)}
        style={[k.select, error ? { borderColor: C.destructive } : null]}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? placeholder}: ${current?.label ?? 'tanlanmagan'}`}
        testID={testID}
      >
        <Text style={[k.selectTxt, !current && { color: C.mutedForeground }, center && { textAlign: 'center' }]} numberOfLines={1}>
          {current?.label ?? placeholder}
        </Text>
        <View style={k.chev}><Feather name="chevron-down" size={16} color={C.navy} /></View>
        {Platform.OS === 'web' ? (
          <select
            aria-label={label ?? placeholder}
            data-testid={testID ? `${testID}-input` : undefined}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', fontSize: 16 }}
          >
            {!options.some((option) => option.value === '') ? <option value="" disabled>{placeholder}</option> : null}
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : null}
      </Pressable>
      <Hint text={hint} error={error} />
      {Platform.OS !== 'web' ? <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={k.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Yopish" />
        <View style={[k.sheet, { paddingBottom: bottom + 16 }]}>
          <View style={k.grab} />
          <Text style={k.sheetTitle}>{label ?? placeholder}</Text>
          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 6 }}>
            {options.map((o) => {
              const on = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => { onChange(o.value); setOpen(false); }}
                  style={[k.opt, on && { backgroundColor: C.lime }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  testID={testID ? `${testID}-${o.value}` : undefined}
                >
                  <Text style={k.optTxt}>{o.label}</Text>
                  {on ? <Feather name="check" size={18} color={C.navy} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal> : null}
    </View>
  );
}

/** Large rounded toggle tile, lime when active (Figma gender / delivery tiles). */
export function Tile({ label, icon, active, onPress, testID }: {
  label: string; icon?: keyof typeof Feather.glyphMap; active: boolean; onPress: () => void; testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[k.tile, active ? { backgroundColor: C.lime, borderColor: C.lime } : null]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      testID={testID}
    >
      {icon ? <Feather name={icon} size={18} color={C.navy} /> : null}
      <Text style={k.tileTxt}>{label}</Text>
    </Pressable>
  );
}

export function PillButton({ label, onPress, variant = 'navy', icon = 'arrow-right', disabled, testID, flex }: {
  label: string; onPress: () => void; variant?: 'navy' | 'outline' | 'green'; icon?: keyof typeof Feather.glyphMap | null;
  disabled?: boolean; testID?: string; flex?: boolean;
}) {
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        k.pill,
        variant === 'green' && { backgroundColor: '#3a9b22' },
        outline && { backgroundColor: C.white, borderWidth: 1, borderColor: '#cfd2da' },
        flex && { flex: 1 },
        (pressed || disabled) && { opacity: disabled ? 0.5 : 0.85, transform: [{ scale: 0.985 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
    >
      {outline && icon ? <View style={[k.pillIcon, { backgroundColor: '#6b6f7a' }]}><Feather name={icon} size={13} color={C.white} /></View> : null}
      <Text style={[k.pillTxt, outline && { color: C.navy }]}>{label}</Text>
      {!outline && icon ? <View style={[k.pillIcon, variant === 'green' && { backgroundColor: C.white }]}><Feather name={icon} size={13} color={variant === 'green' ? '#3a9b22' : C.navy} /></View> : null}
    </Pressable>
  );
}

export const kit = StyleSheet.create({
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#d9dce3', backgroundColor: C.white, paddingHorizontal: 16, fontFamily: F.semibold, fontSize: 15, color: C.navy },
});

const k = StyleSheet.create({
  header: { backgroundColor: C.navy, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, paddingHorizontal: 20, paddingBottom: 22, flexDirection: 'row', alignItems: 'center' },
  side: { width: 80 },
  title: { flex: 1, textAlign: 'center', fontFamily: F.dBold, fontSize: 17, color: C.white },
  action: { fontFamily: F.dBold, fontSize: 15, color: C.lime },
  dots: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 12 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#dcdde2', alignItems: 'center', justifyContent: 'center' },
  dotNow: { width: 20, height: 20, borderRadius: 10 },
  dotCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.navy },
  line: { width: 54, height: 4, backgroundColor: '#dcdde2' },
  label: { fontFamily: F.dBold, fontSize: 13, color: C.navy },
  hint: { fontFamily: F.regular, fontSize: 11, color: '#a4a8b3' },
  err: { fontFamily: F.medium, fontSize: 12, color: C.destructive },
  select: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#d9dce3', backgroundColor: C.white, paddingLeft: 18, paddingRight: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectTxt: { flex: 1, fontFamily: F.dBold, fontSize: 15, color: C.navy },
  chev: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: C.overlay },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, gap: 12, ...(Platform.OS === 'web' ? { paddingBottom: 34 } : null) },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: C.border },
  sheetTitle: { fontFamily: F.dExtra, fontSize: 18, color: C.navy },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 50, borderRadius: 14, backgroundColor: C.surface },
  optTxt: { fontFamily: F.dSemibold, fontSize: 15, color: C.navy },
  tile: { flex: 1, height: 46, borderRadius: 12, backgroundColor: '#f2f3f5', borderWidth: 1, borderColor: '#f2f3f5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  tileTxt: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  pill: { height: 54, borderRadius: 27, backgroundColor: C.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  pillTxt: { fontFamily: F.dBold, fontSize: 16, color: C.white },
  pillIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
});
