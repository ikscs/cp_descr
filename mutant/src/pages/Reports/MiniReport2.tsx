// src/pages/Reports/MiniReport2.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import { fetchData, getBackend, IFetchResponse } from '../../api/data/fetchData';
import packageJson from '../../../package.json';
import LineChart from '../Charts/LineChart';
import CircularChart from '../Charts/CircularChart';
import type { ParsedReport, ReportExecutionResult, ChartData } from './ReportList';
// Используем новые утилиты и компонент для сводного графика
// import { AggregationType, generatePivotData, prepareChartDataFromPivoted, aggregationTypeLabels } from './pivotUtils';
import { AggregationType, generatePivotData, prepareChartDataFromPivoted, } from './pivotUtils';
import PivotChartContent from './PivotChartContent';
import { fillPlaceholders } from './reportTools';
// import axios from 'axios';
import { executeReportQuery } from '../../api/data/reportToolsDrf';

const backend = getBackend();

// --- Interfaces ---

interface MiniReport2Props { // Изменено имя интерфейса
    /** The parsed report definition, including config for chart */
    report: ParsedReport;
    /** Parameters to execute the report with */
    parameters: { name: string; value: string | number | boolean }[];
    /** How to display the result */
    displayMode: 'table' | 'chart' |  'pivot';
    /** Optional: Fixed height for the container */
    height?: string | number;
}

// --- Helper: Execute Report Query with Axios ---
/*const executeReportQuery = async (
    id: number,
    params: { name: string; value: string | number | boolean }[]
): Promise<ReportExecutionResult> => {
    const paramsToSend = {
        app_id: packageJson.name,
        report_id: id,
        parameters: params,
    };
    console.log('[minireport] run report with params:', paramsToSend);
    const res0 = await axios.post<IFetchResponse>('https://cnt.theweb.place/api/report/', paramsToSend);
    const res: any = res0.data || {ok: false, data: []};
    if (res.ok) {
        console.log('[minireport] result:', res);
        const columns = Object.keys(res.data[0]);
        const rows = res.data.map((row: any) => columns.map((col) => row[col]));
        return { columns, rows };
    } else {
        return { columns: ['Message'], rows: [['Incorect report result']] };
    }
}*/

// --- Helper: Execute Report Query (Adapted from ReportList) ---
const executeReportQuery__ = async (
    id: number,
    params: { name: string; value: string | number | boolean }[]
): Promise<ReportExecutionResult> => {
    try {
        const paramsToSend = {
            backend_point: backend.backend_point_report,
            app_id: packageJson.name,
            report_id: id,
            parameters: params,
        };

        const response: any = await fetchData(paramsToSend);

        if (!response) {
            throw new Error('No response received from backend.');
        }

        const isErrorStatus = response.ok === false || (response.status && response.status >= 400);
        const responseData = response.data || response;

        if (isErrorStatus) {
            const errorMsg = response.error
                || response.message
                || (typeof responseData === 'string' ? responseData : null)
                || response.statusText
                || `HTTP error ${response.status || 'unknown'}`;
            return { columns: ['Ошибка'], rows: [[`Ошибка бэкенда: ${errorMsg}`]] };
        }

        if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
            return { columns: ['Сообщение'], rows: [['Немає даних']] };
        }

        if (!Array.isArray(responseData) || responseData.length === 0 || typeof responseData[0] !== 'object' || responseData[0] === null) {
            console.warn("Received unexpected data format from backend:", responseData);
            return { columns: ['Сообщение'], rows: [['Некорректный формат данных в ответе']] };
        }

        const columns = Object.keys(responseData[0]);
        const rows = responseData.map((row: any) => columns.map((col) => row[col]));
        return { columns, rows };
    } catch (err: any) {
        console.error("Error in executeReportQuery:", err);
        return { columns: ['Ошибка'], rows: [[`Ошибка запроса данных: ${err.message || 'Неизвестная ошибка'}`]] };
    }
};

