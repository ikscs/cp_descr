// Компонент футера приложения, который отображает информацию о компании и версии приложения
import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import packageJson from '../../package.json';
import { useTranslation } from 'react-i18next';

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <Box
      component="footer" // Используем семантический тег footer
      sx={{
        py: 2, // Вертикальный отступ (padding top/bottom)
        px: 2, // Горизонтальный отступ
        mt: 'auto', // Прижимает футер к низу, если основной контент короче высоты экрана (требует flex-контейнера у родителя)
        backgroundColor: (theme) => // Легкий фон для отделения
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        borderTop: '1px solid', // Тонкая линия сверху
        borderColor: 'divider' // Цвет разделителя из темы
      }}
    >
      <Container maxWidth="lg"> {/* Ограничиваем ширину контента футера */}
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {currentYear}
          {' '}
          <Link
            color="inherit"
            href="https://ikscs.in.ua"
            target="_blank"
            rel="noopener noreferrer"
          >            ІК СКС
          </Link>
          {t('footer.copyright')}          
          {' | '}
          {t('footer.version', { version: packageJson.version })}
        </Typography>
        {/* Можно добавить другие ссылки или информацию */}
        {/* <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link color="inherit" href="/privacy">Политика конфиденциальности</Link>
          {' | '}
          <Link color="inherit" href="/terms">Условия использования</Link>
        </Typography> */}
      </Container>
    </Box>
  );
};

export default AppFooter;
