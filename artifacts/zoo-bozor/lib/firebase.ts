import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebase-config';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
function nativeAuth() {
  // The SDK's React Native condition exports this helper; the public browser
  // declaration in the firebase facade does not include its native-only name.
  const sdk = FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  };
  if (typeof sdk.getReactNativePersistence !== 'function') throw new Error('Firebase React Native saqlash moduli yuklanmadi.');
  try {
    return initializeAuth(app, { persistence: sdk.getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') return getAuth(app);
    throw error;
  }
}
export const firebaseAuth = nativeAuth();
