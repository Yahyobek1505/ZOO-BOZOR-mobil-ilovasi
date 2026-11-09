import React from 'react';
import { StyleSheet, Switch, Text, TextInput, TextInputProps, View } from 'react-native';
import { C, F } from '@/constants/colors';
import { decimalOnly, digitsOnly, formatBirthInput } from '@/constants/input';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  inputKind?: 'text' | 'digits' | 'decimal' | 'date';
};

export function Field({ label, error, inputKind, ...props }: FieldProps) {
  const kind = inputKind ?? (
    props.keyboardType === 'decimal-pad' ? 'decimal'
      : ['phone-pad', 'number-pad', 'numeric'].includes(props.keyboardType ?? '') ? 'digits' : 'text'
  );
  const sanitize = kind === 'date' ? formatBirthInput : kind === 'decimal' ? decimalOnly : kind === 'digits' ? digitsOnly : (value: string) => value;
  const numeric = kind !== 'text';
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.label}>{label}</Text>
      <TextInput
        placeholderTextColor={C.mutedForeground}
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        inputMode={kind === 'decimal' ? 'decimal' : kind === 'digits' || kind === 'date' ? 'numeric' : props.inputMode}
        maxLength={numeric ? undefined : props.maxLength}
        onChangeText={(value) => {
          const clean = sanitize(value);
          props.onChangeText?.(props.maxLength && numeric ? clean.slice(0, props.maxLength) : clean);
        }}
        style={[st.input, props.style, props.multiline && { height: 110, textAlignVertical: 'top', paddingTop: 12 }, error ? { borderColor: C.destructive } : null]}
      />
      {error ? <Text style={st.err}>{error}</Text> : null}
    </View>
  );
}

export function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={st.toggle}>
      <View style={{ flex: 1 }}>
        <Text style={st.toggleLabel}>{label}</Text>
        {sub ? <Text style={st.sub}>{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: C.navy, false: C.border }} thumbColor={value ? C.lime : C.white} />
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  group: { backgroundColor: C.white, borderRadius: 20, padding: 14, gap: 14 },
  groupTitle: { fontFamily: F.dBold, fontSize: 16, color: C.navy },
});

const st = StyleSheet.create({
  label: { fontFamily: F.semibold, fontSize: 12, color: C.mutedForeground },
  input: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, paddingHorizontal: 14, fontFamily: F.medium, fontSize: 15, color: C.navy },
  err: { fontFamily: F.medium, fontSize: 12, color: C.destructive },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontFamily: F.dSemibold, fontSize: 14, color: C.navy },
  sub: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, marginTop: 2 },
});
