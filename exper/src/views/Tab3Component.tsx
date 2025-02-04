import React from 'react';
import { useTabContext } from './TabContext';

export interface Tab3State {
  content: string;
}

const Tab3Component: React.FC = () => {
  const { tab3State, setTab3State } = useTabContext();

  return (
    <div>
      <p>{tab3State.content}</p>
      <button onClick={() => setTab3State({ content: 'Updated Content 3' })}>Update Content</button>
    </div>
  );
};

export default Tab3Component;
