// filepath: /d:/dvl/ikscs/react/vp-descr/best/src/components/Sidebar.tsx
import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC<{ onSelectComponent: (component: string) => void }> = ({ onSelectComponent }) => {
  const components = ['Header', 'Footer', 'App', 'Container', 'Grid', 'GridCombo', 'Tabs', 'Tabs2', 'PropEdit', ];

  return (
    <div className={styles.sidebar}>
      <ul>
        {components.map((component) => (
          <li key={component} onClick={() => onSelectComponent(component)}>
            {component}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;