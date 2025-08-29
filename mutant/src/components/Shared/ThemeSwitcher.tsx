import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  SxProps,
  Theme,
  CircularProgress, // Для индикатора загрузки
  FormHelperText // Для отображения ошибок
} from '@mui/material';
import { useThemeSwitcher } from '../themes/DbThemeContext';

interface ThemeSwitcherProps {
  sx?: SxProps<Theme>;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ sx }) => {
  const { t } = useTranslation();
  const { currentThemeName, setThemeName, availableThemes, isLoadingThemes, themeError } = useThemeSwitcher();

  const handleChangeTheme = (event: SelectChangeEvent<string>) => {
    const newTheme = event.target.value;
    setThemeName(newTheme);
  };

  if (isLoadingThemes) {
    return (
      <FormControl variant="outlined" size="small" sx={sx}>
        <CircularProgress size={24} />
        <InputLabel htmlFor="theme-loading-label">{t('loading_themes')}</InputLabel>
      </FormControl>
    );
  }

  return (
    <FormControl variant="outlined" size="small" sx={sx} error={!!themeError}>
      <InputLabel id="theme-select-label">{t('theme')}</InputLabel>
      <Select
        labelId="theme-select-label"
        id="theme-select"
        value={currentThemeName}
        onChange={handleChangeTheme}
        label={t('theme')}
        sx={{ color: 'inherit' }}
        disabled={availableThemes.length === 0} // Отключаем, если нет доступных тем
      >
        {availableThemes.length > 0 ? (
          availableThemes.map((theme) => (
            <MenuItem key={theme} value={theme}>
              {t(theme)}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="" disabled>
            {t('no_themes_available')}
          </MenuItem>
        )}
      </Select>
      {themeError && <FormHelperText>{t('theme_load_error')}: {themeError}</FormHelperText>}
    </FormControl>
  );
};

export default ThemeSwitcher;