// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/InnerHeader.tsx
import React from 'react';
import styles from './InnerHeader.module.css';

const InnerHeader: React.FC = () => {
  return (
    <div className={styles.innerHeader}>
      <button className={styles.leftButton}>Left InnerHeader Button</button>
      <button className={styles.rightButton}>Right InnerHeader Button</button>
    </div>
  );
};

export default InnerHeader;