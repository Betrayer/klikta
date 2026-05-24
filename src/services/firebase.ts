import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let pendingAuth: Promise<string> | null = null;

export const ensureAuth = async (): Promise<string> => {
  if (auth.currentUser) return auth.currentUser.uid;
  if (!pendingAuth) {
    pendingAuth = signInAnonymously(auth)
      .then((credential) => credential.user.uid)
      .catch((error: unknown) => {
        pendingAuth = null;
        throw error;
      });
  }
  return pendingAuth;
};
