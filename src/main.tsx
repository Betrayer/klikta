import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import './index.css';
import { Root } from './Root';
import { initTelegram } from './services/telegram';
import { startCloudSync } from './services/cloudSync';

void initTelegram();
startCloudSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
