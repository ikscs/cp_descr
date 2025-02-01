import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface ITabDescription {
  title: string;
  index: string;
  // component: () => JSX.Element;
  component: React.FC;
}

interface ITabView {
  tabs: ITabDescription[];
}

const TabView = (props: ITabView) => {
  return (
    <Tabs>
      <TabList>
        {props.tabs.map((tab, index) => (
          <Tab key={index} tabIndex={index.toString()}>{tab.title}</Tab>
        ))}
      </TabList>
      {props.tabs.map((tab, index) => (
        <TabPanel key={index}>
          <tab.component />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabView;
