// filepath: /D:/dvl/ikscs/react/vp-descr/best/src/components/Header.tsx
import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <button className={styles.leftButton}>Left Button</button>
      <button className={styles.rightButton}>Right Button</button>
    </div>
  );
};

export default Header;