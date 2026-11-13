import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { createUserWithEmailAndPassword, reload, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { FIREBASE_NOT_CONFIGURED_MESSAGE, firebaseConfigured } from '@/lib/firebase-config';
import { startGoogleSignIn } from '@/lib/google-sign-in';
import { safeAppRoute, useSession } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

export type LoginMode = 'signin' | 'signup' | 'verify' | 'forgot';
export function authErrorText(error: unknown): string {
  const value = error as { code?: string; message?: string; data?: { error?: string } };
  const messages: Record<string, string> = {
    'auth/unauthorized-domain': 'Bu domen Firebase’da ruxsat etilmagan. Authentication → Settings → Authorized domains boʻlimiga ilova domenini qoʻshing.',
    'auth/operation-not-allowed': 'Firebase Console’da tanlangan kirish usulini yoqing: Google yoki Email/Password.',
    'auth/popup-blocked': 'Brauzer kirish oynasini toʻsdi. Qalqib chiquvchi oynalarga ruxsat berib, yana Google tugmasini bosing.',
    'zoo/framed': 'Ilova boshqa sahifa ichida ochilgan, bu yerda Google oynasi ishlamaydi. Ilovani brauzerning alohida oynasida oching.',
    'auth/popup-closed-by-user': 'Google orqali kirish tugallanmasdan oyna yopildi.',
    'auth/cancelled-popup-request': 'Oldingi kirish oynasi bekor qilindi. Bitta oynada davom eting.',
    'auth/invalid-credential': 'Email yoki parol notoʻgʻri.',
    'auth/invalid-email': 'Elektron pochta manzilini toʻgʻri kiriting.',
    'auth/email-already-in-use': 'Bu email bilan hisob mavjud. Kirish yoki parolni tiklashdan foydalaning.',
    'auth/weak-password': 'Kuchliroq parol tanlang, kamida 8 ta belgi kiriting.',
    'auth/too-many-requests': 'Urinishlar koʻpayib ketdi. Biroz kutib, qayta urinib koʻring.',
    'auth/network-request-failed': 'Internet bilan bogʻlanib boʻlmadi. Ulanishni tekshiring.',
    'auth/account-exists-with-different-credential': 'Bu email boshqa kirish usuliga bogʻlangan. Avval email va parolingiz bilan kiring.',
    'auth/user-disabled': 'Bu hisob oʻchirilgan. Hisob egasi bilan bogʻlaning.',
    'auth/invalid-api-key': 'Firebase ilova sozlamasi notoʻgʻri.',
  };
  return messages[value.code ?? ''] || value.data?.error || value.message || 'Kirishni yakunlab boʻlmadi. Qayta urinib koʻring.';
}

export function useLogin() {
  const session = useSession();
  const { t } = useLocale();
  const [mode, setMode] = useState<LoginMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { next } = useLocalSearchParams<{ next?: string }>();
  // After sign-in the user lands on their profile (or the screen that sent them here).
  const target = safeAppRoute(next) ?? '/profile';
  const { setPostLoginRoute, takePostLoginRoute } = session;
  useEffect(() => {
    if (session.user && !session.user.emailVerified) setMode('verify');
    if (session.isSignedIn) router.replace((takePostLoginRoute() ?? target) as never);
  }, [session.user, session.isSignedIn, takePostLoginRoute, target]);

  const switchMode = (next: LoginMode) => { setMode(next); setError(''); setInfo(''); };
  const run = async (operation: () => Promise<unknown>, reportGoogleError = false) => {
    if (loading) return;
    if (!firebaseConfigured) { setInfo(''); setError(FIREBASE_NOT_CONFIGURED_MESSAGE); return; }
    setLoading(true); setError(''); setInfo('');
    setPostLoginRoute(target);
    try { await operation(); } catch (cause) {
      setPostLoginRoute(null);
      const message = authErrorText(cause);
      setError(message);
      if (reportGoogleError) session.setGoogleFlowError(message);
    } finally { setLoading(false); }
  };
  const validate = (signup = false) => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Elektron pochta manzilini toʻgʻri kiriting'); return false; }
    if (!password || (signup && password.length < 8)) { setError(signup ? 'Parol kamida 8 ta belgidan iborat boʻlsin' : 'Parolingizni kiriting'); return false; }
    return true;
  };
  const doSignIn = () => {
    if (!validate()) return;
    void run(async () => {
      const result = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      if (!result.user.emailVerified) {
        setMode('verify');
        setInfo('Pochtangizga yuborilgan tasdiqlash havolasini oching, soʻng quyidagi tugmani bosing.');
      }
    });
  };
  const doSignUp = () => {
    if (!validate(true)) return;
    void run(async () => {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      setMode('verify');
      await sendEmailVerification(result.user);
      setInfo(`${t('Tasdiqlash havolasi yuborildi:')} ${email.trim()}. ${t('Havolani ochib, ilovaga qayting.')}`);
    });
  };
  const doVerify = () => void run(async () => {
    const user = firebaseAuth.currentUser;
    if (!user) { switchMode('signin'); return; }
    await reload(user);
    if (!user.emailVerified) { setInfo('Email hali tasdiqlanmagan. Pochtadagi havolani oching va qayta tekshiring.'); return; }
    await user.getIdToken(true);
    session.retry();
  });
  const resend = () => void run(async () => {
    if (!firebaseAuth.currentUser) return;
    await sendEmailVerification(firebaseAuth.currentUser);
    setInfo('Yangi tasdiqlash havolasi yuborildi.');
  });
  const doForgot = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Elektron pochta manzilini toʻgʻri kiriting'); return; }
    void run(async () => {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setInfo('Bu email bilan hisob mavjud boʻlsa, parolni tiklash havolasi yuborildi. Pochtangizni tekshiring.');
    });
  };
  const doGoogle = () => {
    session.setGoogleFlowError('');
    void run(() => startGoogleSignIn(), true);
  };
  const changeAccount = () => { void run(async () => { await session.signOut(); switchMode('signin'); }); };
  return { ...session, mode, email, password, error, info, loading, setEmail, setPassword, switchMode, doSignIn, doSignUp, doVerify, resend, doForgot, doGoogle, changeAccount };
}
