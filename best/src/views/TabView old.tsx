import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
// import AppPanel1 from '../AppPanel1.tsx';
// import AppPanel2 from '../AppPanel2.tsx';
// import AppPanel3 from '../AppPanel3.tsx';
// import AppPanel4 from '../AppPanel4.tsx';
// import AppPanelDgRun from './AppPanelDgRun.tsx';

export default () => (
    <Tabs>
      <TabList>
        <Tab>Запит</Tab>
        <Tab>Запит 2</Tab>
        <Tab>TreeView</Tab>
        <Tab>TreeView TEST</Tab>
        <Tab>Комбо-дерево-грид</Tab>
      </TabList>
  
      <TabPanel>
        {/* <h2>Any content 1</h2> */}
        {/* <AppPanel1/> */}
      </TabPanel>
      
      <TabPanel>
        {/* <AppPanelDgRun url='https://rise.theweb.place/back/projects.php'/> */}
      </TabPanel>

      <TabPanel>
        {/* <h2>Any content 2</h2> */}
        {/* <AppPanel2/> */}
      </TabPanel>
      
      <TabPanel>
        {/* <AppPanel3/> */}
      </TabPanel>
      
      <TabPanel>
        {/* <AppPanel4/> */}
      </TabPanel>
      
    </Tabs>
  );
  