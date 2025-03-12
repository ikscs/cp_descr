import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Typography, IconButton, InputAdornment, Tooltip } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface LoginFormProps {
  open: boolean;
  onLogin: (login: string, password: string, errorCallback: (error: string) => void) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ open, onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!login) {
      setError('Login cannot be empty');
      return;
    }
    if (!password) {
      setError('Password cannot be empty');
      return;
    }
    setError('');
    onLogin(login, password, setError);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button onClick={handleLogin} variant="contained" color="primary">
          Login
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LoginForm;