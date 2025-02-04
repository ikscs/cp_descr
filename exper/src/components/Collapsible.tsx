import { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
// import { Home } from '@mui/icons-material';
import './SidebarStyles.css';

export default () => {
    const [collapsed, setCollapsed] = useState(false);

    const handleToggleSidebar = () => {
      setCollapsed(!collapsed);
    };    
    
    return (
        <Sidebar collapsed={collapsed} style={{top: 0}}>
            <button 
                onClick={handleToggleSidebar}>{collapsed ? 'Show' : 'Hide'}</button>
            <Menu>
            {/* <MenuItem icon={<Home/>}> Home </MenuItem> */}
                <MenuItem> Home </MenuItem>
                <SubMenu label="Charts">
                    <MenuItem> Pie charts </MenuItem>
                    <MenuItem> Line charts </MenuItem>            
                </SubMenu>
                <MenuItem> Documentation </MenuItem>
                <MenuItem> Calendar </MenuItem>
            </Menu>
        </Sidebar>
    )
}

