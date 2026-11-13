import { GoogleAuthProvider, getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { firebaseAuth } from './firebase';

const framed = () => { try { return window.top !== window.self; } catch { return true; } };

/**
 * Called synchronously from the tap handler so browsers allow the popup. If the browser still
 * blocks it (mobile browsers, strict pop-up settings), continue with a full-page redirect;
 * inside a frame (device-simulator pages) neither can work, so ask for a normal tab.
 */
export async function startGoogleSignIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    return await signInWithPopup(firebaseAuth, provider);
  } catch (cause) {
    const code = (cause as { code?: string }).code;
    if (code !== 'auth/popup-blocked') throw cause;
    if (framed()) throw Object.assign(new Error('framed'), { code: 'zoo/framed' });
    await signInWithRedirect(firebaseAuth, provider);
    return null;
  }
}

/** Surfaces errors from a redirect sign-in started on a previous page load (success arrives via onIdTokenChanged). */
export function finishGoogleRedirect() {
  return getRedirectResult(firebaseAuth);
}
