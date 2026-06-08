import { MantineProvider } from '@mantine/core';
import { App } from './App';
import { useActiveMantineTheme } from './shell/mantineTheme';
import { useThemeCursor } from './shell/useThemeCursor';
import { useThemeBackground } from './shell/useThemeBackground';

export const Root = () => {
  const theme = useActiveMantineTheme();
  useThemeCursor();
  useThemeBackground();
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  );
};
