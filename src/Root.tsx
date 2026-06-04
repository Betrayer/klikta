import { MantineProvider } from '@mantine/core';
import { App } from './App';
import { useActiveMantineTheme } from './shell/mantineTheme';
import { useThemeCursor } from './shell/useThemeCursor';

export const Root = () => {
  const theme = useActiveMantineTheme();
  useThemeCursor();
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  );
};
