import React, { useState } from 'react';
import TabView from "./TabView2";
import Tab1Component from "./Tab1Component";
import Tab2Component from "./Tab2Component";
import Tab3Component from "./Tab3Component";
import { TabProvider } from './TabContext';

export default function TabViewExam() {
  const [tabs, setTabs] = useState([
    { title: 'Tab 1', index: '1', component: Tab1Component, closable: true },
    { title: 'Tab 2', index: '2', component: Tab2Component, closable: false },
    { title: 'Tab 3', index: '3', component: Tab3Component, closable: true },
  ]);

  const addTab = (tab: { title: string; index: string; component: React.FC; closable: boolean }) => {
    setTabs([...tabs, tab]);
  };

  return (
    <TabProvider>
      <TabView 
        tabs={tabs}
        addTab={addTab}
      />
    </TabProvider>
  );
}
