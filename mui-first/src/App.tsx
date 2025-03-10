import { useState } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Footer from './components/Footer';
import MainView from './components/MainView';
import Box from '@mui/material/Box';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardView from './views/DashboardView';
import ReportsView from './views/ReportsView'; // Импортируем 

function App() {
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginFormClose = () => {
    setIsLoginFormOpen(false);
  };

  const handleLogin = (login: string, password: string, errorCallback: (error: string) => void) => {
    if (login === 'test' && password === 'test') {
      setIsLoggedIn(true);
      handleLoginFormClose();
    } else {
      errorCallback('Invalid login or password');
    }
  };

  return (
    <BrowserRouter>
      <Header />
      <Box sx={{ marginTop: '64px', paddingBottom: '100px' }}>
        <Routes>
          <Route path="/" element={isLoggedIn ? <MainView /> : <LoginForm open={isLoginFormOpen} onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/reports" element={<ReportsView />} />
        </Routes>
      </Box>
      <Footer />
    </BrowserRouter>
  );
}

export default App;