// --- Helper: Process Data for Chart (Adapted) ---
const processChartData = (
    executionResult: ReportExecutionResult,
    reportConfig: ParsedReport['config']
): { chartData: ChartData; chartType: 'linear' | 'circular' } => {

    if (executionResult.columns.length === 1 && (executionResult.columns[0] === 'Ошибка' || executionResult.columns[0] === 'Сообщение')) {
        throw new Error("Неможливо побудувати графік по повідомленню про помилку або відсутність даних");
    }

    const chartConfig = reportConfig?.chart;

    if (
        !chartConfig ||
        !chartConfig.type ||
        !chartConfig.x_axis?.field ||
        !chartConfig.body_fields ||
        chartConfig.body_fields.length === 0
    ) {
        throw new Error('Конфігурація графіка (тип, осі X, поля даних) не задана чи неповна.');
    }

    const xAxisField = chartConfig.x_axis.field;
    const yAxisValueFields = chartConfig.body_fields;
    const yAxisLabels = chartConfig.y_axis?.field?.split(',').map(s => s.trim()).filter(Boolean) || yAxisValueFields;
    const yAxisTitleLabel = chartConfig.y_axis_label;

    const xAxisIndex = executionResult.columns.indexOf(xAxisField);
    const yAxisIndices = yAxisValueFields.map((field) =>
        executionResult.columns.indexOf(field)
    );

    if (xAxisIndex === -1) {
        throw new Error(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
    }
    if (chartConfig.type === 'circular' && yAxisIndices[0] === -1) {
         throw new Error(`Поле для данных '${yAxisValueFields[0]}' не найдено в результатах.`);
    }
    if (chartConfig.type !== 'circular' && yAxisIndices.some((index) => index === -1)) {
        const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
        throw new Error(`Одно или несколько полей для данных (${missing.join(', ')}) не найдены в результатах.`);
    }

    try {
        let processedChartData: ChartData;
        let determinedChartType: 'linear' | 'circular';

        if (chartConfig.type === 'circular') {
            if (yAxisIndices.length > 1) {
                console.warn("MiniReport2: Circular chart config has multiple body_fields. Using the first one:", yAxisValueFields[0]);
            }

            const segmentLabels = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? ''
            );
            const segmentValues = executionResult.rows.map((row) => {
                const value = row[yAxisIndices[0]];
                if (value === null || value === undefined) return 0;
                const num = Number(value);
                return !isNaN(num) ? num : 0;
            });
            const datasetLabel = yAxisLabels[0] || yAxisValueFields[0];

            processedChartData = {
                xAxisValues: segmentLabels,
                datasets: [{ label: datasetLabel, data: segmentValues }]
            };
            determinedChartType = 'circular';

        } else { 
            const xAxisValues = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? ''
            );
            const datasets = yAxisIndices.map((yAxisIndexVal, index) => ({
                label: yAxisLabels[index] || yAxisValueFields[index],
                data: executionResult.rows.map((row) => {
                    const value = row[yAxisIndexVal];
                    if (value === null || value === undefined) return null;
                    const num = Number(value);
                    return !isNaN(num) ? num : null;
                }),
            }));
            processedChartData = { 
                xAxisValues, 
                datasets,
                yAxisLabel: yAxisTitleLabel
             };
            determinedChartType = 'linear';
        }

        return { chartData: processedChartData, chartType: determinedChartType };

    } catch (processError: any) {
        console.error("Error processing data for chart in MiniReport2:", processError);
        throw new Error(`Ошибка при обработке данных для графика: ${processError.message}`);
    }
};


// --- MiniReport2 Component ---

