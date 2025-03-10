import React from 'react';
import Typography from '@mui/material/Typography';

const MainView: React.FC = () => {
  return (
    <div>
      <Typography variant="h4">Добро пожаловать!</Typography>
      <Typography variant="body1">Это главная страница вашего приложения.</Typography>
      {/* Добавьте здесь остальное содержимое */}
    </div>
  );
};

export default MainView;