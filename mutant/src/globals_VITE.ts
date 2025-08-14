const getApiKey = () => {
  return import.meta.env.DEV ? 
    import.meta.env.VITE_USERFRONT_TEST_API_KEY :
    import.meta.env.VITE_USERFRONT_LIVE_API_KEY;
};
  
const getBaseName = () => {
  return import.meta.env.DEV ? 
    import.meta.env.VITE_BASENAME_DEV :
    import.meta.env.VITE_BASENAME_PROD;
};

const getBackendType = () => {
  return import.meta.env.VITE_BACKEND_TYPE || 'unknown';
};

const getTenantId = () => {
  return import.meta.env.DEV ? 
    import.meta.env.VITE_USERFRONT_TEST_TENANT_ID :
    import.meta.env.VITE_USERFRONT_LIVE_TENANT_ID;
}

const getMode = () => {
  return import.meta.env.DEV ? 'test' : 'live';
};

export const tenantId: string = getTenantId();
export const apiKey: string = getApiKey();
export const basename: string = getBaseName();
export const backendType: string = getBackendType();
export const mode: string = getMode();
