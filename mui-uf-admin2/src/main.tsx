import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserfrontProvider } from "@userfront/react";
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { tenantId, basename, } from './globals_VITE';

if (!tenantId) {
  throw new Error("TENANT_ID is not defined in .env");
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UserfrontProvider tenantId={tenantId}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </UserfrontProvider>
  </React.StrictMode>
);