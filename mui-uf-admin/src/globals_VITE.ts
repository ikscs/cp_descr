const getApiKey = () => {
    if (import.meta.env.VITE_ENV === 'production') {
      return import.meta.env.VITE_USERFRONT_LIVE_API_KEY || '';
    } else {
      return import.meta.env.VITE_USERFRONT_TEST_API_KEY || '';
    }
  };
  
  const getBaseName = () => {
    if (import.meta.env.VITE_ENV === 'production') {
      return import.meta.env.VITE_BASENAME_PROD || '';
    } else {
      return import.meta.env.VITE_BASENAME_DEV || '';
    }
  };

  export const tenantId = import.meta.env.VITE_USERFRONT_TENANT_ID;
  export const apiKey = getApiKey();
  export const basename = getBaseName();