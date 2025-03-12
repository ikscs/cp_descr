import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const DashboardView: React.FC = () => {
  return (
    <div>
      <Typography variant="h4">Панель управления</Typography>
      <Typography variant="body1">Добро пожаловать на панель управления!</Typography>
      <Box sx={{ marginTop: '20px' }}>
        <video src="/Google_Mio_SizzleGIF_3840x2160.mp4" autoPlay loop width="640" height="360" />
      </Box>
    </div>
  );
};

export default DashboardView;