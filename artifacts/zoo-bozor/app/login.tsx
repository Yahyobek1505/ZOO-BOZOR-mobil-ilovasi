import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/LocalizedText';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useBottomInset, useTopInset } from '@/components/ui';
import { PillButton } from '@/components/FormKit';
import { useLogin, type LoginMode } from '@/hooks/useLogin';

function AuthInput({ label, value, onChange, password, testID }: {
  label: string; value: string; onChange: (value: string) => void; password?: boolean; testID: string;
}) {
  const [hidden, setHidden] = useState(true);
  return <View style={{ gap: 8 }}>
    <Text style={st.label}>{label}</Text>
    <View style={st.inputWrap}>
      <Feather name={password ? 'lock' : 'at-sign'} size={20} color={C.mutedForeground} />
      <TextInput value={value} onChangeText={onChange} placeholder={password ? 'Parolingiz' : 'Email manzilingiz'}
        placeholderTextColor={C.mutedForeground} secureTextEntry={password && hidden}
        autoCapitalize="none" autoCorrect={false} keyboardType={password ? 'default' : 'email-address'}
        inputMode={password ? undefined : 'email'} textContentType={password ? 'password' : 'emailAddress'}
        style={st.input} accessibilityLabel={label} testID={testID} />
      {password ? <Pressable onPress={() => setHidden((old) => !old)} hitSlop={10} accessibilityRole="button"
        accessibilityLabel={hidden ? 'Parolni koʻrsatish' : 'Parolni yashirish'} testID={`${testID}-toggle`}>
        <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color={C.mutedForeground} />
      </Pressable> : null}
    </View>
  </View>;
}

