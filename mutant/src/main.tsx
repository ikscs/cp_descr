import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserfrontProvider } from "@userfront/react";
import App from './App';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext'; 
import { tenantId, basename, } from './globals_VITE';
// import { CustomerProvider } from './context/CustomerContext';

console.log('tenantId', tenantId);
if (!tenantId) {
  throw new Error("TENANT_ID is not defined in .env");
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UserfrontProvider tenantId={tenantId}>
      <TenantProvider>
        <BrowserRouter basename={basename}>
          <CssBaseline />
          <App />
        </BrowserRouter>
      </TenantProvider>
    </UserfrontProvider>
  </React.StrictMode>
);