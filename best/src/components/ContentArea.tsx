// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/ContentArea.tsx
import React from 'react';
import styles from './ContentArea.module.css';
import Header from './Header';
import Footer from './Footer';
import Container from './Container';
import GridView from '../views/GridView';
import TabViewExam from '../views/TabViewExam';

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
      case 'Grid':
        return <GridView width='800px'/>;
      case 'Tabs':
        return <TabViewExam/>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.contentArea}>
      {renderComponent()}
    </div>
  );
};

export default ContentArea;