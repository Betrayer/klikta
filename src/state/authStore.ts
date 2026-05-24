import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../services/firebase";

export type AccountProvider = "anonymous" | "google" | "telegram";

export interface Account {
  uid: string;
  displayName: string;
  provider: AccountProvider;
  isAnonymous: boolean;
}

export type AuthStatus = "unknown" | "signed-out" | "signed-in";

export interface AuthState {
  status: AuthStatus;
  account: Account | null;
  busy: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutAccount: () => Promise<void>;
}

const anonDisplayName = (uid: string): string =>
  `Player${uid.slice(0, 4).toUpperCase()}`;

const providerOf = (user: User): AccountProvider => {
  if (user.isAnonymous) return "anonymous";
  if (user.providerData.some((p) => p.providerId === "google.com")) {
    return "google";
  }
  return "telegram";
};

const toAccount = (user: User): Account => ({
  uid: user.uid,
  displayName: user.displayName ?? anonDisplayName(user.uid),
  provider: providerOf(user),
  isAnonymous: user.isAnonymous,
});

const isCancellation = (code: string): boolean =>
  code === "auth/popup-closed-by-user" ||
  code === "auth/cancelled-popup-request";

const errorCode = (error: unknown): string =>
  error instanceof FirebaseError ? error.code : "auth/unknown";

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      status: "unknown",
      account: null,
      busy: false,
      error: null,

      signInWithGoogle: async () => {
        set({ busy: true, error: null }, false, "signInWithGoogle/start");
        const provider = new GoogleAuthProvider();
        const current = auth.currentUser;
        try {
          if (current?.isAnonymous) {
            try {
              await linkWithPopup(current, provider);
            } catch (error) {
              if (
                error instanceof FirebaseError &&
                error.code === "auth/credential-already-in-use"
              ) {
                const credential =
                  GoogleAuthProvider.credentialFromError(error);
                if (!credential) throw error;
                await signInWithCredential(auth, credential);
              } else {
                throw error;
              }
            }
          } else {
            await signInWithPopup(auth, provider);
          }
          set({ busy: false }, false, "signInWithGoogle/done");
        } catch (error) {
          const code = errorCode(error);
          set(
            { busy: false, error: isCancellation(code) ? null : code },
            false,
            "signInWithGoogle/error",
          );
        }
      },

      signOutAccount: async () => {
        set({ busy: true, error: null }, false, "signOutAccount/start");
        try {
          await signOut(auth);
          set({ busy: false }, false, "signOutAccount/done");
        } catch (error) {
          set(
            { busy: false, error: errorCode(error) },
            false,
            "signOutAccount/error",
          );
        }
      },
    }),
    { name: "authStore" },
  ),
);

onAuthStateChanged(auth, (user) => {
  useAuthStore.setState(
    {
      status: user ? "signed-in" : "signed-out",
      account: user ? toAccount(user) : null,
    },
    false,
    "onAuthStateChanged",
  );
});
