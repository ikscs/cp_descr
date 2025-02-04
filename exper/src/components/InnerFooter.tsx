// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/InnerFooter.tsx
import React from 'react';
import Footer from './Footer';
import styles from './InnerFooter.module.css';

const InnerFooter: React.FC = () => {
  return (
    <Footer
      backgroundColor="#ccc"
      sections={[
        { size: '33%' },
        { size: '33%' },
        { size: '33%' },
      ]}
      messages={[
        { section: 0, message: 'Updated InnerFooter Section 1' },
        { section: 2, message: 'Updated InnerFooter Section 3' },
      ]}
    />
  );
};

export default InnerFooter;