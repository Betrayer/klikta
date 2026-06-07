import { useState } from 'react';
import { Button, Center, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { tryUnlockWeb } from '../../services/webAccess';

export const WebGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (tryUnlockWeb(value)) {
      onUnlock();
      return;
    }
    setError(true);
  };

  return (
    <Center h="100vh" bg="background" p="md">
      <Stack align="center" gap="md" w={300}>
        <Title order={1} c="primary" lts={4}>
          KLIKTA
        </Title>
        <Text ta="center" c="dimmed" size="sm">
          {t('common:gate.webPrivate')}
        </Text>
        <PasswordInput
          w="100%"
          placeholder={t('common:gate.passwordPlaceholder')}
          value={value}
          error={error ? t('common:gate.wrongPassword') : undefined}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            setError(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
        <Button color="primary" radius="xl" fullWidth onClick={submit}>
          {t('common:gate.enter')}
        </Button>
      </Stack>
    </Center>
  );
};
