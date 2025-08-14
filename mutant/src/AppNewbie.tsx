import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm, SignupForm, PasswordResetForm } from '@userfront/react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { tenantId } from './globals_VITE';
import AdvertsView from './pages/adverts/AdvertsView';
// import { sendResetPasswdEmail } from './api/updateUser';

interface AppNewbieProps {
  appTitle: string;
}

const AppNewbie: React.FC<AppNewbieProps> = ({ appTitle }) => {
  const [showLogin, setShowLogin] = useState(true);
  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  const navigate = useNavigate();

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
          <Route path="/login1" element={<><AdvertsView /></>}/>
          {/* <Route path="/resetPasswd" element={<PasswordResetForm />} /> */}
          <Route path="/login" element={
            <>
              {showLogin ? <LoginForm /> : <SignupForm />}
              <Button onClick={toggleForm} sx={{ marginTop: '10px' }}>
                {/* {showLogin ? 'Реєстрация' : 'Війти'} - {useUserfront()?.tenantId} Показываем ID тенанта из Userfront */}
                {/* {showLogin ? 'Реєстрация' : 'Війти'} - {tenantId} */}
                {showLogin ? 'Реєстрація' : 'Увійти'}
              </Button>
              <Button onClick={() => navigate('reset')} sx={{ marginTop: '10px' }}>
                Забыли пароль?
              </Button>
              {/* Optionally add a link to the reset form */}
              {/* <Link to="/reset">Forgot Password?</Link> */}
            </>
          } />
          {/* <Route path="/login" element={<LoginForm />} /> */}
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