import React, { useState } from 'react';
import { Button, ThemeProvider, createTheme, PaletteColorOptions } from '@mui/material';

// Определение двух тем
const theme1 = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Синий
    },
  },
});

const theme2 = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // Красный
    },
  },
});

function ThemeToggleButton2() {
  const [useTheme1, setUseTheme1] = useState(true);

  const handleClick = () => {
    setUseTheme1(!useTheme1);
  };

  const currentTheme = useTheme1 ? theme1 : theme2;

  return (
    <ThemeProvider theme={currentTheme}>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Сменить тему
      </Button>
    </ThemeProvider>
  );
}

export default ThemeToggleButton2;