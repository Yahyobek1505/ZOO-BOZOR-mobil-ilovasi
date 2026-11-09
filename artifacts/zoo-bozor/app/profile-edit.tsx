import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { C, F } from '@/constants/colors';
import { CITIES } from '@/constants/data';
import { Profile, useApp } from '@/context/AppContext';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Button, Chip, ScreenHeader, useBottomInset } from '@/components/ui';
import { Field, fieldStyles } from '@/components/Field';

export default function ProfileEdit() {
  const { profile, updateProfile } = useApp();
  const bottom = useBottomInset();
  const [p, setP] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));

  const pickAvatar = async () => {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Ruxsat kerak', 'Rasm tanlash uchun galereyaga ruxsat bering.');
        return;
      }
    }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!r.canceled) set('avatar', r.assets[0].uri);
  };

  const save = () => {
    const e: typeof errors = {};
    if (p.name.trim() && p.name.trim().length < 2) e.name = 'Ism juda qisqa';
    if (p.phone.trim() && p.phone.replace(/[^\d]/g, '').length < 9) e.phone = 'Telefon raqami notoʻgʻri';
    if (p.email.trim() && !/^\S+@\S+\.\S+$/.test(p.email.trim())) e.email = 'Elektron pochta notoʻgʻri';
    if (p.birth.trim() && !/^\d{2}\.\d{2}\.\d{4}$/.test(p.birth.trim())) e.birth = 'Format: KK.OO.YYYY';
    setErrors(e);
    if (Object.keys(e).length) return;
    updateProfile({ ...p, name: p.name.trim(), phone: p.phone.trim(), email: p.email.trim(), birth: p.birth.trim() });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Profilni tahrirlash" />
      <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 40 }} bottomOffset={40}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Pressable onPress={pickAvatar} style={st.avatar} testID="pick-avatar">
            {p.avatar ? <Image source={{ uri: p.avatar }} style={{ width: '100%', height: '100%', borderRadius: 50 }} /> : <Feather name="user" size={40} color={C.lime} />}
            <View style={st.cam}>
              <Feather name="camera" size={14} color={C.navy} />
            </View>
          </Pressable>
          {p.avatar ? (
            <Pressable onPress={() => set('avatar', '')}>
              <Text style={st.link}>Rasmni olib tashlash</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={fieldStyles.group}>
          <Field label="Ism-familiya" value={p.name} onChangeText={(v) => set('name', v)} placeholder="Ismingiz" error={errors.name} testID="name" />
          <Field label="Telefon raqami" value={p.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" placeholder="+998" error={errors.phone} />
          <Field label="Elektron pochta" value={p.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="pochta@misol.uz" error={errors.email} />
          <Field label="Tugʻilgan sana" value={p.birth} onChangeText={(v) => set('birth', v)} placeholder="15.11.1994" keyboardType="numbers-and-punctuation" error={errors.birth} />
        </View>
        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Hudud</Text>
          <View style={st.wrap}>
            {CITIES.map((c) => (
              <Chip key={c.name} label={c.name} active={p.region === c.name} onPress={() => set('region', c.name)} />
            ))}
          </View>
          <Text style={fieldStyles.groupTitle}>Jinsi</Text>
          <View style={st.wrap}>
            <Chip label="Erkak" active={p.gender === 'erkak'} onPress={() => set('gender', 'erkak')} />
            <Chip label="Ayol" active={p.gender === 'ayol'} onPress={() => set('gender', 'ayol')} />
            <Chip label="Koʻrsatmaslik" active={p.gender === ''} onPress={() => set('gender', '')} />
          </View>
        </View>
        <Button label="Saqlash" icon="check" onPress={save} testID="save-profile" />
        <Text style={st.hint}>Maʼlumotlar faqat shu qurilmada saqlanadi.</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const st = StyleSheet.create({
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  cam: { position: 'absolute', right: 0, bottom: 2, width: 30, height: 30, borderRadius: 10, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  link: { fontFamily: F.semibold, fontSize: 13, color: C.destructive },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, textAlign: 'center' },
});
