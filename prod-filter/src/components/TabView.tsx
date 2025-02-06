import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface ITabDescription {
  title: string;
  index: string;
  component: React.FC;
}

interface ITabView {
  tabs: ITabDescription[];
}

const TabView: React.FC<ITabView> = ({ tabs }) => {
  return (
    <Tabs>
      <TabList>
        {tabs.map((tab, index) => (
          <Tab key={index} tabIndex={index.toString()}>{tab.title}</Tab>
        ))}
      </TabList>
      {tabs.map((tab, index) => (
        <TabPanel key={index}>
          <tab.component />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabView;
