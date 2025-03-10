import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1100, top: 0 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Название вашего приложения
        </Typography>
        <IconButton color="inherit" onClick={handleLogout} edge="end">
          <LogoutIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: {
              'aria-labelledby': 'basic-button',
            },
          }}
        >
          <MenuItem onClick={handleClose} component={Link} to="/dashboard">Панель управления</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/reports">Отчеты</MenuItem>
          <MenuItem onClick={handleClose}>Настройки</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;