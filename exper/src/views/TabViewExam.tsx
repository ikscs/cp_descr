// import React, { useState } from 'react';
import TabView from "./TabView";
import { TabProvider, /*useTabContext*/ } from './TabContext';
import Tab1Component from "./Tab1Component";
import Tab2Component from "./Tab2Component";
import Tab3Component from "./Tab3Component";
import GridView from './GridView';
import Container from '../components/Container';
import App from '../App';

// const Tab1Component: React.FC = () => {
//   const { tab1State, setTab1State } = useTabContext();
//   return (
//     <div>
//       <p>{tab1State}</p>
//       <button onClick={() => setTab1State('Updated Content 1')}>Update Content</button>
//     </div>
//   );
// };

// const Tab2Component: React.FC = () => {
//   const { tab2State, setTab2State } = useTabContext();
//   return (
//     <div>
//       <p>{tab2State}</p>
//       <button onClick={() => setTab2State('Updated Content 2')}>Update Content</button>
//     </div>
//   );
// };

// const Tab3Component: React.FC = () => {
//   const { tab3State, setTab3State } = useTabContext();
//   return (
//     <div>
//       <p>{tab3State}</p>
//       <button onClick={() => setTab3State('Updated Content 3')}>Update Content</button>
//     </div>
//   );
// };

export default function TabViewExam() {
  const tabs = [
    { title: 'Tab 1', index: '1', component: Tab1Component },
    { title: 'Tab 2', index: '2', component: Tab2Component },
    { title: 'Tab 3', index: '3', component: Tab3Component },
    { title: 'Grid', index: '4', component: GridView },
    { title: 'Container', index: 'i5', component: Container },
    { title: 'App', index: 'i5', component: App },
  ];

  return (
    <TabProvider>
      <TabView 
        tabs={tabs}
      />
    </TabProvider>
  );
}
