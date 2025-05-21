import React, { createContext, useContext, useMemo, ReactNode, useEffect } from 'react';

export interface CustomerPoint {
  value: number;
  label: string;
}

export interface CustomerData {
  customer?: number;
  point_id?: number;
  points?: CustomerPoint[];
  country?: string;
  city?: string;
}

export interface CustomerContextType {
  customerData: CustomerData | null;
  isLoading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
  children: ReactNode;
  customerData: CustomerData | null;
  isLoading: boolean;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children, customerData, isLoading }) => {
  const contextValue = useMemo(() => {
    if (!customerData) { // If the CustomerProvider receives a null customerData prop
      return {
        customerData: null, // Pass null through if the source is null
        isLoading,
      };
    }
    // Pass customerData as is, ensuring points is an array
    // This assumes customerData prop (from App.tsx state) already has correct types for customer and point_id
    return {
      customerData: { ...customerData, points: customerData.points || [] },
      isLoading,
    };
  }, [customerData, isLoading]);

  // Optional: Add a log here to see when the context value updates
  useEffect(() => {
    console.log('[CustomerContext] Context value updated:', contextValue);
    if (contextValue.customerData) {
      console.log('[CustomerContext] customer type:', typeof contextValue.customerData.customer);
      console.log('[CustomerContext] point_id type:', typeof contextValue.customerData.point_id);
    }
  }, [contextValue]);

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};