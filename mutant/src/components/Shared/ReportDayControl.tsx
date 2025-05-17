// src/components/Shared/ReportDayControl.tsx
import React, { useState, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import {
    format,
    addDays,
    subDays,
} from 'date-fns';
import { uk as dateFnsUkLocale } from 'date-fns/locale'; // Aliased to avoid potential naming conflicts
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register the Ukrainian locale for react-datepicker
registerLocale('uk', dateFnsUkLocale);
setDefaultLocale('uk'); // Optional: set as default for all pickers

// Тип параметра отчета, который используется в DashboardView
type ReportParameter = {
    name: string;
    value: string | number | boolean;
};

interface ReportDayControlProps {
    onParamsUpdate: (params: ReportParameter[]) => void;
}

export const DATE_FORMAT_PARAM = 'yyyy-MM-dd'; // Формат для d1/d2
const DATE_FORMAT_DISPLAY = 'd MMMM yyyy'; // Формат для отображения

const ReportDayControl: React.FC<ReportDayControlProps> = ({
    onParamsUpdate,
}) => {
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        return subDays(new Date(), 1); // По умолчанию вчера, если currentD1 невалиден или отсутствует
    });

    // Эффект для вызова onParamsUpdate при изменении selectedDate
    // и для инициализации параметров при монтировании
    useEffect(() => {
        const formattedDate = format(selectedDate, DATE_FORMAT_PARAM);
        onParamsUpdate([
            { name: 'd1', value: formattedDate },
            { name: 'd2', value: formattedDate },
            { name: 'mode', value: 'DAY' },
            { name: 'point', value: -1 },
        ]);
    }, [selectedDate, onParamsUpdate]);


    const handlePreviousDay = () => {
        setSelectedDate(prevDate => subDays(prevDate, 1));
    };

    const handleNextDay = () => {
        setSelectedDate(prevDate => addDays(prevDate, 1));
    };

    // Custom input component for react-datepicker using MUI TextField
    // forwardRef is important for react-datepicker
    const CustomDateInput = React.forwardRef<
        HTMLDivElement, // TextField's root element is a div
        { value?: string; onClick?: () => void }
    >(({ value, onClick }, ref) => (
        <TextField
            value={value}
            onClick={onClick} // This makes the TextField clickable to open the datepicker
            ref={ref} // react-datepicker passes the ref to the root element of the custom input
            size="small"
            variant="outlined"
            sx={{
                minWidth: '180px', // To maintain similar width
                '& .MuiInputBase-input': {
                    textAlign: 'center',
                    cursor: 'pointer', // Indicate it's clickable
                },
                '& .MuiOutlinedInput-notchedOutline': { // Target the fieldset for outlined variant
                    border: 'none', // Remove the border
                },
            }}
            InputProps={{
                readOnly: true, // Prevent manual typing, rely on calendar
            }}
            aria-label="selected date"
        />
    ));
    CustomDateInput.displayName = 'CustomDateInput';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, my: 1 }}>
            <IconButton onClick={handlePreviousDay} size="small" aria-label="previous day" title="Попередній день">
                <ChevronLeftIcon />
            </IconButton>

            <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                    if (date) {
                        setSelectedDate(date);
                    }
                }}
                dateFormat={DATE_FORMAT_DISPLAY}
                locale="uk" // Use the registered locale string
                maxDate={new Date()} // Today is the max selectable date
                customInput={<CustomDateInput />}
                popperPlacement="bottom-start" // You can adjust this as needed
            />

            <IconButton onClick={handleNextDay} size="small" aria-label="next day" title="Наступний день">
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
};

export default ReportDayControl;
