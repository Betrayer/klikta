import { Button, Stack, Text } from "@mantine/core";
import { useAuthStore } from "../../state/authStore";
import { isTelegramEnvironment } from "../../services/telegram";

export const AccountButton = () => {
  const status = useAuthStore((s) => s.status);
  const account = useAuthStore((s) => s.account);
  const busy = useAuthStore((s) => s.busy);
  const error = useAuthStore((s) => s.error);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOutAccount = useAuthStore((s) => s.signOutAccount);

  const synced =
    status === "signed-in" && account !== null && !account.isAnonymous;

  if (synced && account) {
    return (
      <Stack gap={4} align="center">
        <Text size="sm" c="dimmed">
          Synced as {account.displayName}
        </Text>
        <Button
          size="compact-sm"
          variant="subtle"
          color="gray"
          loading={busy}
          onClick={() => void signOutAccount()}
        >
          Sign out
        </Button>
      </Stack>
    );
  }

  if (isTelegramEnvironment()) {
    return (
      <Text size="sm" c="dimmed" ta="center">
        Telegram sign-in is coming soon. Progress is saved on this device for
        now.
      </Text>
    );
  }

  return (
    <Stack gap={4} align="center" w="100%">
      <Button
        size="md"
        radius="xl"
        variant="light"
        color="#00f0ff"
        loading={busy}
        onClick={() => void signInWithGoogle()}
        fullWidth
      >
        Sign in to sync
      </Button>
      {error !== null && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
};
