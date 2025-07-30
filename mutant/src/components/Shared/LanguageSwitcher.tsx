// src/components/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  SxProps,
  Theme
} from '@mui/material';

interface LanguageSwitcherProps {
  /**
   * Стили для корневого компонента FormControl.
   * Можно использовать для регулирования ширины или отступов.
   */
  sx?: SxProps<Theme>;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ sx }) => {
  const { i18n, t } = useTranslation(); // Получаем и t

  const handleChangeLanguage = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    console.log('Attempting to change language to:', newLang);
    i18n.changeLanguage(newLang);
    console.log('Current i18n language after change:', i18n.language);
  };

  return (
    <FormControl variant="outlined" size="small" sx={sx}>
      <InputLabel id="language-select-label">{t('language')}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={i18n.language} // Текущий активный язык
        onChange={handleChangeLanguage}
        label={t('language')}
        sx={{ color: 'inherit' }}
      >
            <MenuItem value="uk">{t('ukrainian')}</MenuItem>
            <MenuItem value="en">{t('english')}</MenuItem>
            <MenuItem value="pl">{t('polish')}</MenuItem>

        {/* Добавьте другие языки по мере необходимости */}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;