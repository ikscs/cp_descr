// d:\dvl\ikscs\react\vp-descr\mui-uf-admin2\src\pages\DashboardView.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Grid, CircularProgress, Alert, Button, Stack, FormControl, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import './DashboardView.css';
import { type ParsedReport, ReportToParsedReport } from '../Reports/ReportList';
import { getReports, /*Report*/ } from '../../api/data/reportTools';
import { useCustomer } from '../../context/CustomerContext';
import MiniReport from '../Reports/MiniReport2';
import { dataToExcel } from '../../api/tools/dataToExcel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { format as formatDateFns, subDays as subDaysFns } from 'date-fns';
import ReportDayControl, { DATE_FORMAT_PARAM as DAY_DATE_FORMAT_PARAM } from '../../components/Shared/ReportDayControl';
import ReportPeriodControl, { type ReportGranularity } from '../../components/Shared/ReportPeriodControl';
import ButtonA from '../../components/Shared/ButtonA';

const REPORT_ID_Pivot = 2; // Відвідувачі Pivot
const REPORT_ID_22 = 28; // Відвідувачі
const REPORT_ID_23 = 27; // Відвідувачі - Стать
const REPORT_ID_24 = 26; // Відвідувачі - Вік

const EXPORT_TABLE_NAME = 'pcnt.v_export';

// Тип для гранулярности, выбираемой пользователем
type DashboardUserGranularity = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
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


const DashboardView: React.FC = () => {
    const { customerData, isLoading: isCustomerLoading } = useCustomer();

    const [parsedReport22, setParsedReport22] = useState<ParsedReport | null>(null);
    const [parsedReport23, setParsedReport23] = useState<ParsedReport | null>(null);
    const [parsedReport24, setParsedReport24] = useState<ParsedReport | null>(null);
    const [parsedReportPivot, setParsedReportPivot] = useState<ParsedReport | null>(null);

    // Состояние для гранулярности, выбранной пользователем
    const [activeGranularity, setActiveGranularity] = useState<DashboardUserGranularity>('MONTH');

    // reportParams теперь содержит d1, d2 и mode для API ('DAY' или 'PERIOD')
    const [reportParams, setReportParams] = useState<ReportParameter[]>(() => {
        const { startDate, endDate, apiMode } = getInitialDates('MONTH'); // Инициализация для 'MONTH'
        return [
            { name: 'd1', value: formatDateFns(startDate, DAY_DATE_FORMAT_PARAM) },
            { name: 'd2', value: formatDateFns(endDate, DAY_DATE_FORMAT_PARAM) },
            { name: 'mode', value: apiMode },
            { name: 'point', value: -1 }, // Initial default point, will be updated by useEffect
        ];
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState<boolean>(false);

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

        setReportParams(prevParams => {
            const existingPointParam = prevParams.find(p => p.name === 'point') || { name: 'point', value: -1 };
            return [
                { name: 'd1', value: formatDateFns(startDate, DAY_DATE_FORMAT_PARAM) },
                { name: 'd2', value: formatDateFns(endDate, DAY_DATE_FORMAT_PARAM) },
                { name: 'mode', value: apiMode },
                existingPointParam, // Preserve existing point
            ];
        });
    }, [setActiveGranularity, setReportParams]);

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
        const filename = `export_${EXPORT_TABLE_NAME}`;
        try {
            await dataToExcel(EXPORT_TABLE_NAME, filename);
            // todo: dataToExcel - add customer filter
            // await dataToExcel(EXPORT_TABLE_NAME, filename, '*', {
            //     customer: customerData?.customer||null, 
            // });
            console.log('Export successful');
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const currentPointSelected = reportParams.find(p => p.name === 'point')?.value as number ?? -1;
    console.log('customerData.points', customerData?.points);
    return (
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
                        }}
                    >
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
                                    ) : (customerData?.points && customerData.points.length > 0) ? (
                                        customerData.points.map((point) => (
                                            <MenuItem key={point.value} value={point.value}>
                                                {point.label}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value={-1}><em>{"нема даних"}</em></MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', flexGrow: 1 }}>
                            <Button
                                size="small"
                                variant={activeGranularity === 'DAY' ? 'contained' : 'outlined'}
                                onClick={() => handleGranularityChange('DAY')}
                                title='Відображати дані за вчора'
                            >
                                День
                            </Button>
                            <Button
                                size="small"
                                variant={activeGranularity === 'WEEK' ? 'contained' : 'outlined'}
                                onClick={() => handleGranularityChange('WEEK')}
                            >
                                Тиждень
                            </Button>
                            <Button
                                size="small"
                                variant={activeGranularity === 'MONTH' ? 'contained' : 'outlined'}
                                onClick={() => handleGranularityChange('MONTH')}
                            >
                                Місяць
                            </Button>
                            <Button
                                size="small"
                                variant={activeGranularity === 'YEAR' ? 'contained' : 'outlined'}
                                onClick={() => handleGranularityChange('YEAR')}
                            >
                                Рік
                            </Button>
                        </Box>
                        <Box sx={{ flexShrink: 0 }}>
                            <ButtonA
                                variant="contained"
                                color="secondary"
                                onClick={handleExport}
                                isActive={isExporting}
                                startIcon={<FileDownloadIcon />}
                                hideTextOn="md"
                                size="small"
                            >
                                Експорт в Excel
                            </ButtonA>
                        </Box>
                    </Stack>
                )}

                {!isLoading && !fetchError && (
                    <>
                        {activeGranularity === 'DAY' && parsedReport22 && (
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
                            </Box>)}
                        <Grid container rowSpacing={1} sx={{ my: 2, width: '100%' }}>
                            {parsedReport22 && (
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
                            )}
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
                            {parsedReportPivot && (
                                <Grid item xs={12} md={12}>
                                    <Box sx={{ px: 1.5, pb: 1 }}>
                                        <MiniReport
                                            report={parsedReportPivot}
                                            parameters={reportParams}
                                            displayMode="pivot"
                                            height="450px"
                                        />
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </>
                )}

            </Box>
        </Box>
    );
};

export default DashboardView;
