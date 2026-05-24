import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';
import { App } from './App';
import { initTelegram } from './services/telegram';
import { startCloudSync } from './services/cloudSync';

void initTelegram();
startCloudSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>,
);
