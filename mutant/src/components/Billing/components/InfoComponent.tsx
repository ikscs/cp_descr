import React from 'react';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown'; // Импортируем ReactMarkdown
import infoText from '../../../../doc/PublicAgreement/doc1.md?raw';

const InfoComponent: React.FC = () => {
  return (
    <Box
      sx={{
        maxHeight: '400px', // Установите желаемую максимальную высоту
        overflowY: 'auto', // Включите вертикальную прокрутку
        p: 2, // Добавьте внутренний отступ для красоты
        border: '1px solid #ccc', // Опционально: добавьте границу для наглядности
      }}
    >
      {/* <pre>{infoText}</pre> */}
      <ReactMarkdown
      components={{
          // Заменяем стандартный <h1> на компонент Typography с вариантом h4
          h1: ({ node, ...props }) => <Typography variant="h4" {...props} />,
          h2: ({ node, ...props }) => <Typography variant="h5" {...props} />,
          h3: ({ node, ...props }) => <Typography variant="h6" {...props} />,
          p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
          li: ({ node, ...props }) => <Typography component="li" {...props} />,
        }}>{infoText}</ReactMarkdown>
    </Box>
  );
};

export default InfoComponent;