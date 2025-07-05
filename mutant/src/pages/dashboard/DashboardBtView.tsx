// d:\dvl\ikscs\react\vp-descr\mui-uf-admin2\src\pages\DashboardBtView.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Grid, CircularProgress, Alert, Button, Stack, FormControl, Select, type SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './DashboardView.css';
import { type ParsedReport, ReportToParsedReport } from '../Reports/ReportList';
import { getReports, /*Report*/ } from '../../api/data/reportTools';
import { CustomerContextType, useCustomer } from '../../context/CustomerContext';
import MiniReport from '../Reports/MiniReport2';
import { dataToExcel, getExportData } from '../../api/tools/dataToExcel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { 
    format as formatDateFns, 
    subDays as subDaysFns, 
    addDays as addDaysFns, 
    subDays, 
    addDays, 
    startOfWeek, 
    endOfWeek, 
    startOfMonth, 
    endOfMonth, 
    startOfYear, 
    endOfYear 
} from 'date-fns';
// Поскольку ReportDayControl не используется, определяем формат здесь.
// Используем YYYY-MM-DD для совместимости с Dayjs и корректного парсинга new Date().
import ButtonA from '../../components/Shared/ButtonA';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { data } from 'react-router-dom';
// import DateRangePicker from '../../components/Shared/DateRangePicker';
// import TooltipSelect from '../../components/Shared/TooltipSelect';
 
const DATE_FORMAT_PARAM = 'YYYY-MM-DD'; // Изменено на формат, совместимый с Dayjs

const REPORT_ID_Pivot = 34; // 2; // Відвідувачі Pivot
const REPORT_ID_22 = 28; // Відвідувачі
const REPORT_ID_23 = 33; // 27; // Відвідувачі - Стать
const REPORT_ID_24 = 32; // 26; // Відвідувачі - Вік

const EXPORT_TABLE_NAME = 'pcnt.v_export_vca';
// const EXPORT_TABLE_NAME = 'pcnt.v_export';

// Тип для гранулярности, выбираемой пользователем
type DashboardUserGranularity = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'PERIOD';
// Тип для параметра mode, отправляемого в API
type ReportApiMode = 'DAY' | 'PERIOD';

type ReportParameter = {
    name: string;
    value: string | number | boolean;
};

// Helper для инициализации дат
const getInitialDates = (granularity: DashboardUserGranularity): { startDate: Date, endDate: Date, apiMode: ReportApiMode } => {
    const today = new Date();
    const d2 = subDaysFns(today, 1); // Вчера как конечная дата для всех режимов по умолчанию
    let d1: Date;
    let mode: ReportApiMode;

    switch (granularity) {
        case 'DAY':
            d1 = d2;
            mode = 'DAY';
            break;
        case 'WEEK':
            d1 = subDaysFns(d2, 6);
            mode = 'PERIOD';
            break;
        case 'MONTH':
            d1 = subDaysFns(d2, 29);
            mode = 'PERIOD';
            break;
        case 'YEAR':
            d1 = subDaysFns(d2, 364);
            mode = 'PERIOD';
            break;
        default: // Fallback на месяц
            d1 = subDaysFns(d2, 29);
            mode = 'PERIOD';
    }
    return { startDate: d1, endDate: d2, apiMode: mode };
};

// --- Компонента выбора периода через меню ---
// Перенесено за межі DashboardView для запобігання повторному створенню при кожному рендері.
const PeriodMenu: React.FC<{
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
    onSelect: (granularity: DashboardUserGranularity) => void;
    // onOpenDatePickerModal: () => void; // Больше не нужен, так как вызов синхронный в handleGranularityChange
    activeGranularity: DashboardUserGranularity;
}> = ({ anchorEl, open, onClose, onSelect, activeGranularity }) => (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem selected={activeGranularity === 'DAY'} onClick={() => { onSelect('DAY'); onClose(); }}>День</MenuItem>
        <MenuItem selected={activeGranularity === 'WEEK'} onClick={() => { onSelect('WEEK'); onClose(); }}>Тиждень</MenuItem>
        <MenuItem selected={activeGranularity === 'MONTH'} onClick={() => { onSelect('MONTH'); onClose(); }}>Місяць</MenuItem>
        <MenuItem selected={activeGranularity === 'YEAR'} onClick={() => { onSelect('YEAR'); onClose(); }}>Рік</MenuItem>
        <MenuItem selected={activeGranularity === 'PERIOD'} onClick={() => {
            onSelect('PERIOD'); // Сначала обновляем гранулярность
            onClose(); // Закрываем меню
            // Модальное окно теперь открывается синхронно в handleGranularityChange

            // todo: не вызывать onSelect('PERIOD') а открывать модальное окно
            // setDatePickerModalOpen(true);
        }}>Період</MenuItem>
    </Menu>
);

