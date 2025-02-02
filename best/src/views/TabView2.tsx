import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface ITabDescription {
  title: string;
  index: string;
  component: React.FC;
  closable: boolean;
}

interface ITabView {
  tabs: ITabDescription[];
  addTab: (tab: ITabDescription) => void;
}

const TabView: React.FC<ITabView> = ({ tabs, addTab }) => {
  const [openTabs, setOpenTabs] = useState(tabs);
  const [newTabTitle, setNewTabTitle] = useState('');

  const closeTab = (index: string) => {
    setOpenTabs(openTabs.filter(tab => tab.index !== index));
  };

  const handleAddTab = () => {
    const newTab: ITabDescription = {
      title: newTabTitle || `Tab ${openTabs.length + 1}`,
      index: `${openTabs.length + 1}`,
      component: () => <div>New Tab Content</div>,
      closable: true,
    };
    setOpenTabs([...openTabs, newTab]);
    addTab(newTab);
    setNewTabTitle('');
  };

  // https://www.flaticon.com/free-icons/close
  return (
    <div>
      <input
        type="text"
        placeholder="New tab title"
        value={newTabTitle}
        onChange={(e) => setNewTabTitle(e.target.value)}
      />
      <button onClick={handleAddTab}>Add Tab</button>
      <Tabs>
        <TabList>
          {openTabs.map((tab, index) => (
            <Tab key={index} tabIndex={index.toString()}>
              {tab.title}
              {tab.closable && (
                <button
                  onClick={() => closeTab(tab.index)}
                  style={{ marginLeft: '8px', cursor: 'pointer' }}
                  title="Close tab"
                >
                  <img src="/src/assets/close.png" 
                    alt="Close" 
                    style={{ width: '12px', height: '12px' }} 
                  />
                </button>
              )}
            </Tab>
          ))}
        </TabList>
        {openTabs.map((tab, index) => (
          <TabPanel key={index}>
            <tab.component />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabView;
