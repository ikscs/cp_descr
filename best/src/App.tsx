import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('Header');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', width: '100%' }}>
        <Sidebar onSelectComponent={setSelectedComponent} />
        <ContentArea selectedComponent={selectedComponent} />
      </div>
    </div>
  );
}

export default App;