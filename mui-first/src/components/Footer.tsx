import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, position: 'fixed', bottom: 0, width: '100%', zIndex: 1100 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          Название вашего приложения
          {'.'}
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
          Контакты | Помощь | Обратная связь | Условия использования
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;