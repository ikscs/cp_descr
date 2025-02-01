import React from 'react';
import { useTabContext } from './TabContext';

export interface Tab1State {
  content: string;
}

const Tab1Component: React.FC = () => {
  const { tab1State, setTab1State } = useTabContext();

  return (
    <div>
      <p>{tab1State.content}</p>
      <button onClick={() => setTab1State({ content: 'Updated Content 1' })}>Update Content</button>
    </div>
  );
};

export default Tab1Component;
