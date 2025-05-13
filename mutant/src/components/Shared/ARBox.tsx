// src/components/Shared/ARBox.tsx
import React from 'react';
import Box, { type BoxProps } from '@mui/material/Box';

interface ARBoxProps extends Omit<BoxProps, 'aspectRatio'> {
  /** Ширина в пропорции (например, 16) */
  aspectWidth: number;
  /** Высота в пропорции (например, 9) */
  aspectHeight: number;
  /** Дочерние элементы */
  children?: React.ReactNode;
}

/**
 * Компонент Box, который сохраняет заданное соотношение сторон
 * и пытается занять максимальное доступное пространство внутри родителя,
 * не выходя за его пределы (maxWidth: 100%, maxHeight: 100%).
 *
 * Родительский контейнер должен использовать flexbox (`display: 'flex'`)
 * с `justifyContent: 'center'` и `alignItems: 'center'`, чтобы
 * центрировать этот ARBox, когда он не занимает все пространство родителя
 * по одной из осей.
 */
const ARBox: React.FC<ARBoxProps> = ({
  aspectWidth,
  aspectHeight,
  children,
  sx,
  ...rest // Передаем остальные пропсы Box (например, onClick, id и т.д.)
}) => {
  // Проверяем валидность входных данных
  if (aspectWidth <= 0 || aspectHeight <= 0) {
    console.error('ARBox: aspectWidth и aspectHeight должны быть положительными числами.');
    // Можно вернуть null или отобразить ошибку
    return null;
  }

  const aspectRatioValue = `${aspectWidth} / ${aspectHeight}`;

  return (
    <Box
      sx={{
        aspectRatio: aspectRatioValue, // Главное правило для пропорций
        maxWidth: '100%',             // Ограничение по ширине родителя
        maxHeight: '100%',            // Ограничение по высоте родителя
        overflow: 'hidden',           // Обрезаем контент, если он вдруг вылезет
        display: 'flex',              // Используем flex для внутреннего контента
        flexDirection: 'column',      // Располагаем внутренний контент колонкой
        // Позволяем передавать и переопределять стили через sx
        ...sx,
      }}
      {...rest} // Передаем остальные пропсы
    >
      {children}
    </Box>
  );
};

export default ARBox;
