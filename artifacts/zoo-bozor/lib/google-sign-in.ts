import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { redeemGoogleHandoff } from '@workspace/api-client-react';
import { firebaseAuth } from './firebase';

const randomHex = async () => Array.from(await Crypto.getRandomBytesAsync(32), (byte) => byte.toString(16).padStart(2, '0')).join('');

/** Firebase OAuth runs in the system browser, never an embedded Google webview. */
export async function startGoogleSignIn() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) throw new Error('Kirish uchun ilova serveri manzili sozlanmagan.');
  const verifier = await randomHex();
  const state = await randomHex();
  const challenge = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier);
  const redirect = AuthSession.makeRedirectUri({ path: 'sso-callback' });
  const query = new URLSearchParams({ codeChallenge: challenge, state, returnUrl: redirect });
  const result = await WebBrowser.openAuthSessionAsync(`https://${domain}/google-auth?${query}`, redirect);
  if (result.type !== 'success') throw new Error('Google orqali kirish bekor qilindi.');
  const response = new URL(result.url);
  const returned = new URLSearchParams(response.hash.slice(1));
  const handoff = returned.get('handoff');
  if (!handoff || returned.get('state') !== state) throw new Error('Google javobi ushbu kirish soʻroviga mos kelmadi.');
  const { idToken } = await redeemGoogleHandoff({ handoff, verifier, state });
  return signInWithCredential(firebaseAuth, GoogleAuthProvider.credential(idToken));
}
