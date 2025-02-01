import React from 'react';
import { useTabContext } from './TabContext';

export interface Tab2State {
  content: string;
}

const Tab2Component: React.FC = () => {
  const { tab2State, setTab2State } = useTabContext();

  return (
    <div>
      <p>{tab2State.content}</p>
      <button onClick={() => setTab2State({ content: 'Updated Content 2' })}>Update Content</button>
    </div>
  );
};

export default Tab2Component;
