import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';
import { Toaster } from './components/toast';
import AppProviders from './providers';
import { AuthBootstrapGate } from './components/AuthBootstrapGate';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AuthBootstrapGate>
        <App />
      </AuthBootstrapGate>
      <Toaster />
    </AppProviders>
  </StrictMode>,
);
