// src/components/Shared/ARBoxA.tsx
import React, { useState, useRef, useEffect, type PropsWithChildren } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';

// Определяем типы для пропсов
interface ARBoxAProps extends PropsWithChildren {
  /** Ширина для расчета соотношения сторон (например, 16) */
  aspectWidth: number;
  /** Высота для расчета соотношения сторон (например, 9) */
  aspectHeight: number;
  /** Минимальная ширина контейнера, при которой применяется соотношение сторон */
  minWidthThreshold: number;
  /** Дополнительные sx-стили для Box */
  sx?: BoxProps['sx'];
  /** Остальные пропсы для Box */
  [key: string]: any; // Позволяет передавать другие стандартные пропсы Box
}

/**
 * Компонент Box, который сохраняет заданное соотношение сторон,
 * пока его ширина больше или равна `minWidthThreshold`.
 * Если ширина становится меньше, соотношение сторон отключается (`auto`),
 * и включается вертикальный скролл (`overflowY: 'auto'`), если контент не помещается.
 *
 * Компонент пытается занять 100% ширины родителя.
 * В режиме сохранения пропорций он также ограничен `maxHeight: '100%'` родителя.
 */
const ARBoxA: React.FC<ARBoxAProps> = ({
  children,
  aspectWidth,
  aspectHeight,
  minWidthThreshold,
  sx,
  ...rest // Собираем остальные пропсы
}) => {
  // Состояние для хранения текущей ширины контейнера
  const [containerWidth, setContainerWidth] = useState<number>(0);
  // Ref для доступа к DOM-элементу контейнера
  const containerRef = useRef<HTMLDivElement>(null);

  // Эффект для отслеживания изменения размера контейнера
  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;

    // Создаем ResizeObserver для отслеживания изменений размера элемента
    const resizeObserver = new ResizeObserver(entries => {
      if (entries && entries.length > 0) {
        const width = entries[0].contentRect.width;
        // Обновляем состояние только если ширина действительно изменилась
        setContainerWidth(prevWidth => (width !== prevWidth ? width : prevWidth));
      }
    });

    // Начинаем наблюдение за элементом
    resizeObserver.observe(currentRef);

    // Функция очистки: прекращаем наблюдение при размонтировании компонента
    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
      resizeObserver.disconnect();
    };
  }, []); // Пустой массив зависимостей

  // Проверяем валидность входных данных
  if (aspectWidth <= 0 || aspectHeight <= 0) {
    console.error('ARBoxA: aspectWidth и aspectHeight должны быть положительными числами.');
    return null; // Или отобразить компонент ошибки
  }

  // Определяем, нужно ли применять соотношение сторон
  const applyAspectRatio = containerWidth >= minWidthThreshold;

  // Рассчитываем значение для CSS свойства aspect-ratio
  const aspectRatioValue = applyAspectRatio
    ? `${aspectWidth} / ${aspectHeight}`
    : 'auto'; // Отключаем соотношение сторон

  // Определяем стили для overflow и height в зависимости от режима
  const dynamicStyles: BoxProps['sx'] = applyAspectRatio
    ? {
        // --- Режим сохранения пропорций (как ARBox) ---
        aspectRatio: aspectRatioValue,
        maxWidth: '100%',  // Ограничиваем ширину родителем (вместо width: '100%')
        // maxHeight: '100%', // Ограничиваем высоту родителем в режиме пропорций
        overflow: 'hidden', // Скрываем любой overflow в режиме пропорций
      }
    : {
        // --- Режим без пропорций (узкий экран) ---
        aspectRatio: 'auto', // Отключаем соотношение сторон
        // height: 'auto',      // Старая версия: Позволяем контенту определять высоту
        // maxHeight: 'none',   // Старая версия: Снимаем ограничение максимальной высоты
        height: '100%',      // Новая версия: Занимаем всю высоту родителя
        overflowY: 'auto', // Включаем вертикальный скролл при необходимости
        overflowX: 'hidden', // Обычно горизонтальный скролл не нужен
      };

  return (
    <Box
      ref={containerRef}
      sx={{
        // Убираем width: '100%' отсюда, так как оно теперь не всегда нужно.
        // В режиме без пропорций ширина будет 100% по умолчанию для block-элемента,
        // а в режиме с пропорциями maxWidth: '100%' сделает свое дело.
        display: 'flex', // Используем flex для управления дочерними элементами
        flexDirection: 'column', // Располагаем контент вертикально
        // Применяем динамические стили
        ...dynamicStyles,
        // Добавляем пользовательские стили sx, позволяя их переопределить
        ...sx,
      }}
      {...rest} // Передаем остальные пропсы (id, onClick и т.д.)
    >
      {/* Дочерние элементы будут рендериться внутри */}
      {/* Для корректной работы скролла, если дочерний элемент один,
          он должен либо сам управлять своей высотой, либо можно добавить
          внутреннюю обертку с flexGrow: 1, если нужно растянуть контент */}
      {children}
    </Box>
  );
};

export default ARBoxA;
