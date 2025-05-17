// src/components/Shared/ReportDayControl.tsx
import React, { useState, useEffect, /*useCallback*/ } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
    format,
    addDays,
    subDays,
    // parseISO,
    // isValid,
} from 'date-fns';
import { uk } from 'date-fns/locale'; // Заменяем ru на uk
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Тип параметра отчета, который используется в DashboardView
type ReportParameter = {
    name: string;
    value: string | number | boolean;
};

interface ReportDayControlProps {
    // Начальная дата в строковом формате 'yyyy-MM-dd'
    // Может быть пустой или невалидной, компонент должен это обработать
    // currentD1: string | undefined;
    onParamsUpdate: (params: ReportParameter[]) => void;
}

export const DATE_FORMAT_PARAM = 'yyyy-MM-dd'; // Формат для d1/d2
const DATE_FORMAT_DISPLAY = 'd MMMM yyyy'; // Формат для отображения

const ReportDayControl: React.FC<ReportDayControlProps> = ({
    // currentD1,
    onParamsUpdate,
}) => {
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        // if (currentD1 && currentD1.trim() !== '') { // Проверяем, что currentD1 не пустая строка
        //     const parsed = parseISO(currentD1);
        //     if (isValid(parsed)) {
        //         return parsed;
        //     }
        // }
        return subDays(new Date(), 1); // По умолчанию вчера, если currentD1 невалиден или отсутствует
    });

    // Эффект для вызова onParamsUpdate при изменении selectedDate
    // и для инициализации параметров при монтировании
    useEffect(() => {
        const formattedDate = format(selectedDate, DATE_FORMAT_PARAM);
        // console.log('ReportDayControl Selected date:', formattedDate); // Убрали console.log
        onParamsUpdate([
            { name: 'd1', value: formattedDate },
            { name: 'd2', value: formattedDate },
            { name: 'mode', value: 'DAY' },
            { name: 'point', value: -1 },
        ]);
    }, [selectedDate, onParamsUpdate]);

    // Эффект для синхронизации с currentD1 из props, если он изменился извне
    // (например, при первом выборе "День" в DashboardView)
    // Этот эффект нужен, если DashboardView может передать валидный currentD1
    // уже ПОСЛЕ того, как ReportDayControl был инициализирован (например, если mode был 'PERIOD' с датой).
    // useEffect(() => {
    //     if (currentD1 && currentD1.trim() !== '') {
    //         const parsed = parseISO(currentD1);
    //         if (isValid(parsed)) {
    //             // Проверяем, отличается ли от текущей даты в стейте, чтобы избежать лишних обновлений
    //             if (format(parsed, DATE_FORMAT_PARAM) !== format(selectedDate, DATE_FORMAT_PARAM)) {
    //                 setSelectedDate(parsed);
    //             }
    //         }
    //         // Если currentD1 есть, но невалиден, selectedDate не меняется (остается вчерашней или ранее установленной).
    //     } else {
    //         // Если currentD1 стал undefined или пустой ПОСЛЕ инициализации,
    //         // а selectedDate уже установлена (например, пользователь пощелкал даты),
    //         // мы НЕ сбрасываем на "вчера". "Вчера" - это только начальный дефолт.
    //         // Если бы требовалось сбрасывать на "вчера" каждый раз, когда currentD1 пуст, логика была бы другой.
    //     }
    // }, [currentD1, selectedDate]); // Добавили selectedDate в зависимости для корректного сравнения


    const handlePreviousDay = () => {
        setSelectedDate(prevDate => subDays(prevDate, 1));
    };

    const handleNextDay = () => {
        setSelectedDate(prevDate => addDays(prevDate, 1));
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, my: 1 }}>
            <IconButton onClick={handlePreviousDay} size="small" aria-label="previous day" title="Попередній день">
                <ChevronLeftIcon />
            </IconButton>
            <Typography variant="subtitle1" component="div" sx={{ textAlign: 'center', minWidth: '180px', userSelect: 'none' }}>
                {format(selectedDate, DATE_FORMAT_DISPLAY, { locale: uk })}
            </Typography>
            <IconButton onClick={handleNextDay} size="small" aria-label="next day" title="Наступний день">
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
};

export default ReportDayControl;
