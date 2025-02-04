import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import SidebarComponent from './components/SidebarComponent';
import ModalExam from './views/ModalExam';

const App: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState('Header');
  
  return (
    <div>
      <SidebarComponent />
      <div style={{ marginLeft: '250px' }}>
        {/* Остальное содержимое вашего приложения */}
        <h1>My App</h1>
        <p>Welcome to my application!</p>
        <ModalExam/>
     <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', width: '100%' }}>
        <Sidebar onSelectComponent={setSelectedComponent} />
        <ContentArea selectedComponent={selectedComponent} />
      </div>
    </div> 
      </div>
    </div>
  );
};

export default App;