const MiniReport2: React.FC<MiniReport2Props> = ({ report, parameters, displayMode, height = 'auto' }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [chartType, setChartType] = useState<'linear' | 'circular' | null>(null);
    
    // Состояние для данных и конфигурации сводного графика
    const [pivotChartData, setPivotChartData] = useState<ChartData | null>(null);
    const [pivotConfigForChart, setPivotConfigForChart] = useState<{
        xAxisField: string; yAxisField: string; valueField: string; aggregation: AggregationType;
    } | null>(null);

    // Effect to run the report when props change
    useEffect(() => {
        const runReport = async () => {
            setIsLoading(true);
            setError(null);
            setExecutionResult(null);
            setChartData(null);
            setChartType(null);
            setPivotChartData(null); // Сброс данных сводного графика
            setPivotConfigForChart(null); // Сброс конфигурации сводного графика

            try {
                const result = await executeReportQuery(report.id, parameters);
                setExecutionResult(result);

                if (displayMode === 'chart' && !(result.columns.length === 1 && (result.columns[0] === 'Ошибка' || result.columns[0] === 'Сообщение'))) {
                    try {
                        const { chartData: processedData, chartType: determinedType } = processChartData(result, report.config);
                        setChartData(processedData);
                        setChartType(determinedType);
                    } catch (chartError: any) {
                        setError(chartError.message);
                    }
                } else if (displayMode === 'chart' && result.columns.length === 1 && result.columns[0] === 'Ошибка') {
                    setError(result.rows[0]?.[0] || 'Ошибка выполнения отчета');
                } else if (displayMode === 'pivot') { // Логика для сводного графика
                    if (!(result.columns.length === 1 && (result.columns[0] === 'Ошибка' || result.columns[0] === 'Сообщение'))) {
                        try {
                            const defaults = getPivotDefaults(result); // Pass the fresh 'result'
                            if (defaults.defaultXAxisField && defaults.defaultYAxisField && defaults.defaultValueField && defaults.defaultAggregation && defaults.defaultAggregation !== AggregationType.NONE) {
                                const pivoted = generatePivotData(
                                    result.rows,
                                    result.columns,
                                    defaults.defaultXAxisField,
                                    defaults.defaultYAxisField,
                                    defaults.defaultValueField,
                                    defaults.defaultAggregation
                                );
                                const preparedPivotChartData = prepareChartDataFromPivoted(
                                    pivoted,
                                    defaults.defaultXAxisField,
                                    defaults.defaultAggregation,
                                    defaults.defaultValueField
                                );
                                setPivotChartData(preparedPivotChartData);
                                setPivotConfigForChart({
                                    xAxisField: defaults.defaultXAxisField,
                                    yAxisField: defaults.defaultYAxisField,
                                    valueField: defaults.defaultValueField,
                                    aggregation: defaults.defaultAggregation,
                                });
                            } else {
                                setError("Конфігурація для зведеного графіка неповна. Неможливо відобразити графік автоматично.");
                                setPivotConfigForChart(null);
                            }
                        } catch (pivotChartGenError: any) {
                            setError(pivotChartGenError.message || "Помилка при генерації зведеного графіка.");
                            setPivotConfigForChart(null);
                        }
                    } else {
                        setError(result.rows[0]?.[0] || 'Помилка або немає даних для зведення');
                        setPivotConfigForChart(null);
                    }
                } else if (displayMode === 'chart' && result.columns.length === 1 && result.columns[0] === 'Сообщение') {
                     setError(result.rows[0]?.[0] || 'Нет данных для графика');
                }

            } catch (err: any) {
                setError(err.message || 'Неизвестная ошибка при выполнении отчета');
            } finally {
                setIsLoading(false);
            }
        };

        runReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.id, displayMode, JSON.stringify(parameters)]);

    // Helper to get default pivot settings
    const getPivotDefaults = (currentExecutionResult: ReportExecutionResult | null) => {
        if (!currentExecutionResult)
            return { defaultAggregation: AggregationType.NONE }; // Возвращаем объект с NONE по умолчанию
        const { columns } = currentExecutionResult;
        const chartConfig = report.config?.chart;

        let dX: string | undefined = undefined;
        let dY: string | undefined = undefined;
        let dV: string | undefined = undefined;
        let dAgg: AggregationType = AggregationType.NONE;

        const isValid = (field: string | undefined): field is string => !!field && columns.includes(field);

        if (chartConfig) {
          if (isValid(chartConfig.x_axis?.field)) 
            dX = chartConfig.x_axis.field;

          if (chartConfig.body_fields && chartConfig.body_fields.length > 0) {
            for (const bf of chartConfig.body_fields) {
                if (isValid(bf) && bf !== dX) { 
                    dV = bf;
                    break; 
                }
            }
          }
          if (isValid(chartConfig.y_axis?.field)) {
            const yChart = chartConfig.y_axis.field;
            if (yChart !== dX && yChart !== dV) 
                dY = yChart;
          }
        }

        const availableForX = columns.filter(c => c !== dY && c !== dV);
        if (!dX && availableForX.length > 0) {
        dX = availableForX[0];
        }

        const availableForY = columns.filter(c => c !== dX && c !== dV);
        if (!dY && availableForY.length > 0) {
        dY = availableForY[0];
        }
        
        const availableForValue = columns.filter(c => c !== dX && c !== dY);
        if (!dV && availableForValue.length > 0) {
        dV = availableForValue[0];
        }

        if (dX && dY && dV) 
            dAgg = AggregationType.SUM;

        return { 
            defaultXAxisField: dX, 
            defaultYAxisField: dY, 
            defaultValueField: dV, 
            defaultAggregation: dAgg 
        };
    };

    // --- Rendering Logic ---

    const renderContent = () => {
        if (isLoading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 1 }} variant="body2">Завантаження...</Typography>
                </Box>
            );
        }

        if (error) {
            return <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>;
        }

        if (!executionResult) {
            return <Typography sx={{ m: 1 }}>Нет данных для отображения.</Typography>;
        }

        const isMessageResult = executionResult.columns.length === 1 && (executionResult.columns[0] === 'Сообщение' || executionResult.columns[0] === 'Ошибка');
        if (isMessageResult && displayMode !== 'pivot') { // Не показываем это сообщение, если пытаемся построить сводный график (ошибка обработается там)
             const severity = executionResult.columns[0] === 'Ошибка' ? 'error' : 'info';
             const finalSeverity = displayMode === 'chart' && severity === 'info' ? 'warning' : severity;
             return <Alert severity={finalSeverity} sx={{ m: 1 }}>{executionResult.rows[0]?.[0] ?? 'Нет данных'}</Alert>;
        }

        if (displayMode === 'table') {
            return (
                <TableContainer component={Paper} sx={{ maxHeight: '100%', overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {executionResult.columns.map((column, index) => (
                                    <TableCell key={index}>{column}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {executionResult.rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }

        if (displayMode === 'chart') {
            if (chartData && chartType) {
                return (
                    <Box sx={{ height: '100%', position: 'relative' }}>
                        {chartType === 'circular' ? (
                            <CircularChart
                                reportName={fillPlaceholders(report.name, parameters)}
                                labels={chartData.xAxisValues}
                                datasets={chartData.datasets.map(ds => ({
                                    label: ds.label,
                                    data: ds.data.map(d => d ?? 0),
                                }))}
                            />
                        ) : (
                            <LineChart
                                reportName={fillPlaceholders(report.name, parameters)}
                                xAxisValues={chartData.xAxisValues}
                                datasets={chartData.datasets}
                                yAxisLabel={chartData.yAxisLabel}
                            />
                        )}
                    </Box>
                );
            } else {
                 return <Alert severity="warning" sx={{ m: 1 }}>Не удалось подготовить данные для графика.</Alert>;
            }
        }

        if (displayMode === 'pivot') {
            if (pivotChartData && pivotConfigForChart) {
                return (
                    <Box sx={{ height: '100%', position: 'relative' }}>
                        <PivotChartContent
                            chartData={pivotChartData}
                            reportName={fillPlaceholders(report.name, parameters)}
                            // reportName={report.name}
                            xAxisField={pivotConfigForChart.xAxisField}
                            yAxisField={pivotConfigForChart.yAxisField}
                            valueField={pivotConfigForChart.valueField}
                            aggregation={pivotConfigForChart.aggregation}
                        />
                    </Box>
                );
            }
            // Ошибка для сводного графика уже должна быть в `error` и отображена выше.
            // Это запасной вариант, если что-то пошло не так с установкой `error`.
            return <Alert severity="warning" sx={{ m: 1 }}>Не вдалося згенерувати зведений графік. Перевірте конфігурацію звіту.</Alert>;
        }

        return null;
    };

    return (
        <Box sx={{ height: height, width: '100%', p: 1, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
           <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
               {renderContent()}
           </Box>
        </Box>
    );
};

export default MiniReport2; // Изменено имя экспорта