export default function Login() {
  const top = useTopInset();
  const bottom = useBottomInset();
  const auth = useLogin();
  const titles: Record<LoginMode, string> = {
    signin: 'Kirishni tasdiqlang!', signup: 'Roʻyxatdan oʻting!', verify: 'Pochtangizni tasdiqlang', forgot: 'Parolni tiklash',
  };
  const credentials = auth.mode === 'signin' || auth.mode === 'signup';
  const goHome = () => router.replace('/');

  return <View style={st.root}>
    <KeyboardAwareScrollViewCompat contentContainerStyle={{ paddingTop: top + 24, paddingHorizontal: 24, paddingBottom: bottom + 24, gap: 18, flexGrow: 1 }} bottomOffset={30}>
      {auth.mode !== 'signin' && auth.mode !== 'verify' ? <Pressable onPress={() => auth.switchMode('signin')} style={st.back} accessibilityRole="button" accessibilityLabel="Orqaga" testID="login-back">
        <Feather name="chevron-left" size={22} color={C.navy} />
      </Pressable> : null}
      <Image source={require('@/assets/figma/login-illustration-2.png')} style={st.art} contentFit="contain" accessibilityLabel="Mushuk va kuchuk eshik oldida" />
      <Text style={st.title}>{titles[auth.mode]}</Text>
      {auth.info ? <Text style={st.info} accessibilityLiveRegion="polite" testID="login-info">{auth.info}</Text> : null}

      {auth.mode === 'verify' ? <>
        <Text style={st.explanation} testID="verification-email">{auth.user?.email}</Text>
        <Text style={st.explanation}>Emailingizdagi Firebase tasdiqlash havolasini oching. Soʻng ilovaga qaytib, “Tasdiqladim” tugmasini bosing.</Text>
      </> : <>
        <AuthInput label="Elektron pochta" value={auth.email} onChange={auth.setEmail} testID="login-email" />
        {credentials ? <AuthInput label="Parol" value={auth.password} onChange={auth.setPassword} password testID="login-password" /> : null}
      </>}

      {auth.mode === 'signin' ? <Pressable onPress={() => auth.switchMode('forgot')} style={{ alignSelf: 'flex-end' }} accessibilityRole="button" testID="login-forgot">
        <Text style={st.link}>Parolni unutdingizmi?</Text>
      </Pressable> : null}
      {auth.error ? <View style={st.error} accessibilityLiveRegion="assertive" testID="login-error">
        <Feather name="alert-circle" size={16} color={C.destructive} /><Text style={st.errorTxt}>{auth.error}</Text>
      </View> : null}
      <View style={{ marginTop: 8 }}>
        <PillButton label={auth.loading ? 'Kuting...' : auth.mode === 'signin' ? 'Kirish' : auth.mode === 'signup' ? 'Roʻyxatdan oʻtish' : auth.mode === 'forgot' ? 'Havola yuborish' : 'Tasdiqladim'}
          onPress={auth.mode === 'signin' ? auth.doSignIn : auth.mode === 'signup' ? auth.doSignUp : auth.mode === 'forgot' ? auth.doForgot : auth.doVerify}
          disabled={auth.loading} testID="login-submit" />
      </View>
      {auth.mode === 'verify' ? <>
        <Pressable onPress={auth.resend} disabled={auth.loading} accessibilityRole="button" testID="login-resend"><Text style={[st.link, { textAlign: 'center' }]}>Havolani qayta yuborish</Text></Pressable>
        <Pressable onPress={auth.changeAccount} disabled={auth.loading} accessibilityRole="button" testID="login-change-account"><Text style={[st.explanation, { textDecorationLine: 'underline' }]}>Boshqa hisob bilan kirish</Text></Pressable>
      </> : null}
      {credentials ? <>
        <View style={st.orRow}><View style={st.orLine} /><Text style={st.or}>yoki</Text><View style={st.orLine} /></View>
        <Pressable onPress={auth.doGoogle} disabled={auth.loading} style={({ pressed }) => [st.google, pressed && { opacity: 0.8 }]} accessibilityRole="button" accessibilityLabel="Google orqali kirish" testID="login-google">
          <Text style={st.gMark}>G</Text><Text style={st.googleTxt}>Google orqali davom etish</Text>
        </Pressable>
        <Pressable onPress={() => auth.switchMode(auth.mode === 'signin' ? 'signup' : 'signin')} style={{ alignSelf: 'center' }} accessibilityRole="button" testID="login-switch">
          <Text style={st.switchTxt}>{auth.mode === 'signin' ? 'Hisobingiz yoʻqmi? ' : 'Hisobingiz bormi? '}
            <Text style={st.switchBold}>{auth.mode === 'signin' ? 'Roʻyxatdan oʻting' : 'Kiring'}</Text>
          </Text>
        </Pressable>
        {auth.mode === 'signin' ? <Text style={st.migration}>Oldingi hisobingiz boʻlsa, Firebase’da oʻsha email bilan bir marta roʻyxatdan oʻting va uni tasdiqlang. Eski parolingiz avtomatik koʻchirilmaydi.</Text> : null}
      </> : null}
      <View style={{ flex: 1 }} />
      <Pressable onPress={() => (router.canGoBack() ? router.back() : goHome())} style={st.guest} accessibilityRole="button" testID="login-guest">
        <Feather name="user" size={18} color={C.navy} /><Text style={st.guestTxt}>Mehmon sifatida davom etish</Text><Feather name="chevron-right" size={18} color={C.navy} />
      </Pressable>
    </KeyboardAwareScrollViewCompat>
  </View>;
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  art: { width: 240, height: 130, alignSelf: 'center' },
  title: { fontFamily: F.dExtra, fontSize: 21, color: C.navy, textAlign: 'center', marginBottom: 8 },
  label: { fontFamily: F.dBold, fontSize: 13, color: C.navy, marginLeft: 12 },
  inputWrap: { height: 54, borderRadius: 27, borderWidth: 1, borderColor: C.border, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  input: { flex: 1, height: '100%', fontFamily: F.medium, fontSize: 15, color: C.navy },
  link: { fontFamily: F.dBold, fontSize: 13, color: C.navy, textDecorationLine: 'underline' },
  info: { fontFamily: F.medium, fontSize: 13, color: C.navy, backgroundColor: C.secondary, padding: 12, borderRadius: 14, textAlign: 'center' },
  explanation: { fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.navy, textAlign: 'center' },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#fdeaea', padding: 12, borderRadius: 14, alignItems: 'flex-start' },
  errorTxt: { flex: 1, fontFamily: F.medium, fontSize: 13, color: C.destructive },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  orLine: { flex: 1, height: 1, backgroundColor: C.border },
  or: { fontFamily: F.medium, fontSize: 13, color: C.mutedForeground },
  google: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  gMark: { fontFamily: F.dExtra, fontSize: 22, color: '#4285f4' },
  googleTxt: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  switchTxt: { fontFamily: F.medium, fontSize: 14, color: C.mutedForeground },
  switchBold: { fontFamily: F.dBold, color: C.navy },
  migration: { fontFamily: F.regular, fontSize: 11, lineHeight: 17, color: C.mutedForeground, textAlign: 'center' },
  guest: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  guestTxt: { fontFamily: F.dBold, fontSize: 14, color: C.navy },
});
