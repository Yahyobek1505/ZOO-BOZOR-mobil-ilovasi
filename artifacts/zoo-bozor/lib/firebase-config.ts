import type { FirebaseOptions } from 'firebase/app';

const env = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

/** False when the EXPO_PUBLIC_FIREBASE_* values are missing (e.g. no .env locally). */
export const firebaseConfigured = !!(env.apiKey && env.projectId && env.appId);

export const FIREBASE_NOT_CONFIGURED_MESSAGE =
  'Kirish xizmati sozlanmagan: .env fayliga EXPO_PUBLIC_FIREBASE_* qiymatlarini kiriting. Hozircha mehmon sifatida davom etishingiz mumkin.';

// Firebase client configuration is public; it does not grant administrative access.
// Without a key, getAuth() throws at import time and takes the whole app down,
// so a placeholder keeps guest mode working while sign-in reports the real cause.
export const firebaseConfig: FirebaseOptions = {
  ...env,
  apiKey: env.apiKey || 'not-configured',
};
