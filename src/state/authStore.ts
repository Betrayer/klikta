import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../services/firebase";

export type AccountProvider = "anonymous" | "google" | "email" | "telegram";

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
  notice: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    nickname: string,
  ) => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  signOutAccount: () => Promise<void>;
}

const anonDisplayName = (uid: string): string =>
  `Player${uid.slice(0, 4).toUpperCase()}`;

const providerOf = (user: User): AccountProvider => {
  if (user.isAnonymous) return "anonymous";
  const ids = user.providerData.map((p) => p.providerId);
  if (ids.includes("google.com")) return "google";
  if (ids.includes("password")) return "email";
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
      notice: null,

      signInWithGoogle: async () => {
        set(
          { busy: true, error: null, notice: null },
          false,
          "signInWithGoogle/start",
        );
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

      signUpWithEmail: async (email, password, nickname) => {
        set(
          { busy: true, error: null, notice: null },
          false,
          "signUpWithEmail/start",
        );
        try {
          const current = auth.currentUser;
          let user: User;
          if (current?.isAnonymous) {
            const credential = EmailAuthProvider.credential(email, password);
            const result = await linkWithCredential(current, credential);
            user = result.user;
          } else {
            const result = await createUserWithEmailAndPassword(
              auth,
              email,
              password,
            );
            user = result.user;
          }
          await updateProfile(user, { displayName: nickname });
          set(
            { busy: false, status: "signed-in", account: toAccount(user) },
            false,
            "signUpWithEmail/done",
          );
          return true;
        } catch (error) {
          set(
            { busy: false, error: errorCode(error) },
            false,
            "signUpWithEmail/error",
          );
          return false;
        }
      },

      signInWithEmail: async (email, password) => {
        set(
          { busy: true, error: null, notice: null },
          false,
          "signInWithEmail/start",
        );
        try {
          await signInWithEmailAndPassword(auth, email, password);
          set({ busy: false }, false, "signInWithEmail/done");
          return true;
        } catch (error) {
          set(
            { busy: false, error: errorCode(error) },
            false,
            "signInWithEmail/error",
          );
          return false;
        }
      },

      resetPassword: async (email) => {
        set(
          { busy: true, error: null, notice: null },
          false,
          "resetPassword/start",
        );
        try {
          await sendPasswordResetEmail(auth, email);
          set(
            { busy: false, notice: "auth/reset-email-sent" },
            false,
            "resetPassword/done",
          );
        } catch (error) {
          set(
            { busy: false, error: errorCode(error) },
            false,
            "resetPassword/error",
          );
        }
      },

      signOutAccount: async () => {
        set(
          { busy: true, error: null, notice: null },
          false,
          "signOutAccount/start",
        );
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
