import { MantineProvider } from '@mantine/core';
import { App } from './App';
import { useActiveMantineTheme } from './shell/mantineTheme';

export const Root = () => {
  const theme = useActiveMantineTheme();
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  );
};
