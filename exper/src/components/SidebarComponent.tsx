// SidebarComponent.tsx
import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import './SidebarStyles.css';

const SidebarComponent: React.FC = () => {
    const [collapsed, setCollapsed] = useState(true);

    const handleToggleSidebar = () => {
        setCollapsed(!collapsed);
    };
    const img = (png: string) => {
        const src = "/src/assets/" + png
        return (
            <img src={src} style={{ width: '12px', height: '12px' }} />      
        )
    }

    return (
      <div className="sidebar-container">
        <Sidebar collapsed={collapsed}>
        {/* <button onClick={handleToggleSidebar}>{collapsed ? 'Show' : 'Hide'}</button> */}
        <button onClick={handleToggleSidebar}>{img("close.png")}</button>
        <Menu>
            <MenuItem icon={ <img src="/src/assets/close.png"
              alt="Close"
              style={{ width: '12px', height: '12px' }}
            />}> Домой </MenuItem>
            <SubMenu label="Charts">
              <MenuItem> Pie charts </MenuItem>
              <MenuItem> Line charts </MenuItem>
            </SubMenu>
            <MenuItem icon={img("close.png")}> Documentation </MenuItem>
            <MenuItem> Calendar </MenuItem>
          </Menu>
        </Sidebar>
      </div>
    );
};

export default SidebarComponent;
