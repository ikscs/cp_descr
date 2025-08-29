// Компонент, который переключает режим
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext, createContext } from 'react';
import { useTranslation } from 'react-i18next';

// Определяем ColorModeContext
// Важно: этот контекст должен быть доступен там, где используется ThemeToggleButton.
// Обычно его определяют в корневом компоненте или в отдельном файле, который импортируется.
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function ThemeToggleButton() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { t } = useTranslation();

  return (
    <Button onClick={colorMode.toggleColorMode}>
      {theme.palette.mode === 'dark' 
        ? t('themeToggle.lightMode') 
        : t('themeToggle.darkMode')}
    </Button>
  );
}