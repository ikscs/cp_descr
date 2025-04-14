// src/components/LocalizedTypography.tsx
import React from 'react';
import { Typography as MuiTypography, TypographyProps } from '@mui/material';
import { useLocalization, InterpolationValues } from '../localization/LocalizationContext';

// Определяем пропсы для нашего компонента:
// Берем все пропсы от стандартного Typography,
// убираем 'children' (т.к. текст будет браться из перевода),
// добавляем обязательный 'tKey' (ключ перевода)
// и необязательный 'values' для интерполяции.
type LocalizedTypographyProps = Omit<TypographyProps, 'children'> & {
  tKey: string;
  values?: InterpolationValues;
};

export const LocalizedTypography: React.FC<LocalizedTypographyProps> = ({
  tKey,
  values,
  ...rest // Собираем все остальные пропсы Typography (variant, sx, color, etc.)
}) => {
  const { translate } = useLocalization(); // Получаем функцию перевода из контекста

  const translatedText = translate(tKey, values); // Получаем переведенный текст

  // Рендерим стандартный Typography, передавая ему переведенный текст
  // и все остальные пропсы, которые были переданы в LocalizedTypography
  return (
    <MuiTypography {...rest}>
      {translatedText}
    </MuiTypography>
  );
};
