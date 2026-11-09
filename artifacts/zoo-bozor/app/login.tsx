import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { C, F } from '@/constants/colors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark, Button, Notice, ScreenHeader, useBottomInset } from '@/components/ui';
import { Field } from '@/components/Field';

export default function Login() {
  const bottom = useBottomInset();
  const [phone, setPhone] = useState('');

  const submit = () =>
    Alert.alert(
      'Server ulanmagan',
      'Hisobga kirish uchun server ulanishi kerak. Hozircha ilovadan mehmon sifatida toʻliq foydalanishingiz mumkin — maʼlumotlaringiz qurilmada saqlanadi.',
    );

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Kirish" />
      <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: bottom + 30 }}>
        <View style={st.hero}>
          <View style={st.logo}>
            <BrandMark size={40} color={C.navy} />
          </View>
          <Text style={st.title}>ZOO BOZORga xush kelibsiz</Text>
          <Text style={st.sub}>Telefon raqamingiz orqali kiring</Text>
        </View>
        <Notice text="Kirish uchun server ulanishi kerak. Bu xizmat hali ulanmagan, shuning uchun hech qanday maʼlumot yuborilmaydi yoki saqlanmaydi." />
        <Field label="Telefon raqami" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+998 90 123 45 67" testID="login-phone" />
        <Button label="SMS kod olish" icon="message-square" onPress={submit} testID="login-submit" />
        <Button label="Mehmon sifatida davom etish" variant="ghost" onPress={() => router.back()} />
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const st = StyleSheet.create({
  hero: { backgroundColor: C.navy, borderRadius: 26, padding: 24, alignItems: 'center', gap: 8 },
  logo: { width: 72, height: 72, borderRadius: 22, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  title: { fontFamily: F.dExtra, fontSize: 20, color: C.white, textAlign: 'center' },
  sub: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground },
});
