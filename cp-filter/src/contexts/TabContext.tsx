// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { IGridViewState, gridRowsInitial } from './GridView';

// interface TabContextType {
//   gridViewState: IGridViewState;
//   setGridViewState: React.Dispatch<React.SetStateAction<IGridViewState>>;
//   filterViewState: IGridViewState;
//   setFilterViewState: React.Dispatch<React.SetStateAction<IGridViewState>>;
// }

// const TabContext = createContext<TabContextType | undefined>(undefined);

// export const TabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   // const [tab1State, setTab1State] = useState<Tab1State>({ content: 'Content 1' });
//   // const [tab2State, setTab2State] = useState<Tab2State>({ content: 'Content 2' });
//   // const [tab3State, setTab3State] = useState<Tab3State>({ content: 'Content 3' });
//   const [gridViewState, setGridViewState] = useState<IGridViewState>({ rows: gridRowsInitial });

//   return (
//     <TabContext.Provider value={{ 
//         // tab1State, setTab1State, 
//         // tab2State, setTab2State, 
//         // tab3State, setTab3State,
//         gridViewState, setGridViewState, 
//         filterViewState, setFilterViewState,
//       }}>
//       {children}
//     </TabContext.Provider>
//   );
// };

// export const useTabContext = () => {
//   const context = useContext(TabContext);
//   if (!context) {
//     throw new Error('useTabContext must be used within a TabProvider');
//   }
//   return context;
// };
