// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/ContentArea.tsx
import React from 'react';
import styles from './ContentArea.module.css';
import Header from './Header';
import Footer from './Footer';
import Container from './Container';
// import GridView from '../views/GridView';
import TabViewExam from '../views/TabViewExam';
import TabView2Exam from '../views/TabView2Exam';
import PropertyEditorView from '../views/PropertyEditorView';
import App from '../App';
import GridView from '../views/GridView';
import  { default as Gcw } from '../views/GridComboView';
import { TabProvider } from '../views/TabContext';

const ContentArea: React.FC<{ selectedComponent: string }> = ({ selectedComponent }) => {
  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Header':
        return <Header />;
      case 'Footer':
        return (
          <Footer
            backgroundColor="#ccc"
            sections={[
              { size: '33%' },
              { size: '33%' },
              { size: '33%' },
            ]}
            messages={[
              { section: 0, message: 'Updated Section 1' },
              { section: 2, message: 'Updated Section 3' },
            ]}
          />
        );
      case 'Container':
        return <Container />;
      case 'App':
        return <App />;
      case 'Grid':
        return <GridView width='800px'/>;
      case 'GridCombo':
        return <Gcw width='800px'/>;
      case 'Tabs':
        return <TabViewExam/>;
      case 'Tabs2':
        return <TabView2Exam/>;
      case 'PropEdit':
        return <PropertyEditorView/>;
      default:
        return null;
    }
  };

  return (
    <TabProvider>
    <div className={styles.contentArea}>
      {renderComponent()}
    </div>
    </TabProvider>
  );
};

export default ContentArea;