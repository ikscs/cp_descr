// src/components/Shared/ButtonA.tsx
import React from 'react';
import {
    Button,
    CircularProgress,
    Tooltip,
    Box,
    useTheme,
    useMediaQuery,
    ButtonProps,
    Breakpoint, // Import Breakpoint type
} from '@mui/material';

// Определяем пропсы для нашего кастомного компонента
// Наследуемся от стандартных ButtonProps, исключая те, что мы будем обрабатывать особо
interface ButtonAProps extends Omit<ButtonProps, 'startIcon' | 'children' | 'disabled'> {
    startIcon?: React.ReactNode; // Иконка в обычном состоянии
    activeIcon?: React.ReactNode; // Иконка в активном состоянии (например, при загрузке)
    children: React.ReactNode; // Текст кнопки
    isActive?: boolean; // Флаг активного состояния (например, загрузки)
    hideTextOn?: Breakpoint | false; // Брейкпоинт ('xs', 'sm', 'md', 'lg', 'xl') или false, когда скрывать текст. false - никогда не скрывать.
    tooltipText?: string; // Текст для тултипа (по умолчанию используется children)
    disabled?: boolean; // Стандартный disabled проп
}

const ButtonA = React.forwardRef<HTMLButtonElement, ButtonAProps>(
    (
        {
            children,
            startIcon,
            activeIcon = <CircularProgress size={20} color="inherit" />, // Иконка по умолчанию для активного состояния
            isActive = false, // По умолчанию не активно
            hideTextOn = 'sm', // По умолчанию скрываем на 'sm' и меньше
            tooltipText,
            onClick,
            disabled = false,
            sx,
            size = 'medium', // Установим размер по умолчанию, если нужно
            ...rest // Остальные пропсы Button (variant, color и т.д.)
        },
        ref
    ) => {
        const theme = useTheme();
        // Проверяем, нужно ли скрывать текст, только если hideTextOn не false
        const shouldHideText = hideTextOn ? useMediaQuery(theme.breakpoints.down(hideTextOn)) : false;

        // Определяем текущую иконку
        const currentIcon = isActive ? activeIcon : startIcon;

        // Определяем текст кнопки
        const buttonText = shouldHideText ? '' : children;

        // Определяем текст для тултипа (показываем только если текст скрыт)
        const finalTooltipText = shouldHideText ? tooltipText || String(children) : '';

        // Определяем стили для центрирования иконки, когда текст скрыт
        const iconCenteringSx =
            shouldHideText && currentIcon
                ? {
                      minWidth: 'auto', // Убираем минимальную ширину, чтобы кнопка сжалась
                      paddingLeft: size === 'small' ? 0.8 : 1, // Уменьшаем паддинги для компактности
                      paddingRight: size === 'small' ? 0.8 : 1,
                      '& .MuiButton-startIcon': {
                          margin: 0, // Убираем отступы у иконки
                      },
                  }
                : {};

        // Комбинируем переданные sx и наши стили
        const combinedSx = { ...iconCenteringSx, ...sx };

        // Определяем финальное состояние disabled
        const isDisabled = isActive || disabled;

        // Оборачиваем кнопку в Tooltip и Box (для корректной работы тултипа с disabled кнопкой)
        return (
            <Tooltip title={finalTooltipText} arrow>
                {/* Box нужен, чтобы Tooltip корректно работал с disabled элементом */}
                <Box component="span" sx={{ display: 'inline-block' }}>
                    <Button
                        ref={ref} // Передаем ref на внутреннюю кнопку MUI
                        variant="contained" // Можно сделать variant пропсом или оставить по умолчанию
                        onClick={onClick}
                        disabled={isDisabled}
                        startIcon={currentIcon}
                        size={size}
                        sx={combinedSx}
                        {...rest} // Передаем остальные пропсы
                    >
                        {buttonText}
                    </Button>
                </Box>
            </Tooltip>
        );
    }
);

ButtonA.displayName = 'ButtonA'; // Для удобства отладки

export default ButtonA;
