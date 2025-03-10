import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Typography } from '@mui/material';

interface LoginFormProps {
  open: boolean;
  onLogin: (login: string, password: string, errorCallback: (error: string) => void) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ open, onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!login) {
      setError('Login cannot be empty');
      return;
    }
    if (!password) {
      setError('Password cannot be empty');
      return;
    }
    setError(''); // Clear previous errors
    onLogin(login, password, setError); // Pass setError callback
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Login Form</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button onClick={handleLogin} variant="contained" color="primary">
          Login
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LoginForm;