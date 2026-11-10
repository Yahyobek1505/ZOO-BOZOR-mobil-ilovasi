import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { C, F } from '@/constants/colors';
import { CITIES } from '@/constants/data';
import { digitsOnly, normalizePhone, validBirthDate } from '@/constants/input';
import { Profile, useApp } from '@/context/AppContext';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useBottomInset } from '@/components/ui';
import { Field } from '@/components/Field';
import { CurvedHeader, HeaderAction, Label, PillButton, Select, Tile } from '@/components/FormKit';

export default function ProfileEdit() {
  const { profile, updateProfile } = useApp();
  const bottom = useBottomInset();
  const [p, setP] = useState<Profile>({ ...profile, phone: digitsOnly(profile.phone).slice(0, 12) });
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
    const phone = p.phone.trim() ? normalizePhone(p.phone) : '';
    if (p.name.trim() && p.name.trim().length < 2) e.name = 'Ism juda qisqa';
    if (phone === null) e.phone = 'Raqamni 9 xonali yoki 998 bilan 12 xonali kiriting';
    if (p.email.trim() && !/^\S+@\S+\.\S+$/.test(p.email.trim())) e.email = 'Elektron pochta notoʻgʻri';
    if (p.birth.trim() && !validBirthDate(p.birth.trim())) e.birth = 'Haqiqiy sanani KK.OO.YYYY formatida kiriting';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      updateProfile({ ...p, name: p.name.trim(), phone: phone ?? '', email: p.email.trim(), birth: p.birth.trim() });
    } catch (err) {
      Alert.alert('Saqlanmadi', err instanceof Error ? err.message : 'Profilni saqlab boʻlmadi.');
      return;
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <CurvedHeader title="Profilni tahrirlash" onBack={() => router.back()} right={<HeaderAction label="Saqlash" onPress={save} testID="save-profile-header" />} />
      <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: bottom + 40 }} bottomOffset={40}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Pressable onPress={pickAvatar} style={st.avatar} testID="pick-avatar" accessibilityRole="button" accessibilityLabel="Profil rasmini tanlash">
            {p.avatar ? <Image source={{ uri: p.avatar }} style={{ width: '100%', height: '100%', borderRadius: 52 }} /> : <Feather name="user" size={42} color={C.lime} />}
            <View style={st.cam}><Feather name="camera" size={15} color={C.navy} /></View>
          </Pressable>
          {p.avatar ? (
            <Pressable onPress={() => set('avatar', '')} testID="remove-avatar" accessibilityRole="button">
              <Text style={st.link}>Rasmni olib tashlash</Text>
            </Pressable>
          ) : null}
        </View>
        <Field label="Ism-familiya" value={p.name} onChangeText={(v) => set('name', v)} placeholder="Ismingiz" error={errors.name} testID="name" style={st.input} />
        <Field label="Telefon raqami" value={p.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" placeholder="998901234567" maxLength={12} error={errors.phone} testID="phone" style={st.input} />
        <Field label="Elektron pochta" value={p.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="pochta@misol.uz" error={errors.email} testID="email" style={st.input} />
        <Field label="Tugʻilgan sana" value={p.birth} onChangeText={(v) => set('birth', v)} inputKind="date" keyboardType="number-pad" maxLength={10} placeholder="15.11.1994" error={errors.birth} testID="birth" style={st.input} />
        <Select label="Hudud" value={p.region} onChange={(v) => set('region', v)} options={CITIES.map((c) => ({ value: c.name, label: c.name }))} testID="region" />
        <View style={{ gap: 8 }}>
          <Label text="Jinsi" />
          <View style={st.row}>
            <Tile label="Erkak" active={p.gender === 'erkak'} onPress={() => set('gender', 'erkak')} testID="gender-erkak" />
            <Tile label="Ayol" active={p.gender === 'ayol'} onPress={() => set('gender', 'ayol')} testID="gender-ayol" />
          </View>
          <Tile label="Koʻrsatmaslik" active={p.gender === ''} onPress={() => set('gender', '')} testID="gender-none" />
        </View>
        <PillButton label="Saqlash" onPress={save} testID="save-profile" />
        <Text style={st.hint}>Telefon raqami ixtiyoriy va tasdiqlanmagan. Maʼlumotlar shu hisob uchun qurilmada saqlanadi.</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const st = StyleSheet.create({
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  cam: { position: 'absolute', right: 0, bottom: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.white },
  link: { fontFamily: F.semibold, fontSize: 13, color: C.destructive },
  input: { backgroundColor: C.white, borderRadius: 12, borderColor: '#d9dce3' },
  row: { flexDirection: 'row', gap: 10 },
  hint: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, textAlign: 'center', lineHeight: 17 },
});
