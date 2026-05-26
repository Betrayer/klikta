import { Center, Code, Stack, Text, Title } from '@mantine/core';
import { getTelegramSession } from '../../services/telegram';

export const ClosedTest = () => {
  const { userId } = getTelegramSession();
  return (
    <Center h="100vh" bg="background" p="md">
      <Stack align="center" gap="sm" maw={420}>
        <Title order={2} c="primary">
          Closed test
        </Title>
        <Text ta="center" c="dimmed">
          Klikta is in private testing. Access is limited to a small list.
        </Text>
        {userId !== null && (
          <Text ta="center" c="dimmed" size="sm">
            Your Telegram ID: <Code>{userId}</Code>
          </Text>
        )}
      </Stack>
    </Center>
  );
};