// --- Компонента выбора диапазона дат или одной даты ---
// Перенесено за межі DashboardView для запобігання повторному створенню при кожному рендері.
const DateRangeOrSinglePicker: React.FC<{
    granularity: DashboardUserGranularity;
    value: [Dayjs, Dayjs] | Dayjs;
    onChange: (value: [Dayjs, Dayjs] | Dayjs) => void;
}> = ({ granularity, value, onChange }) => {
    console.log('granularity, value', granularity, value);
    if (granularity === 'DAY') {
        return (
            <DatePicker
                label="Оберіть дату"
                value={value as Dayjs}
                onChange={date => date && onChange(date)}
                slotProps={{ textField: { size: 'small' } }}
            />
        );
    }
    // Для 'PERIOD' и других диапазонов
    // --- ЗАЩИТНАЯ ПРОВЕРКА ---
    // Предотвращает сбой из-за рассинхронизации состояний. Если компонент ожидает
    // массив дат (для периода), а получает одиночную дату, мы логируем ошибку
    // и ничего не рендерим, вместо того чтобы "упасть".
    if (!Array.isArray(value)) {
        console.error('Inconsistent state in DateRangeOrSinglePicker: Received a single date value for a range granularity.', { granularity, value });
        return null; // Предотвращаем падение приложения
    }

    const [start, end] = value; // Теперь эта строка безопасна
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
                label="Початок"
                value={start}
                onChange={date => date && onChange([date, end])}
                slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
                label="Кінець"
                value={end}
                onChange={date => date && onChange([start, date])}
                slotProps={{ textField: { size: 'small' } }}
            />
        </Box>
    );
};

