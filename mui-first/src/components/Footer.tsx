import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ContactsView from './ContactsView';
import SendEmail from './SendEmail'; // Добавляем импорт

const Footer: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [sendEmailOpen, setSendEmailOpen] = useState(false); // Добавляем состояние

  const handleContactsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleContactsClose = () => {
    setAnchorEl(null);
  };

  const handleSendEmailClick = () => {
    setSendEmailOpen(true);
  };

  const handleSendEmailClose = () => {
    setSendEmailOpen(false);
  };

  return (
    <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, width: '100%' }}>
      <Toolbar>
        <Typography variant="body2" color="inherit" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {'© '}
          {new Date().getFullYear()}
          {' '}
          Название вашего приложения
          {'.'}
        </Typography>
        <Typography variant="subtitle1" color="inherit" sx={{ textAlign: 'center' }}>
          <span style={{ cursor: 'pointer' }} onClick={handleContactsClick}>Контакты</span> |
          <span style={{ cursor: 'pointer' }} onClick={handleSendEmailClick}> Обратная связь</span> | Помощь | Условия использования
        </Typography>
      </Toolbar>
      <ContactsView anchorEl={anchorEl} onClose={handleContactsClose} />
      <SendEmail open={sendEmailOpen} onClose={handleSendEmailClose} /> {/* Добавляем SendEmail */}
    </AppBar>
  );
};

export default Footer;