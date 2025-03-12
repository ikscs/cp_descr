import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import IconButtonExt from './IconButtonExt';

interface HeaderProps {
  onLogout: () => void;
  login: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, login }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1100, top: 0 }}>
      <Toolbar>
        <IconButtonExt
          tooltipTitle="Открыть меню"
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButtonExt>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Название вашего приложения
        </Typography>
        <Typography variant="body1" sx={{ mr: 2 }}>{login}</Typography>
        <IconButtonExt tooltipTitle="Выйти" color="inherit" onClick={handleLogout} edge="end">
          <LogoutIcon />
        </IconButtonExt>
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
          sx={{
            mt: '45px',
            '& .MuiPaper-root': {
              backgroundColor: 'inherit',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            },
          }}
        >
          <MenuItem onClick={handleClose} component={Link} to="/" sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}>Начальная страница</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/dashboard" sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}>Панель управления</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/reports" sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}>Отчеты</MenuItem>
          <MenuItem onClick={handleClose} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}>Настройки</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;