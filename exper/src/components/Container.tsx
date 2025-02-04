// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/Container.tsx
import React from 'react';
import InnerHeader from './InnerHeader';
import InnerFooter from './InnerFooter';
import styles from './Container.module.css';

const Container: React.FC = () => {
  return (
    <div className={styles.container}>
      <InnerHeader />
      <div className={styles.content}>
        {/* Здесь может быть любой контент */}
      </div>
      <InnerFooter />
    </div>
  );
};

export default Container;