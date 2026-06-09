import { Center, Code, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { getTelegramSession } from '../../services/telegram';

export const ClosedTest = () => {
  const { t } = useTranslation();
  const { userId } = getTelegramSession();
  return (
    <Center h="100dvh" bg="background" p="md">
      <Stack align="center" gap="sm" maw={420}>
        <Title order={2} c="primary">
          {t('common:gate.closedTitle')}
        </Title>
        <Text ta="center" c="dimmed">
          {t('common:gate.closedBody')}
        </Text>
        {userId !== null && (
          <Text ta="center" c="dimmed" size="sm">
            {t('common:gate.yourTelegramId')} <Code>{userId}</Code>
          </Text>
        )}
      </Stack>
    </Center>
  );
};
