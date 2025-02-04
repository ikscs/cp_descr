import React, { createContext, useState, ReactNode, useContext, Dispatch, SetStateAction } from 'react';

interface UpsertData {
  rowKey: string;
  colKey: string;
  value: number;
}

interface UpsertContextProps {
  upsertCount: number;  
  setUpsertCount: Dispatch<SetStateAction<number>>;
  rowHeaders: string[];
  setRowHeaders: Dispatch<SetStateAction<string[]>>;
  columnHeaders: string[];
  setColumnHeaders: Dispatch<SetStateAction<string[]>>;
  upsertData: UpsertData[];
  setUpsertData: Dispatch<SetStateAction<UpsertData[]>>;
  referenceData: { [key: number]: string };
  setReferenceData: Dispatch<SetStateAction<{ [key: number]: string }>>;
}

const UpsertContext = createContext<UpsertContextProps | undefined>(undefined);

export const UpsertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [upsertCount, setUpsertCount] = useState<number>(0);
  const [rowHeaders, setRowHeaders] = useState<string[]>(['ua', 'ru', 'en' ]);
  const [columnHeaders, setColumnHeaders] = useState<string[]>(['name', 'description', ]);
  const [upsertData, setUpsertData] = useState<UpsertData[]>([
    { rowKey: 'ua', colKey: 'name',        value: 9 },
    { rowKey: 'ua', colKey: 'description', value: 9 },
    { rowKey: 'ru', colKey: 'name',        value: 9 },
    { rowKey: 'ru', colKey: 'description', value: 9 },
    { rowKey: 'en', colKey: 'name',        value: 9 },
    { rowKey: 'en', colKey: 'description', value: 9 },
  ]);
  const [referenceData, setReferenceData] = useState<{ [key: number]: string }>({
    0: '0 - unknown',
    1: '1 - not translated',
    2: '2 - translated',
    3: '3 - approved',
    4: '4 - disabled',
    5: '5 - translated force',
    9: 'Не изменять',
  });

  return (
    <UpsertContext.Provider value={{ upsertCount, setUpsertCount, rowHeaders, setRowHeaders, columnHeaders, setColumnHeaders, upsertData: upsertData, setUpsertData: setUpsertData, referenceData, setReferenceData }}>
      {children}
    </UpsertContext.Provider>
  );
};

export const useUpsert = () => {
  const context = useContext(UpsertContext);
  if (!context) {
    throw new Error('useUpsert must be used within a UpsertProvider');
  }
  return context;
};
