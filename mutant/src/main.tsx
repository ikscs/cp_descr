import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { UserfrontProvider } from '@userfront/react';
import App from './App';
import './index.css';
import { tenantId } from './globals_VITE';
import { DataModuleProvider } from './api/datamodule/DataModuleContext';
import { APP_DATA_DEFINITIONS } from './api/datamodule/appDataDefinitions';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

if (!tenantId) {
  throw new Error('TENANT_ID is not defined in .env');
}

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//     },
//     secondary: {
//       main: '#dc004e',
//     },
//     background: {
//       default: '#f5f5f5',
//     },
//   },
// });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <ThemeProvider theme={theme}> */}
      <CssBaseline />
      <UserfrontProvider tenantId={tenantId}>
      <DataModuleProvider dataDefinitions={APP_DATA_DEFINITIONS}>
        <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          {/* <Suspense fallback={<div>Загрузка переводов...</div>}> */}
            <App />
          {/* </Suspense> */}
        </I18nextProvider>
    </BrowserRouter>
        </DataModuleProvider>
      </UserfrontProvider>
    {/* </ThemeProvider> */}
  </React.StrictMode>
);