const DashboardView: React.FC = () => {
    const { customerData, isLoading: isCustomerLoading } = useCustomer();

    const [parsedReport22, setParsedReport22] = useState<ParsedReport | null>(null);
    const [parsedReport23, setParsedReport23] = useState<ParsedReport | null>(null);
    const [parsedReport24, setParsedReport24] = useState<ParsedReport | null>(null);
    const [parsedReportPivot, setParsedReportPivot] = useState<ParsedReport | null>(null);

    // Состояние для гранулярности, выбранной пользователем
    const [activeGranularity, setActiveGranularity] = useState<DashboardUserGranularity>('MONTH');

    // const [selectedCity, setSelectedCity] = useState<string>(''); // debug
    // const cityOptions = [
    //     { value: 'kyiv', label: 'Киев' },
    //     { value: 'london', label: 'Лондон' },
    //     { value: 'paris', label: 'Париж' },
    // ];

    // reportParams теперь содержит d1, d2 и mode для API ('DAY' или 'PERIOD')
    const [reportParams, setReportParams] = useState<ReportParameter[]>(() => {
        const { startDate, endDate, apiMode } = getInitialDates('MONTH'); // Инициализация для 'MONTH'
        return [
            { name: 'd1', value: dayjs(startDate).format(DATE_FORMAT_PARAM) }, // Форматируем с Dayjs
            { name: 'd2', value: dayjs(endDate).format(DATE_FORMAT_PARAM) },   // Форматируем с Dayjs
            { name: 'mode', value: apiMode },
            { name: 'point', value: -1 }, // Initial default point, will be updated by useEffect
        ];
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isDatePickerModalOpen, setDatePickerModalOpen] = useState(false);

    // Временное состояние для дат в модальном окне
    const [tempDateValue, setTempDateValue] = useState<[Dayjs, Dayjs] | Dayjs>(() => {
        const d1 = dayjs(reportParams.find(p => p.name === 'd1')?.value as string);
        if (activeGranularity === 'DAY') {
            return d1;
        }
        const d2 = dayjs(reportParams.find(p => p.name === 'd2')?.value as string);
        return [d1, d2];
    });

    const handleOpenDatePickerModal = useCallback(() => {
        // Инициализируем временное состояние текущими датами из reportParams
        // useCallback с зависимостями гарантирует, что мы всегда читаем
        // актуальные reportParams и activeGranularity, избегая "stale closure".
        const d1 = dayjs(reportParams.find(p => p.name === 'd1')?.value as string);
        if (activeGranularity === 'DAY') {
            setTempDateValue(d1);
        } else {
            const d2 = dayjs(reportParams.find(p => p.name === 'd2')?.value as string);
            setTempDateValue([d1, d2]);
        }
        setDatePickerModalOpen(true);
    }, [reportParams, activeGranularity, setTempDateValue, setDatePickerModalOpen]);

    const handleCloseDatePickerModal = () => setDatePickerModalOpen(false);

    const handleApplyDateChange = () => {
        const isDay = activeGranularity === 'DAY';
        const d1 = isDay ? (tempDateValue as Dayjs) : (tempDateValue as [Dayjs, Dayjs])[0];
        const d2 = isDay ? (tempDateValue as Dayjs) : (tempDateValue as [Dayjs, Dayjs])[1];

        handleParamsUpdateFromControl([ // d1.format() уже использует Dayjs, теперь с правильным форматом
            { name: 'd1', value: d1.format(DATE_FORMAT_PARAM) }, 
            { name: 'd2', value: d2.format(DATE_FORMAT_PARAM) }, 
            { name: 'mode', value: isDay ? 'DAY' : 'PERIOD' }
        ]);
        handleCloseDatePickerModal();
    };

    // Effect to set initial 'point' in reportParams based on customerData
    useEffect(() => {
        let newPointValue: number = -1; // Default

        if (!isCustomerLoading) { // Only act if customer data loading is complete
            if (customerData && customerData.points && customerData.points.length > 0) {
                newPointValue = customerData.points[0].value;
            }
            // If customerData is loaded but no points, newPointValue remains -1.
        } else {
            // While customer data is loading, do nothing to avoid premature changes.
            return;
        }

        setReportParams(prevParams => {
            const currentPointValueInParams = prevParams.find(p => p.name === 'point')?.value;
            if (currentPointValueInParams !== newPointValue) {
                return prevParams.map(p =>
                    p.name === 'point' ? { ...p, value: newPointValue } : p
                );
            }
            return prevParams; // No change needed
        });
    }, [customerData, isCustomerLoading, setReportParams]);

    useEffect(() => {
        const loadSingleReport = async (rid: number): Promise<ParsedReport> => {
            const fetchedReports = await getReports(rid);
            if (!fetchedReports || fetchedReports.length === 0) {
                throw new Error(`Звіт з ID ${rid} не знайдено.`);
            }
            return ReportToParsedReport(fetchedReports[0]);
        };

        const loadAllReports = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const results = await Promise.allSettled([
                    loadSingleReport(REPORT_ID_22),
                    loadSingleReport(REPORT_ID_23),
                    loadSingleReport(REPORT_ID_24),
                    loadSingleReport(REPORT_ID_Pivot),
                ]);
                let firstError: string | null = null;
                const handleResult = (
                    result: PromiseSettledResult<ParsedReport>,
                    setter: React.Dispatch<React.SetStateAction<ParsedReport | null>>,
                    reportId: number
                ) => {
                    if (result.status === 'fulfilled') {
                        setter(result.value);
                    } else {
                        const errorMsg = `Помилка завантаження звіту ${reportId}: ${result.reason?.message || result.reason}`;
                        console.error(errorMsg, result.reason);
                        if (!firstError) firstError = errorMsg;
                    }
                };
                handleResult(results[0], setParsedReport22, REPORT_ID_22);
                handleResult(results[1], setParsedReport23, REPORT_ID_23);
                handleResult(results[2], setParsedReport24, REPORT_ID_24);
                handleResult(results[3], setParsedReportPivot, REPORT_ID_Pivot);

                if (firstError) {
                    setFetchError(firstError);
                }
            } catch (err: any) {
                console.error('Непередбачена помилка під час завантаження звітів:', err);
                setFetchError(err.message || 'Сталася невідома помилка');
            } finally {
                setIsLoading(false);
            }
        };
        loadAllReports();
    }, []);

    // Обработчик смены гранулярности пользователем
    const handleGranularityChange = useCallback((newGranularity: DashboardUserGranularity) => {
        setActiveGranularity(newGranularity);
        const { startDate, endDate, apiMode } = getInitialDates(newGranularity);

        // СИНХРОНИЗАЦИЯ: Немедленно обновляем tempDateValue, чтобы его тип
        // (одиночная дата или массив) соответствовал новой гранулярности.
        // Это предотвращает ошибку "value is not iterable", когда компонент
        // DateRangeOrSinglePicker перерисовывается с новой гранулярностью,
        // но со старым значением tempDateValue.
        if (newGranularity === 'DAY') {
            setTempDateValue(dayjs(startDate));
        } else {
            setTempDateValue([dayjs(startDate), dayjs(endDate)]);
        }

        setReportParams(prevParams => {
            const existingPointParam = prevParams.find(p => p.name === 'point') || { name: 'point', value: -1 };
            return [
                { name: 'd1', value: dayjs(startDate).format(DATE_FORMAT_PARAM) }, // Форматируем с Dayjs
                { name: 'd2', value: dayjs(endDate).format(DATE_FORMAT_PARAM) },   // Форматируем с Dayjs
                { name: 'mode', value: apiMode },
                existingPointParam, // Preserve existing point
            ];
        });
        // Если выбрана гранулярность 'PERIOD', открываем модальное окно сразу же.
        // Это гарантирует, что tempDateValue и activeGranularity уже синхронизированы.
        if (newGranularity === 'PERIOD') {
            setDatePickerModalOpen(true);
        }
    }, [setActiveGranularity, setReportParams, setTempDateValue]);

    // Обработчик обновления параметров от дочерних контролов (ReportDayControl, ReportPeriodControl)
    const handleParamsUpdateFromControl = useCallback((dateAndModeParams: ReportParameter[]) => {
        // Assuming dateAndModeParams contains {name: 'd1', ...}, {name: 'd2', ...}, {name: 'mode', ...}
        setReportParams(prevParams => {
            const pointParam = prevParams.find(p => p.name === 'point') || { name: 'point', value: -1 };

            // Create a map from the new date/mode params for easy lookup
            const newParamsMap = new Map(dateAndModeParams.map(p => [p.name, p]));

            // Build the new parameters array, prioritizing new date/mode, keeping existing point and others
            const resultParams: ReportParameter[] = prevParams
                .filter(p => p.name !== 'point' && !newParamsMap.has(p.name)) // Keep other old params
                .concat(dateAndModeParams) // Add new date/mode params
                .concat([pointParam]); // Add the point param

            // Deduplicate (just in case, ensuring pointParam is the one used for 'point')
            const finalMap = new Map(resultParams.map(p => [p.name, p]));
            finalMap.set('point', pointParam); // Ensure our point is authoritative
            return Array.from(finalMap.values());
        });
    }, [setReportParams]);

    const handlePointChange = useCallback((event: SelectChangeEvent<string | number>) => {
        const newPointId = typeof event.target.value === 'string' ? parseInt(event.target.value, 10) : event.target.value;
        setReportParams(prevParams =>
            prevParams.map(p => (p.name === 'point' ? { ...p, value: newPointId } : p))
        );
    }, [setReportParams]);

    const handleExport = async () => {
        setIsExporting(true);
        // const filename = `export_${EXPORT_TABLE_NAME}`; 
        // добавил в название экспортируемого файла наименование, если point выбран
        const point_id = reportParams.find(p => p.name === 'point')?.value || 0;
        const _pointLabel = customerData?.points?.find(p => p.value === point_id)?.label || 'всі_пункти';
        const filename = `export_point_${_pointLabel}`;
        try {
            const data0 = await getExportData(point_id === -1 ? undefined : {point_id});
            const data1 = data0.map((item: any) => ({
                age: item.age,
                date: item.date,
                point: item.point,
                gender: item.gender,
            }));
            dataToExcel(data1, filename);
            console.log('Export successful');
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const currentPointSelected = reportParams.find(p => p.name === 'point')?.value as number ?? -1;
    console.log('customerData.points', customerData?.points);

    // --- Обработчики пролистывания периодов ---
    const handlePrevPeriod = useCallback(() => {
        const d1 = new Date(reportParams.find(p => p.name === 'd1')?.value as string);
        const d2 = new Date(reportParams.find(p => p.name === 'd2')?.value as string);

        let newD1 = d1, newD2 = d2;
        switch (activeGranularity) {
            case 'DAY':
                newD1 = subDays(d1, 1);
                newD2 = subDays(d2, 1);
                break;
            case 'WEEK':
                newD1 = subDays(d1, 7);
                newD2 = subDays(d2, 7);
                break;
            case 'MONTH':
                newD1 = startOfMonth(subDays(d1, 1));
                newD2 = endOfMonth(subDays(d1, 1));
                break;
            case 'YEAR':
                newD1 = startOfYear(subDays(d1, 1));
                newD2 = endOfYear(subDays(d1, 1));
                break;
        }
        handleParamsUpdateFromControl([ // Форматируем с Dayjs
            { name: 'd1', value: dayjs(newD1).format(DATE_FORMAT_PARAM) },
            { name: 'd2', value: dayjs(newD2).format(DATE_FORMAT_PARAM) },
            { name: 'mode', value: activeGranularity === 'DAY' ? 'DAY' : 'PERIOD' }
        ]);
    }, [reportParams, activeGranularity, handleParamsUpdateFromControl]);

    const handleNextPeriod = useCallback(() => {
        const d1 = new Date(reportParams.find(p => p.name === 'd1')?.value as string);
        const d2 = new Date(reportParams.find(p => p.name === 'd2')?.value as string);

        let newD1 = d1, newD2 = d2;
        switch (activeGranularity) {
            case 'DAY':
                newD1 = addDays(d1, 1);
                newD2 = addDays(d2, 1);
                break;
            case 'WEEK':
                newD1 = addDays(d1, 7);
                newD2 = addDays(d2, 7);
                break;
            case 'MONTH':
                newD1 = startOfMonth(addDays(d2, 1));
                newD2 = endOfMonth(addDays(d2, 1));
                break;
            case 'YEAR':
                newD1 = startOfYear(addDays(d2, 1));
                newD2 = endOfYear(addDays(d2, 1));
                break;
        }
        handleParamsUpdateFromControl([ // Форматируем с Dayjs
            { name: 'd1', value: dayjs(newD1).format(DATE_FORMAT_PARAM) },
            { name: 'd2', value: dayjs(newD2).format(DATE_FORMAT_PARAM) },
            { name: 'mode', value: activeGranularity === 'DAY' ? 'DAY' : 'PERIOD' }
        ]);
    }, [reportParams, activeGranularity, handleParamsUpdateFromControl]);

    // --- Состояния для меню выбора периода ---
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState<null | HTMLElement>(null);
    const openPeriodMenu = Boolean(periodMenuAnchor);
    const handleOpenPeriodMenu = (event: React.MouseEvent<HTMLElement>) => setPeriodMenuAnchor(event.currentTarget);
    const handleClosePeriodMenu = () => setPeriodMenuAnchor(null);

    const handleDateRangeChange = (startDate: dayjs.Dayjs | null, endDate: dayjs.Dayjs | null) => {
        console.log('Выбранная дата начала:', startDate?.format('YYYY-MM-DD')); // Используем .format() для Dayjs
        console.log('Выбранная дата окончания:', endDate?.format('YYYY-MM-DD'));

        // Здесь вы можете обновить состояние родительского компонента,
        // отправить данные на сервер, отфильтровать список и т.д.
    };

    const d1String = formatDateFns(new Date(reportParams.find(p => p.name === 'd1')?.value as string), 'dd.MM.yyyy');
    const d2String = formatDateFns(new Date(reportParams.find(p => p.name === 'd2')?.value as string), 'dd.MM.yyyy');
    const displayDate = activeGranularity === 'DAY' ? d1String : `${d1String} - ${d2String}`;
    console.log('displayDate', displayDate);

    const reportParamsPivot = reportParams
    // костыль
    // const reportParamsPivot = reportParams.map(param => {
    //     if (param.name === 'point') {
    //         return { ...param, value: -1 }; // Создаем новый объект с обновленным значением
    //     }
    //     return param; // Возвращаем неизмененный объект
    // });

    const renderMenuItems = () => {
        const allPoints = customerData?.points?.length == 0 ? 
            [] : [{ value: -1, label: 'All' }, ...customerData?.points?? []];
        return allPoints.map((point) => (
        <MenuItem key={point.value} value={point.value}>
            {point.label}
        </MenuItem>
    ));
};
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box id={'22222222'} sx={{
                padding: 0,
                flexGrow: 1,
                backgroundImage: 'url(/bg1.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}>
                <Box sx={{
                    width: '100%',
                    maxWidth: "1300px",
                    margin: "0 auto",
                    padding: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                }}>

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Завантаження даних звітів...</Typography>
                        </Box>
                    )}
                    {fetchError && !isLoading && (
                        <Alert severity="error" sx={{ my: 2 }}>{fetchError}</Alert>
                    )}

                    {!isLoading && !fetchError && (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                my: 2,
                                alignItems: 'center',
                                width: '100%',
                                flexWrap: 'wrap',
                                gap: 1,
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Селектор пункта слева */}
                            <Box sx={{ flexShrink: 0, minWidth: { xs: '100%', sm: 200, md: 240 } }}>
                                <FormControl fullWidth size="small" variant="outlined">
                                    {/* No InputLabel as per requirement */}
                                    <Select
                                        value={currentPointSelected}
                                        onChange={handlePointChange}
                                        inputProps={{ 'aria-label': 'Оберіть пункт' }}
                                        sx={{ backgroundColor: 'white' }}
                                        disabled={isCustomerLoading}
                                    >
                                        {isCustomerLoading ? (
                                            <MenuItem value={currentPointSelected} disabled>
                                                <em>Завантаження пунктів...</em>
                                            </MenuItem>
                                        ) : (customerData?.points && customerData.points.length > 0) ? 
                                            renderMenuItems() : (
                                        // (
                                        //     customerData.points.map((point) => (
                                        //         <MenuItem key={point.value} value={point.value}>
                                        //             {point.label}
                                        //         </MenuItem>
                                        //     ))
                                        // ) : (
                                            <MenuItem value={-1}><em>{"нема даних"}</em></MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Box>
                            {/* Кнопки управления справа */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', flexGrow: 1 }}>
                                <Tooltip title="Гортати на попередній період">
                                    <span>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handlePrevPeriod}
                                        >
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </Button>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Гортати на наступний період">
                                    <span>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleNextPeriod}
                                        >
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </Button>
                                    </span>
                                </Tooltip>
                                {/* <Button variant="outlined" size="small" onClick={handleOpenDatePickerModal}>
                                    {displayDate}
                                </Button> */}
                                <Tooltip title="Вибір періоду" placement="top-end">
                                    <span>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleOpenPeriodMenu}
                                        >
                                            <ArrowDropDownIcon fontSize="small" />
                                        </Button>
                                        <PeriodMenu
                                            anchorEl={periodMenuAnchor}
                                            open={openPeriodMenu}
                                            onClose={handleClosePeriodMenu}
                                            onSelect={handleGranularityChange}
                                            // onOpenDatePickerModal больше не передается, так как вызов синхронный
                                            activeGranularity={activeGranularity}
                                        />
                                    </span>
                                </Tooltip>
                                {/* <TooltipSelect<string>
                                    label="Выберите город"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)} // e.target.value is inferred as string
                                    options={cityOptions}
                                    tooltipTitle="Город, в котором вы живете"
                                    tooltipPlacement="bottom-end"
                                /> */}
                                <Tooltip title="Експорт">
                                    <span>
                                        <ButtonA
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleExport}
                                            isActive={isExporting}
                                            startIcon={<FileDownloadIcon />}
                                            hideTextOn="md"
                                            size="small"
                                        >
                                            Експорт
                                        </ButtonA>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Stack>
                    )}

                    {!isLoading && !fetchError && (
                        <>
                            {/* {activeGranularity === 'DAY' && parsedReport22 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1, mb: 0.5 }}>
                                    <ReportDayControl
                                        onParamsUpdate={handleParamsUpdateFromControl}
                                    />
                                </Box>
                            )}
                            {(activeGranularity !== 'DAY') && parsedReport22 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1, mb: 0.5 }}>
                                    <ReportPeriodControl
                                        granularity={activeGranularity as ReportGranularity}
                                        onParamsUpdate={handleParamsUpdateFromControl}
                                        activeD1={reportParams.find(p => p.name === 'd1')?.value as string}
                                        activeD2={reportParams.find(p => p.name === 'd2')?.value as string}
                                    />
                                </Box>
                            )} */}
                            <Grid container rowSpacing={1} sx={{ my: 2, width: '100%' }}>
                                {parsedReportPivot && (
                                    <Grid item xs={12} md={12}>
                                        <Box sx={{ px: 1.5, pb: 1 }}>
                                            <MiniReport
                                                report={parsedReportPivot}
                                                parameters={reportParamsPivot}
                                                displayMode="pivot"
                                                height="450px"
                                            />
                                        </Box>
                                    </Grid>
                                )}
                                {/* {parsedReport22 && (
                                    <Grid item xs={12} md={12}>
                                        <Box sx={{ px: 1.5, pb: 1 }}>
                                            <MiniReport
                                                report={parsedReport22}
                                                parameters={reportParams}
                                                displayMode="chart"
                                                height="330px"
                                            />
                                        </Box>
                                    </Grid>
                                )} */}
                                {parsedReport24 && (
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ px: 1.5, pb: 1 }}>
                                            <MiniReport
                                                report={parsedReport24}
                                                parameters={reportParams}
                                                displayMode="chart"
                                                height="300px"
                                            />
                                        </Box>
                                    </Grid>
                                )}
                                {parsedReport23 && (
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ px: 1.5, pb: 1 }}>
                                            <MiniReport
                                                report={parsedReport23}
                                                parameters={reportParams}
                                                displayMode="chart"
                                                height="300px"
                                            />
                                        </Box>
                                    </Grid>
                                )}
                                {/* {parsedReportPivot && (
                                    <Grid item xs={12} md={12}>
                                        <Box sx={{ px: 1.5, pb: 1 }}>
                                            <MiniReport
                                                report={parsedReportPivot}
                                                parameters={reportParamsPivot}
                                                displayMode="pivot"
                                                height="450px"
                                            />
                                        </Box>
                                    </Grid>
                                )} */}
                            </Grid>
                        </>
                    )}

                </Box>
                <Dialog open={isDatePickerModalOpen} onClose={handleCloseDatePickerModal} maxWidth="md">
                    <DialogTitle>Оберіть дату або період</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, minWidth: { md: 500 }, display: 'flex', justifyContent: 'center' }}>
                            {/* Условный рендеринг: компонент монтируется только при открытии диалога,
                                когда все состояния уже синхронизированы. Это предотвращает ошибку. */}
                            {isDatePickerModalOpen && (
                                <DateRangeOrSinglePicker
                                    granularity={activeGranularity}
                                    value={tempDateValue}
                                    onChange={setTempDateValue}
                                />
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDatePickerModal}>Скасувати</Button>
                        <Button onClick={handleApplyDateChange} variant="contained">Застосувати</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default DashboardView;
