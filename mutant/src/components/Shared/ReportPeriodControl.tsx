// src/components/Shared/ReportPeriodControl.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
    format,
    addWeeks, subWeeks, startOfWeek, endOfWeek,
    addMonths, subMonths, startOfMonth, endOfMonth,
    addYears, subYears, startOfYear, endOfYear, parseISO,
} from 'date-fns';
import { uk } from 'date-fns/locale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Тип параметра отчета, который используется в DashboardView
type ReportParameter = {
    name: string;
    value: string | number | boolean;
};

export type ReportGranularity = 'WEEK' | 'MONTH' | 'YEAR';

interface ReportPeriodControlProps {
    granularity: ReportGranularity;
    onParamsUpdate: (params: ReportParameter[]) => void;
    activeD1: string; // Текущая начальная дата из DashboardView
    activeD2: string; // Текущая конечная дата из DashboardView
}

export const DATE_FORMAT_PARAM = 'yyyy-MM-dd'; // Используется также в ReportDayControl

const ReportPeriodControl: React.FC<ReportPeriodControlProps> = ({
    granularity,
    onParamsUpdate,
    activeD1,
    activeD2,
}) => {
    // navReferenceDate используется как якорь для НАВИГАЦИИ по выровненным периодам
    // Инициализируем его на основе activeD1 (или activeD2), чтобы навигация
    // начиналась с периода, близкого к текущему отображаемому.
    const [navReferenceDate, setNavReferenceDate] = useState<Date>(() => {
        try {
            return parseISO(activeD2 || activeD1); // Предпочитаем activeD2 как более позднюю точку
        } catch (e) {
            return new Date(); // Fallback
        }
    });
    const [hasNavigated, setHasNavigated] = useState(false);

    // Эта функция всегда вычисляет ВЫРОВНЕННЫЙ период и уведомляет родителя
    const calculateAlignedPeriodAndNotify = useCallback((currentNavRefDate: Date) => {
        let d1: Date;
        let d2: Date;

        switch (granularity) {
            case 'WEEK':
                d1 = startOfWeek(currentNavRefDate, { locale: uk, weekStartsOn: 1 });
                d2 = endOfWeek(currentNavRefDate, { locale: uk, weekStartsOn: 1 });
                break;
            case 'MONTH':
                d1 = startOfMonth(currentNavRefDate);
                d2 = endOfMonth(currentNavRefDate);
                break;
            case 'YEAR':
                d1 = startOfYear(currentNavRefDate);
                d2 = endOfYear(currentNavRefDate);
                break;
            default: // На случай непредвиденного значения
                d1 = currentNavRefDate;
                d2 = currentNavRefDate;
        }

        onParamsUpdate([
            { name: 'd1', value: format(d1, DATE_FORMAT_PARAM) },
            { name: 'd2', value: format(d2, DATE_FORMAT_PARAM) },
            { name: 'mode', value: 'PERIOD' }, 
        ]);
    }, [granularity, onParamsUpdate]);

    useEffect(() => {
        // При смене гранулярности (или при первом монтировании с новыми activeD1/D2),
        // сбрасываем состояние навигации и обновляем navReferenceDate.
        // Это гарантирует, что getDisplayString покажет начальный период из activeD1/D2,
        // а навигация начнется с правильной точки.
        try {
            setNavReferenceDate(parseISO(activeD2 || activeD1));
        } catch (e) {
            setNavReferenceDate(new Date());
        }
        setHasNavigated(false);
    }, [granularity, activeD1, activeD2]);

    const handlePrevious = () => {
        let newNavRefDate;
        switch (granularity) {
            case 'WEEK':
                newNavRefDate = subWeeks(navReferenceDate, 1);
                break;
            case 'MONTH':
                newNavRefDate = subMonths(navReferenceDate, 1);
                break;
            case 'YEAR':
                newNavRefDate = subYears(navReferenceDate, 1);
                break;
            default:
                newNavRefDate = navReferenceDate;
        }
        setNavReferenceDate(newNavRefDate);
        if (!hasNavigated) setHasNavigated(true);
        calculateAlignedPeriodAndNotify(newNavRefDate);
    };

    const handleNext = () => {
        let newNavRefDate;
        switch (granularity) {
            case 'WEEK':
                newNavRefDate = addWeeks(navReferenceDate, 1);
                break;
            case 'MONTH':
                newNavRefDate = addMonths(navReferenceDate, 1);
                break;
            case 'YEAR':
                newNavRefDate = addYears(navReferenceDate, 1);
                break;
            default:
                newNavRefDate = navReferenceDate;
        }
        setNavReferenceDate(newNavRefDate);
        if (!hasNavigated) setHasNavigated(true);
        calculateAlignedPeriodAndNotify(newNavRefDate);
    };

    const getDisplayString = (): string => {
        // Для НАЧАЛЬНОГО отображения (до первой навигации) используем activeD1, activeD2
        if (!hasNavigated && activeD1 && activeD2) {
            try {
                return `${format(parseISO(activeD1), 'd MMM yyyy', { locale: uk })} - ${format(parseISO(activeD2), 'd MMM yyyy', { locale: uk })}`;
            } catch (e) {
                // В случае ошибки парсинга activeD1/activeD2, отображаем выровненный период
                console.error("Error parsing activeD1/activeD2 in getDisplayString:", e);
            }
        }
        // После навигации или если activeD1/D2 невалидны, отображаем выровненный период
        let d1Display: Date, d2Display: Date;
        switch (granularity) {
            case 'WEEK':
                d1Display = startOfWeek(navReferenceDate, { locale: uk, weekStartsOn: 1 });
                d2Display = endOfWeek(navReferenceDate, { locale: uk, weekStartsOn: 1 });
                const d1MonthW = d1Display.getMonth(); // Переименовал, чтобы избежать конфликта имен
                const d2MonthW = d2Display.getMonth(); // Переименовал
                const d1YearW = d1Display.getFullYear(); // Переименовал
                const d2YearW = d2Display.getFullYear(); // Переименовал
                if (d1YearW !== d2YearW) return `${format(d1Display, 'd MMM yyyy', { locale: uk })} - ${format(d2Display, 'd MMM yyyy', { locale: uk })}`;
                if (d1MonthW !== d2MonthW) return `${format(d1Display, 'd MMM', { locale: uk })} - ${format(d2Display, 'd MMM yyyy', { locale: uk })}`;
                return `${format(d1Display, 'd', { locale: uk })} - ${format(d2Display, 'd MMMM yyyy', { locale: uk })}`;
            case 'MONTH':
                return format(navReferenceDate, 'LLLL yyyy', { locale: uk });
            case 'YEAR':
                return format(navReferenceDate, 'yyyy', { locale: uk }) + ' рік';
            default: // На случай, если granularity не соответствует ожидаемым значениям
                return "Невідомий період";
        }
    };
    
    const getTitleText = (direction: 'prev' | 'next'): string => {
        const periodType = granularity === 'WEEK' ? 'тиждень' : granularity === 'MONTH' ? 'місяць' : 'рік';
        return `${direction === 'prev' ? 'Попередній' : 'Наступний'} ${periodType}`;
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, my: 1 }}>
            <IconButton onClick={handlePrevious} size="small" title={getTitleText('prev')}>
                <ChevronLeftIcon />
            </IconButton>
            <Typography variant="subtitle1" component="div" sx={{ textAlign: 'center', minWidth: '240px', userSelect: 'none' }}>
                {getDisplayString()}
            </Typography>
            <IconButton onClick={handleNext} size="small" title={getTitleText('next')}>
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
};

export default ReportPeriodControl;
