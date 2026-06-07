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
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../state/authStore";
import { isTelegramEnvironment } from "../../services/telegram";

type Mode = "signin" | "signup";

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export const AuthModal = ({ opened, onClose }: AuthModalProps) => {
  const { t } = useTranslation();
  const messageFor = (code: string): string =>
    t(`auth:errors.${code}`, { defaultValue: code });
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("auth:syncTitle")}
      centered
    >
      <Stack gap="md">
        {inTelegram ? (
          <Button
            color="telegram"
            radius="xl"
            loading={busy}
            onClick={() => void onTelegram()}
            fullWidth
          >
            {t("auth:continueTelegram")}
          </Button>
        ) : (
          <Button
            variant="light"
            color="accent"
            radius="xl"
            loading={busy}
            onClick={() => void signInWithGoogle()}
            fullWidth
          >
            {t("auth:continueGoogle")}
          </Button>
        )}
        <Divider label={t("auth:orWithEmail")} />

        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as Mode)}
          data={[
            { label: t("auth:signIn"), value: "signin" },
            { label: t("auth:createAccount"), value: "signup" },
          ]}
          fullWidth
        />

        {mode === "signup" && (
          <TextInput
            label={t("auth:nickname")}
            placeholder={t("auth:nicknamePlaceholder")}
            value={nickname}
            onChange={(e) => setNickname(e.currentTarget.value)}
            maxLength={20}
          />
        )}

        <TextInput
          label={t("auth:email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <PasswordInput
          label={t("auth:password")}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />

        <Button
          color="primary"
          radius="xl"
          loading={busy}
          disabled={!canSubmit}
          onClick={() => void submit()}
          fullWidth
        >
          {mode === "signin" ? t("auth:signIn") : t("auth:createAccount")}
        </Button>

        {mode === "signin" && (
          <Anchor
            size="xs"
            c="dimmed"
            onClick={() => void resetPassword(email.trim())}
          >
            {t("auth:forgotPassword")}
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
          {t("auth:continueWithout")}
        </Button>
        <Text size="xs" c="dimmed" ta="center">
          {t("auth:withoutNotice")}
        </Text>
      </Stack>
    </Modal>
  );
};
