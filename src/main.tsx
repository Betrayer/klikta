import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import './index.css';
import { Root } from './Root';
import { initTelegram } from './services/telegram';
import { startCloudSync } from './services/cloudSync';
import { initI18n } from './i18n';
import { useSettingsStore } from './state/settingsStore';

void initTelegram();
startCloudSync();

try {
  await initI18n(useSettingsStore.getState().language);
} catch (error) {
  console.error('i18n init failed, defaulting to English', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
