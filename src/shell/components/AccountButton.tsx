import { Button, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "../../state/authStore";
import { AuthModal } from "./AuthModal";

export const AccountButton = () => {
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

  return (
    <>
      <Button
        size="md"
        radius="xl"
        variant="light"
        color="#00f0ff"
        onClick={open}
        fullWidth
      >
        Sign in to sync
      </Button>
      <AuthModal opened={opened} onClose={close} />
    </>
  );
};
