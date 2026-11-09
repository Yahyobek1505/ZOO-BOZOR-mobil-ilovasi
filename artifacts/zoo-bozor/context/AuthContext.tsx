import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getFirebaseSession, setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { firebaseAuth } from '@/lib/firebase';

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) setBaseUrl(`https://${domain}`);
// Firebase uses ID tokens for API requests on both web and native; no Clerk cookies.
setAuthTokenGetter(async () => firebaseAuth.currentUser ? firebaseAuth.currentUser.getIdToken() : null);

type Session = {
  user: User | null;
  accountId: string | null;
  isSignedIn: boolean;
  loading: boolean;
  error: string;
  retry: () => void;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<Session | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const resolved = useRef<{ uid: string; accountId: string } | null>(null);

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
      const detail = cause as { data?: { error?: string } };
      setAccountId(null);
      setError(detail.data?.error || 'Hisobingizga tegishli maʼlumotlarni ochib boʻlmadi. Qayta urinib koʻring; ular oʻchirilmagan.');
    } finally {
      if (generation.current === version) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, (current) => { void resolve(current); }, () => {
      setLoading(false); setError('Kirish holatini oʻqib boʻlmadi. Internetni tekshiring.');
    });
    return () => { generation.current++; unsubscribe(); };
  }, [resolve]);

  return <AuthContext.Provider value={{
    user, accountId, loading, error,
    isSignedIn: !!user?.emailVerified && !!accountId,
    retry: () => { void resolve(firebaseAuth.currentUser); },
    signOut: () => firebaseSignOut(firebaseAuth),
  }}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const session = useContext(AuthContext);
  if (!session) throw new Error('AuthProvider topilmadi.');
  return session;
}
