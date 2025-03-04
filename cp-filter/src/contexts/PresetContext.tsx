import React, { createContext, useContext, useState, ReactNode } from 'react';

interface IPresetContext {
  preset: string; setPreset: React.Dispatch<React.SetStateAction<string>>;
  manufGridRows: any[];  setManufGridRows: (a: any[])=>void;
  manufGridCols: any[];  setManufGridCols: (a: any[])=>void;
  manufGridRowsSelected: Set<number>;  setManufGridRowsSelected: (set_: Set<number>)=>void;
  articleGridRows: any[];  setArticleGridRows: (a: any[])=>void;
  articleGridCols: any[];  setArticleGridCols: (a: any[])=>void;
  articleGridRowsSelected: Set<number>;  setArticleGridRowsSelected: (set_: Set<number>)=>void;
  articleInvert: boolean; setArticleInvert: React.Dispatch<React.SetStateAction<boolean>>;
  nameGridRows: any[];  setNameGridRows: (a: any[])=>void;
  nameGridCols: any[];  setNameGridCols: (a: any[])=>void;
  nameGridRowsSelected: Set<number>;  setNameGridRowsSelected: (set_: Set<number>)=>void;
  presetDataSource: string; setPresetDataSource: React.Dispatch<React.SetStateAction<string>>;
  autostart: boolean; setAutostart: React.Dispatch<React.SetStateAction<boolean>>;
  presetQuery: string; setPresetQuery: React.Dispatch<React.SetStateAction<string>>;
}

const PresetContext = createContext<IPresetContext | undefined>(undefined);

export const PresetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preset, setPreset] = useState<string>('*');
  const [manufGridRows, setManufGridRows] = useState<any[]>([]) 
  const [manufGridCols, setManufGridCols] = useState<any[]>([]) 
  const [manufGridRowsSelected, setManufGridRowsSelected] = useState<Set<number>>(new Set())
  const [articleGridRows, setArticleGridRows] = useState<any[]>([]) 
  const [articleGridCols, setArticleGridCols] = useState<any[]>([]) 
  const [articleGridRowsSelected, setArticleGridRowsSelected] = useState<Set<number>>(new Set())
  const [articleInvert, setArticleInvert] = useState<boolean>(false);
  const [nameGridRows, setNameGridRows] = useState<any[]>([]) 
  const [nameGridCols, setNameGridCols] = useState<any[]>([]) 
  const [nameGridRowsSelected, setNameGridRowsSelected] = useState<Set<number>>(new Set())
  const [presetDataSource,setPresetDataSource] = useState<string>('');
  const [autostart, setAutostart] = useState<boolean>(false);
  const [presetQuery, setPresetQuery] = useState<string>('');

  return (
    <PresetContext.Provider value={{ 
        preset, setPreset,
        manufGridRows, setManufGridRows,
        manufGridCols, setManufGridCols,
        manufGridRowsSelected, setManufGridRowsSelected,
        articleGridRows, setArticleGridRows,
        articleGridCols, setArticleGridCols,
        articleGridRowsSelected, setArticleGridRowsSelected,
        articleInvert, setArticleInvert,
        nameGridRows, setNameGridRows,
        nameGridCols, setNameGridCols,
        nameGridRowsSelected, setNameGridRowsSelected,
        presetDataSource,setPresetDataSource,
        autostart, setAutostart,
        presetQuery, setPresetQuery,
      }}>
      {children}
    </PresetContext.Provider>
  );
};

export const usePresetContext = () => {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePresetContext must be used within a PresetProvider');
  }
  return context;
};

export const dataSourceOptions = [
  {label: 'Все субъекты', value:'cp3.vcp_product_org'},
  {label: 'ikscs', value:'cp3.ikscs'},
  {label: 'cp', value:'cp3.vcp_product_org_rated'},
]
