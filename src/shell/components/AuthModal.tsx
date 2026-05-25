import { useState } from "react";
import {
  Anchor,
  Button,
  Divider,
  Modal,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useAuthStore } from "../../state/authStore";
import { isTelegramEnvironment } from "../../services/telegram";

const MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Invalid email address.",
  "auth/email-already-in-use": "That email is already registered.",
  "auth/weak-password": "Password is too short (min 6 characters).",
  "auth/wrong-password": "Wrong email or password.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/user-not-found": "No account found for that email.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/operation-not-allowed": "Email sign-in is not enabled yet.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/telegram-failed": "Telegram sign-in failed. Try again.",
  "auth/reset-email-sent": "Password reset link sent to your email.",
  "auth/unknown": "Something went wrong. Try again.",
  "tg/no-init-data": "No Telegram init data on the client.",
  "tg/network": "Network error reaching /api/telegram-auth.",
  "tg/server-misconfigured": "Server is missing the bot token (Vercel env).",
  "tg/missing-init-data": "Server received no init data.",
  "tg/invalid-init-data": "Signature check failed - wrong bot token.",
  "tg/stale-init-data": "Telegram data expired. Reopen the app.",
  "tg/no-user": "No Telegram user in init data.",
  "tg/token-failed": "Server could not mint the Firebase token (admin creds).",
  "tg/malformed": "Bad response from /api/telegram-auth.",
};

const messageFor = (code: string): string => MESSAGES[code] ?? code;

type Mode = "signin" | "signup";

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export const AuthModal = ({ opened, onClose }: AuthModalProps) => {
  const busy = useAuthStore((s) => s.busy);
  const error = useAuthStore((s) => s.error);
  const notice = useAuthStore((s) => s.notice);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithTelegram = useAuthStore((s) => s.signInWithTelegram);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const inTelegram = isTelegramEnvironment();

  const onTelegram = async () => {
    if (await signInWithTelegram()) onClose();
  };

  const submit = async () => {
    const ok =
      mode === "signup"
        ? await signUpWithEmail(email.trim(), password, nickname.trim())
        : await signInWithEmail(email.trim(), password);
    if (ok) onClose();
  };

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (mode === "signin" || nickname.trim().length > 0);

  return (
    <Modal opened={opened} onClose={onClose} title="Sync your progress" centered>
      <Stack gap="md">
        {inTelegram ? (
          <Button
            color="#229ed9"
            radius="xl"
            loading={busy}
            onClick={() => void onTelegram()}
            fullWidth
          >
            Continue with Telegram
          </Button>
        ) : (
          <Button
            variant="light"
            color="#00f0ff"
            radius="xl"
            loading={busy}
            onClick={() => void signInWithGoogle()}
            fullWidth
          >
            Continue with Google
          </Button>
        )}
        <Divider label="or with email" />

        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as Mode)}
          data={[
            { label: "Sign in", value: "signin" },
            { label: "Create account", value: "signup" },
          ]}
          fullWidth
        />

        {mode === "signup" && (
          <TextInput
            label="Nickname"
            placeholder="Shown on the leaderboard"
            value={nickname}
            onChange={(e) => setNickname(e.currentTarget.value)}
            maxLength={20}
          />
        )}

        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />

        <Button
          color="#ff006e"
          radius="xl"
          loading={busy}
          disabled={!canSubmit}
          onClick={() => void submit()}
          fullWidth
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>

        {mode === "signin" && (
          <Anchor
            size="xs"
            c="dimmed"
            onClick={() => void resetPassword(email.trim())}
          >
            Forgot password?
          </Anchor>
        )}

        {error !== null && (
          <Text size="sm" c="red">
            {messageFor(error)}
          </Text>
        )}
        {notice !== null && (
          <Text size="sm" c="teal">
            {messageFor(notice)}
          </Text>
        )}

        <Divider />
        <Button variant="subtle" color="gray" onClick={onClose} fullWidth>
          Continue without account
        </Button>
        <Text size="xs" c="dimmed" ta="center">
          Without an account, progress is saved only on this device.
        </Text>
      </Stack>
    </Modal>
  );
};
