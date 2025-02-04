// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/Footer.tsx
import React from 'react';
import styles from './Footer.module.css';

interface FooterProps {
  backgroundColor: string;
  sections: { size: string }[];
  messages: { section: number; message: string }[];
}

const Footer: React.FC<FooterProps> = ({ backgroundColor, sections, messages }) => {
  const getMessageForSection = (index: number) => {
    const messageObj = messages.find(msg => msg.section === index);
    return messageObj ? messageObj.message : '';
  };

  return (
    <div className={styles.footer} style={{ backgroundColor }}>
      {sections.map((section, index) => (
        <div key={index} className={styles.section} style={{ flexBasis: section.size }}>
          {getMessageForSection(index)}
        </div>
      ))}
    </div>
  );
};

export default Footer;