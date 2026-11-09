import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth, useSignIn, useSignUp, useSSO } from '@clerk/expo';
import { C, F } from '@/constants/colors';
import { digitsOnly } from '@/constants/input';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useBottomInset, useTopInset } from '@/components/ui';
import { PillButton } from '@/components/FormKit';

WebBrowser.maybeCompleteAuthSession();

type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'challenge';

const errText = (e: unknown): string => {
  const x = e as { errors?: { longMessage?: string; message?: string }[]; longMessage?: string; message?: string } | null;
  return x?.errors?.[0]?.longMessage ?? x?.errors?.[0]?.message ?? x?.longMessage ?? x?.message ?? 'Nomaʼlum xatolik yuz berdi';
};
const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());
const goHome = () => router.replace('/' as never);

function AuthInput({ icon, label, value, onChange, placeholder, secure, email, code, testID }: {
  icon: keyof typeof Feather.glyphMap; label: string; value: string; onChange: (v: string) => void; placeholder: string;
  secure?: boolean; email?: boolean; code?: boolean; testID: string;
}) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ gap: 8 }}>
      <Text style={st.label}>{label}</Text>
      <View style={st.inputWrap}>
        <Feather name={icon} size={20} color="#b5b8c1" />
        <TextInput
          value={value}
          onChangeText={(v) => onChange(code ? digitsOnly(v).slice(0, 6) : v)}
          placeholder={placeholder}
          placeholderTextColor="#b5b8c1"
          secureTextEntry={secure && hidden}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={email ? 'email-address' : code ? 'number-pad' : 'default'}
          inputMode={code ? 'numeric' : email ? 'email' : undefined}
          textContentType={email ? 'emailAddress' : code ? 'oneTimeCode' : secure ? 'password' : undefined}
          maxLength={code ? 6 : undefined}
          style={st.input}
          accessibilityLabel={label}
          testID={testID}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel={hidden ? 'Parolni koʻrsatish' : 'Parolni yashirish'} testID={`${testID}-toggle`}>
            <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color="#b5b8c1" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function Login() {
  const top = useTopInset();
  const bottom = useBottomInset();
  const { isSignedIn } = useAuth();
  const { signIn, fetchStatus: inStatus } = useSignIn();
  const { signUp, fetchStatus: upStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const loading = busy || inStatus === 'fetching' || upStatus === 'fetching';

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);

  const switchMode = (m: Mode) => { setMode(m); setError(''); setInfo(''); setCode(''); };

  const finishNavigate = ({ session, decorateUrl }: { session?: { currentTask?: unknown } | null; decorateUrl: (u: string) => string }) => {
    if (session?.currentTask) {
      setError('Hisobni yakunlash uchun qoʻshimcha qadam talab qilinadi. Iltimos, qaytadan urinib koʻring.');
      return;
    }
    const url = decorateUrl('/');
    if (Platform.OS === 'web' && url.startsWith('http')) window.location.href = url;
    else goHome();
  };

  const run = async (fn: () => Promise<void>) => {
    setError(''); setInfo(''); setBusy(true);
    try { await fn(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  };

  const validateCreds = () => {
    if (!emailOk(email)) { setError('Elektron pochta manzilini toʻgʻri kiriting'); return false; }
    if (password.length < 8) { setError('Parol kamida 8 ta belgidan iborat boʻlsin'); return false; }
    return true;
  };

  const doSignIn = () => {
    if (!validateCreds()) return;
    void run(async () => {
      const { error: e } = await signIn.password({ emailAddress: email.trim(), password });
      if (e) { setError(errText(e)); return; }
      if (signIn.status === 'complete') await signIn.finalize({ navigate: finishNavigate });
      else if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
        if (!signIn.supportedSecondFactors?.some((factor) => factor.strategy === 'email_code')) {
          setError('Bu hisob boshqa turdagi ikki bosqichli tasdiqlashni talab qilmoqda. Email tasdiqlash usulidan foydalaning.');
          return;
        }
        const { error: challengeError } = await signIn.mfa.sendEmailCode();
        if (challengeError) { setError(errText(challengeError)); return; }
        setMode('challenge'); setCode('');
        setInfo(`Kirishni tasdiqlash kodi ${email.trim()} manziliga yuborildi.`);
      } else setError('Kirish yakunlanmadi. Qaytadan urinib koʻring.');
    });
  };

  const doSignUp = () => {
    if (!validateCreds()) return;
    void run(async () => {
      const { error: e } = await signUp.password({ emailAddress: email.trim(), password });
      if (e) { setError(errText(e)); return; }
      const { error: e2 } = await signUp.verifications.sendEmailCode();
      if (e2) { setError(errText(e2)); return; }
      setMode('verify'); setCode('');
      setInfo(`Tasdiqlash kodi ${email.trim()} manziliga yuborildi.`);
    });
  };

  const doVerify = () => {
    if (code.length < 6) { setError('6 xonali kodni kiriting'); return; }
    void run(async () => {
      const { error: e } = await signUp.verifications.verifyEmailCode({ code });
      if (e) { setError(errText(e)); return; }
      if (signUp.status === 'complete') await signUp.finalize({ navigate: finishNavigate });
      else setError(`Roʻyxatdan oʻtish yakunlanmadi${signUp.missingFields?.length ? `: ${signUp.missingFields.join(', ')} talab qilinadi` : ''}.`);
    });
  };

  const resendSignUp = () => void run(async () => {
    const { error: e } = await signUp.verifications.sendEmailCode();
    if (e) setError(errText(e)); else setInfo('Yangi kod yuborildi.');
  });

  const resendChallenge = () => void run(async () => {
    const { error: e } = await signIn.mfa.sendEmailCode();
    if (e) setError(errText(e)); else setInfo('Yangi kirish kodi yuborildi.');
  });

  const doChallenge = () => {
    if (code.length !== 6) { setError('6 xonali kodni kiriting'); return; }
    void run(async () => {
      const { error: e } = await signIn.mfa.verifyEmailCode({ code });
      if (e) { setError(errText(e)); return; }
      if (signIn.status === 'complete') await signIn.finalize({ navigate: finishNavigate });
      else setError('Tasdiqlash yakunlanmadi. Yangi kod bilan qaytadan urinib koʻring.');
    });
  };

  const doForgot = () => {
    if (!emailOk(email)) { setError('Elektron pochta manzilini toʻgʻri kiriting'); return; }
    void run(async () => {
      const { error: e } = await signIn.create({ identifier: email.trim() });
      if (e) { setError(errText(e)); return; }
      const { error: e2 } = await signIn.resetPasswordEmailCode.sendCode();
      if (e2) { setError(errText(e2)); return; }
      setMode('reset'); setCode(''); setPassword('');
      setInfo(`Parolni tiklash kodi ${email.trim()} manziliga yuborildi.`);
    });
  };

  const resendReset = () => void run(async () => {
    const { error: e } = await signIn.resetPasswordEmailCode.sendCode();
    if (e) setError(errText(e)); else setInfo('Yangi kod yuborildi.');
  });

  const doReset = () => {
    if (code.length < 6) { setError('6 xonali kodni kiriting'); return; }
    if (password.length < 8) { setError('Yangi parol kamida 8 ta belgidan iborat boʻlsin'); return; }
    void run(async () => {
      const { error: e } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (e) { setError(errText(e)); return; }
      const { error: e2 } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (e2) { setError(errText(e2)); return; }
      if (signIn.status === 'complete') await signIn.finalize({ navigate: finishNavigate });
      else setError('Parol yangilandi, lekin kirish yakunlanmadi. Yangi parol bilan kiring.');
    });
  };

  const doGoogle = () => void run(async () => {
    if (Platform.OS === 'web') {
      const { error: e } = await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/`,
        redirectCallbackUrl: `${window.location.origin}/sso-callback`,
      });
      if (e) setError(errText(e));
      return;
    }
    const { createdSessionId, setActive, signUp: ssoUp } = await startSSOFlow({
      strategy: 'oauth_google',
      redirectUrl: AuthSession.makeRedirectUri({ path: 'sso-callback' }),
    });
    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId, navigate: async ({ session }) => {
        if (!session?.currentTask) goHome();
        else setError('Hisobni yakunlash uchun qoʻshimcha tasdiqlash talab qilinmoqda.');
      } });
    } else if (ssoUp?.status === 'missing_requirements') {
      setError(`Google orqali roʻyxatdan oʻtish uchun qoʻshimcha maʼlumot kerak: ${ssoUp.missingFields.join(', ')}.`);
    } else {
      setInfo('Google orqali kirish bekor qilindi.');
    }
  });

  if (isSignedIn) {
    return (
      <View style={[st.root, { paddingTop: top + 40, padding: 24, gap: 16 }]}>
        <Image source={require('@/assets/figma/login-illustration-2.png')} style={st.art} contentFit="contain" />
        <Text style={st.title}>Siz allaqachon kirgansiz</Text>
        <PillButton label="Bosh sahifaga" onPress={goHome} testID="login-home" />
      </View>
    );
  }

  const titles: Record<Mode, string> = {
    signin: 'Kirishni tasdiqlang!',
    signup: 'Roʻyxatdan oʻting!',
    verify: 'Pochtangizni tasdiqlang',
    forgot: 'Parolni tiklash',
    reset: 'Yangi parol oʻrnating',
    challenge: 'Kirishni tasdiqlang',
  };
  const isCodeStep = mode === 'verify' || mode === 'reset' || mode === 'challenge';

  return (
    <View style={st.root}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={{ paddingTop: top + 24, paddingHorizontal: 24, paddingBottom: bottom + 24, gap: 18, flexGrow: 1 }} bottomOffset={30}>
        {mode !== 'signin' ? (
          <Pressable onPress={() => switchMode(mode === 'verify' ? 'signup' : 'signin')} style={st.back} accessibilityRole="button" accessibilityLabel="Orqaga" testID="login-back">
            <Feather name="chevron-left" size={22} color={C.navy} />
          </Pressable>
        ) : null}
        <Image source={require('@/assets/figma/login-illustration-2.png')} style={st.art} contentFit="contain" accessibilityLabel="Mushuk va kuchuk eshik oldida" />
        <Text style={st.title}>{titles[mode]}</Text>

        {info ? <Text style={st.info} accessibilityLiveRegion="polite" testID="login-info">{info}</Text> : null}

        {mode === 'signin' || mode === 'signup' || mode === 'forgot' ? (
          <AuthInput icon="at-sign" label="Elektron pochta" value={email} onChange={setEmail} placeholder="Email manzilingiz" email testID="login-email" />
        ) : null}
        {isCodeStep ? (
          <AuthInput icon="hash" label="Tasdiqlash kodi" value={code} onChange={setCode} placeholder="6 xonali kod" code testID="login-code" />
        ) : null}
        {mode === 'signin' || mode === 'signup' || mode === 'reset' ? (
          <AuthInput icon="lock" label={mode === 'reset' ? 'Yangi parol' : 'Parol'} value={password} onChange={setPassword} placeholder="Parolingiz" secure testID="login-password" />
        ) : null}

        {mode === 'signin' ? (
          <Pressable onPress={() => switchMode('forgot')} style={{ alignSelf: 'flex-end' }} accessibilityRole="button" testID="login-forgot">
            <Text style={st.link}>Parolni unutdingizmi?</Text>
          </Pressable>
        ) : null}
        {isCodeStep ? (
          <Pressable onPress={mode === 'verify' ? resendSignUp : mode === 'challenge' ? resendChallenge : resendReset} disabled={loading} style={{ alignSelf: 'flex-end' }} accessibilityRole="button" testID="login-resend">
            <Text style={st.link}>Kodni qayta yuborish</Text>
          </Pressable>
        ) : null}

        {error ? (
          <View style={st.error} accessibilityLiveRegion="assertive" testID="login-error">
            <Feather name="alert-circle" size={16} color={C.destructive} />
            <Text style={st.errorTxt}>{error}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 8 }}>
          <PillButton
            label={loading ? 'Kuting...' : mode === 'signin' ? 'Kirish' : mode === 'signup' ? 'Roʻyxatdan oʻtish' : mode === 'forgot' ? 'Kod yuborish' : mode === 'verify' || mode === 'challenge' ? 'Tasdiqlash' : 'Parolni saqlash'}
            onPress={mode === 'signin' ? doSignIn : mode === 'signup' ? doSignUp : mode === 'forgot' ? doForgot : mode === 'verify' ? doVerify : mode === 'challenge' ? doChallenge : doReset}
            disabled={loading}
            testID="login-submit"
          />
        </View>

        {mode === 'signin' || mode === 'signup' ? (
          <>
            <View style={st.orRow}><View style={st.orLine} /><Text style={st.or}>yoki</Text><View style={st.orLine} /></View>
            <Pressable onPress={doGoogle} disabled={loading} style={({ pressed }) => [st.google, pressed && { opacity: 0.8 }]} accessibilityRole="button" accessibilityLabel="Google orqali kirish" testID="login-google">
              <Text style={st.gMark}>G</Text>
              <Text style={st.googleTxt}>Google orqali davom etish</Text>
            </Pressable>
            <Pressable onPress={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} style={{ alignSelf: 'center' }} accessibilityRole="button" testID="login-switch">
              <Text style={st.switchTxt}>
                {mode === 'signin' ? 'Hisobingiz yoʻqmi? ' : 'Hisobingiz bormi? '}
                <Text style={st.switchBold}>{mode === 'signin' ? 'Roʻyxatdan oʻting' : 'Kiring'}</Text>
              </Text>
            </Pressable>
          </>
        ) : null}

        <View style={{ flex: 1 }} />
        <Pressable onPress={() => (router.canGoBack() ? router.back() : goHome())} style={st.guest} accessibilityRole="button" testID="login-guest">
          <Feather name="user" size={18} color={C.navy} />
          <Text style={st.guestTxt}>Mehmon sifatida davom etish</Text>
          <Feather name="chevron-right" size={18} color={C.navy} />
        </Pressable>
        <View nativeID="clerk-captcha" />
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  art: { width: 240, height: 130, alignSelf: 'center' },
  title: { fontFamily: F.dExtra, fontSize: 21, color: C.navy, textAlign: 'center', marginBottom: 8 },
  label: { fontFamily: F.dBold, fontSize: 13, color: C.navy, marginLeft: 12 },
  inputWrap: { height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#cfd2da', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  input: { flex: 1, height: '100%', fontFamily: F.medium, fontSize: 15, color: C.navy },
  link: { fontFamily: F.dBold, fontSize: 13, color: C.navy, textDecorationLine: 'underline' },
  info: { fontFamily: F.medium, fontSize: 13, color: C.navy, backgroundColor: '#f3ffd0', padding: 12, borderRadius: 14, textAlign: 'center' },
  error: { flexDirection: 'row', gap: 8, backgroundColor: '#fdeaea', padding: 12, borderRadius: 14, alignItems: 'flex-start' },
  errorTxt: { flex: 1, fontFamily: F.medium, fontSize: 13, color: C.destructive },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  orLine: { flex: 1, height: 1, backgroundColor: C.border },
  or: { fontFamily: F.medium, fontSize: 13, color: '#b5b8c1' },
  google: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: '#d9dce3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  gMark: { fontFamily: F.dExtra, fontSize: 22, color: '#4285F4' },
  googleTxt: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  switchTxt: { fontFamily: F.medium, fontSize: 14, color: C.mutedForeground },
  switchBold: { fontFamily: F.dBold, color: C.navy },
  guest: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  guestTxt: { fontFamily: F.dBold, fontSize: 14, color: C.navy },
});
