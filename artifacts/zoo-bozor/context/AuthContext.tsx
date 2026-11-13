import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getFirebaseSession, setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { firebaseAuth } from '@/lib/firebase';
import { finishGoogleRedirect } from '@/lib/google-sign-in';
import { apiOrigin } from '@/lib/api-origin';

const origin = apiOrigin();
if (origin) setBaseUrl(origin);
// Firebase uses ID tokens for API requests on both web and native; no Clerk cookies.
setAuthTokenGetter(async () => firebaseAuth.currentUser ? firebaseAuth.currentUser.getIdToken() : null);

type Session = {
  user: User | null;
  accountId: string | null;
  isSignedIn: boolean;
  loading: boolean;
  error: string;
  googleFlowError: string;
  setGoogleFlowError: (error: string) => void;
  retry: () => void;
  signOut: () => Promise<void>;
  /** Where to go once a sign-in started on the login screen finishes. */
  setPostLoginRoute: (route: string | null) => void;
  /** Returns the pending post-login route once, then forgets it. */
  takePostLoginRoute: () => string | null;
};

/** Accepts only in-app paths, so a crafted ?next= can never send users to another site. */
export function safeAppRoute(route: unknown): string | null {
  return typeof route === 'string' && route.startsWith('/') && !route.startsWith('//') && !route.startsWith('/login') ? route : null;
}
const AuthContext = createContext<Session | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleFlowError, setGoogleFlowError] = useState('');
  const generation = useRef(0);
  const resolved = useRef<{ uid: string; accountId: string } | null>(null);
  // Kept above the account-scoped tree: signing in remounts the navigator (new
  // account storage), so the login screen itself cannot be relied on to redirect.
  const postLoginRoute = useRef<string | null>(null);
  const setPostLoginRoute = useCallback((route: string | null) => { postLoginRoute.current = safeAppRoute(route); }, []);
  const takePostLoginRoute = useCallback(() => {
    const route = postLoginRoute.current;
    postLoginRoute.current = null;
    return route;
  }, []);

  const resolve = useCallback(async (current: User | null) => {
    const version = ++generation.current;
    setUser(current); setError('');
    if (!current?.emailVerified) {
      resolved.current = null;
      setAccountId(null); setLoading(false);
      return;
    }
    if (resolved.current?.uid === current.uid) {
      // A routine Firebase token refresh must not unmount an in-progress form.
      setAccountId(resolved.current.accountId); setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await current.getIdToken();
      const session = await getFirebaseSession({ headers: { Authorization: `Bearer ${token}` } });
      if (generation.current !== version) return;
      if (session.firebaseUid !== current.uid) throw new Error('Hisob javobi mos kelmadi.');
      resolved.current = { uid: current.uid, accountId: session.accountId };
      setAccountId(session.accountId);
    } catch (cause) {
      if (generation.current !== version) return;
      const detail = cause as { data?: { error?: string }; status?: number; message?: string };
      setAccountId(null);
      // fetch() rejects with a TypeError (no HTTP status) when the server is down or unreachable.
      const unreachable = cause instanceof TypeError || (!detail.status && /fetch|network/i.test(detail.message ?? ''));
      setError(detail.data?.error || (unreachable
        ? 'Server bilan bogʻlanib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring. Hisobingiz va maʼlumotlaringiz joyida.'
        : 'Hisobingizga tegishli maʼlumotlarni ochib boʻlmadi. Qayta urinib koʻring; ular oʻchirilmagan.'));
    } finally {
      if (generation.current === version) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // A Google redirect sign-in (popup fallback) reports its errors here after the page reloads.
    finishGoogleRedirect().catch((cause: { code?: string; message?: string }) => {
      setGoogleFlowError(cause.code === 'auth/redirect-cancelled-by-user' ? '' : cause.message || 'Google orqali kirishni yakunlab boʻlmadi.');
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, (current) => { void resolve(current); }, () => {
      setLoading(false); setError('Kirish holatini oʻqib boʻlmadi. Internetni tekshiring.');
    });
    return () => { generation.current++; unsubscribe(); };
  }, [resolve]);

  return <AuthContext.Provider value={{
    user, accountId, loading, error, googleFlowError, setGoogleFlowError,
    isSignedIn: !!user?.emailVerified && !!accountId,
    retry: () => { void resolve(firebaseAuth.currentUser); },
    signOut: () => { postLoginRoute.current = null; return firebaseSignOut(firebaseAuth); },
    setPostLoginRoute, takePostLoginRoute,
  }}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const session = useContext(AuthContext);
  if (!session) throw new Error('AuthProvider topilmadi.');
  return session;
}
