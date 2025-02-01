import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface ITabDescription {
  title: string;
  index: string;
  component: () => JSX.Element;
}

interface ITabView {
  children: ITabDescription[];
}

const TabView = (props: ITabView) => {
  return (
    <Tabs>
      <TabList>
        {props.children.map((child, index) => (
          <Tab key={index} tabIndex={index.toString()}>{child.title}</Tab>
        ))}
      </TabList>
      {props.children.map((child, index) => (
        <TabPanel key={index}>
          <child.component />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabView;
