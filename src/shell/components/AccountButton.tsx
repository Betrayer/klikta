import { Button, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../state/authStore";
import { AuthModal } from "./AuthModal";

export const AccountButton = () => {
  const { t } = useTranslation();
  const status = useAuthStore((s) => s.status);
  const account = useAuthStore((s) => s.account);
  const busy = useAuthStore((s) => s.busy);
  const signOutAccount = useAuthStore((s) => s.signOutAccount);
  const [opened, { open, close }] = useDisclosure(false);

  const synced =
    status === "signed-in" && account !== null && !account.isAnonymous;

  if (synced && account) {
    return (
      <Stack gap={4} align="center">
        <Text size="sm" c="dimmed">
          {t("auth:syncedAs", { name: account.displayName })}
        </Text>
        <Button
          size="compact-sm"
          variant="subtle"
          color="gray"
          loading={busy}
          onClick={() => void signOutAccount()}
        >
          {t("auth:signOut")}
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Button
        size="md"
        radius="xl"
        variant="light"
        color="accent"
        onClick={open}
        fullWidth
      >
        {t("auth:signInToSync")}
      </Button>
      <AuthModal opened={opened} onClose={close} />
    </>
  );
};
