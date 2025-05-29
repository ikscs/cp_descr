import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm, SignupForm, PasswordResetForm } from '@userfront/react';
import { Box, Typography, Paper } from '@mui/material';

interface AppNewbieProps {
  appTitle: string;
}

const AppNewbie: React.FC<AppNewbieProps> = ({ appTitle }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="grey.100"
      padding={2}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {appTitle}
        </Typography>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/reset" element={<PasswordResetForm />} />
          {/* Если пользователь не аутентифицирован и пытается перейти по другому пути,
              перенаправляем его на страницу входа.
              Это особенно полезно, если AppNewbie рендерится для всех путей,
              когда пользователь не вошел в систему. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Paper>
      <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>
        © {new Date().getFullYear()} {appTitle}. Всі права захищено.
      </Typography>
    </Box>
  );
};

export default AppNewbie;