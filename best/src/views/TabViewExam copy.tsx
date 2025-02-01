import { useState } from "react";

import TabView from "./TabView";
import GridView from "./GridView";
import Container from "../components/Container";
import App from "../App";

const Tab1Component = () => <div>Content 1</div>;
const Tab2Component = () => <div>Content 2</div>;
const Tab3Component = () => {
  const [state, setState] = useState('Content 3');
  console.log('Tab3Component state', state);
  return (
    <div>
      <p>{state}</p>
      <button onClick={() => setState('Updated Content 3')}>Update Content</button>
    </div>
  );
};

export default function TabViewExam() {
  const tabs = [
    { title: 'Tab 1', index: '1', component: Tab1Component },
    { title: 'Tab 2', index: '2', component: Tab2Component },
    { title: 'Tab 3', index: '3', component: Tab3Component },
    { title: 'Grid', index: '4', component: GridView as any },
    { title: 'Cntnr', index: 'i5', component: Container as any },
    { title: 'App', index: 'i5', component: App as any },
  ];

  return (<TabView tabs={tabs}/>);
}
