import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// 1. Define the type for the context value
interface TenantContextType {
  childTenantId: string | null; // Can be null until set
  setChildTenantId: Dispatch<SetStateAction<string | null>>; // Function to set the ID
}

// 2. Create the context with an initial value of undefined
// We'll add a check in the hook to ensure it's used within the provider
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// 3. Create the Provider component
interface TenantProviderProps {
  children: ReactNode; // Type for React children elements
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  // Use useState to store the tenant ID
  const [childTenantId, setChildTenantId] = useState<string | null>(null); // Initial value is null

  // The value that will be passed down via context
  const value = { childTenantId, setChildTenantId };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

// 4. Create a custom hook for easy access to the context
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    // This error will be thrown if the hook is used outside of a TenantProvider
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// 5. (Optional) Export a hook to get only the ID if the setter function is not needed
export const useChildTenantId = (): string | null => {
    return useTenant().childTenantId;
}