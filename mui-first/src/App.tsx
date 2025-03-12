import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Footer from './components/Footer';
import MainView from './components/MainView';
import Box from '@mui/material/Box';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardView from './views/DashboardView';
import ReportsView from './views/ReportsView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLogin, setUserLogin] = useState('');

  const handleLoginFormClose = () => {
    setIsLoginFormOpen(false);
  };

  const handleLogin = (login: string, password: string, errorCallback: (error: string) => void) => {
    if (login === 'test' && password === 'test') {
      setIsLoggedIn(true);
      setUserLogin(login);
      handleLoginFormClose();
    } else {
      errorCallback('Invalid login or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLoginFormOpen(true);
    setUserLogin('');
  };

  return (
    <BrowserRouter>
      <Header onLogout={handleLogout} login={userLogin} />
      <Box
        sx={{
          backgroundImage: 'url(/slide_cctv.jpg)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Routes>
          <Route path="/" element={isLoggedIn ? <MainView /> : <LoginForm open={isLoginFormOpen} onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <DashboardView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ReportsView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
      <Footer />
    </BrowserRouter>
  );
}

export default App;