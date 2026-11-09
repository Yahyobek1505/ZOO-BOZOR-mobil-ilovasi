import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from './firebase';

/** Called synchronously from the tap handler so browsers allow the popup. */
export function startGoogleSignIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(firebaseAuth, provider);
}
