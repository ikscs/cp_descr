import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

interface MainMenuProps {
  menuItems: { text: string; path: string; icon?: React.ReactElement }[];
}

const MainMenu: React.FC<MainMenuProps> = ({ menuItems }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Главное меню">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleToggle}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Drawer open={open} onClose={handleClose}>
        <Box p={2}> {/* Added padding */}
          <Typography variant="h6" gutterBottom>
            Главное меню
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleClose}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default MainMenu;
