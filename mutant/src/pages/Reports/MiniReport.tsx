// src/pages/Reports/MiniReport.tsx
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
import { fetchData, getBackend } from '../../api/data/fetchData';
import packageJson from '../../../package.json';
import LineChart from '../Charts/LineChart';
import CircularChart from '../Charts/CircularChart'; // <-- 1. Импортируем CircularChart
import type { ParsedReport, ReportExecutionResult, ChartData } from './ReportList';
// import { get } from 'http';

const backend = getBackend();

// --- Interfaces ---

interface MiniReportProps {
    /** The parsed report definition, including config for chart */
    report: ParsedReport;
    /** Parameters to execute the report with */
    parameters: { name: string; value: string | number | boolean }[];
    /** How to display the result */
    displayMode: 'table' | 'chart';
    /** Optional: Fixed height for the container */
    height?: string | number;
}

// --- Helper: Execute Report Query (Adapted from ReportList) ---
const executeReportQuery = async (
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
            // Возвращаем структуру ошибки, а не бросаем исключение, чтобы показать в Alert
            return { columns: ['Ошибка'], rows: [[`Ошибка бэкенда: ${errorMsg}`]] };
            // throw new Error(`Backend error: ${errorMsg}`);
        }

        if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
            // return { columns: ['Сообщение'], rows: [['Нет данных']] };
            return { columns: ['Сообщение'], rows: [['Немає даних']] };
        }

        // Basic check for valid data structure (array of objects)
        if (!Array.isArray(responseData) || responseData.length === 0 || typeof responseData[0] !== 'object' || responseData[0] === null) {
            console.warn("Received unexpected data format from backend:", responseData);
            return { columns: ['Сообщение'], rows: [['Некорректный формат данных в ответе']] };
        }

        const columns = Object.keys(responseData[0]);
        const rows = responseData.map((row: any) => columns.map((col) => row[col]));
        return { columns, rows };
    } catch (err: any) {
        console.error("Error in executeReportQuery:", err);
        // Возвращаем структуру ошибки
        return { columns: ['Ошибка'], rows: [[`Ошибка запроса данных: ${err.message || 'Неизвестная ошибка'}`]] };
        // throw new Error(err.message || 'Failed to fetch or process report data.');
    }
};

// --- Helper: Process Data for Chart (Adapted) ---
// <-- 3. Обновляем хелпер processChartData -->
const processChartData = (
    executionResult: ReportExecutionResult,
    reportConfig: ParsedReport['config']
): { chartData: ChartData; chartType: 'linear' | 'circular' } => { // <-- Возвращаем и данные, и тип

    // Check if result is just an error/message
    if (executionResult.columns.length === 1 && (executionResult.columns[0] === 'Ошибка' || executionResult.columns[0] === 'Сообщение')) {
        // throw new Error("Невозможно построить график по сообщению об ошибке или отсутствию данных.");
        throw new Error("Неможливо побудувати графік по повідомленню про помилку або відсутність даних");
    }

    const chartConfig = reportConfig?.chart;

    // Ensure chart config is complete
    if (
        !chartConfig ||
        !chartConfig.type || // Убедимся, что тип задан
        !chartConfig.x_axis?.field ||
        !chartConfig.body_fields ||
        chartConfig.body_fields.length === 0
    ) {
        // throw new Error('Конфигурация графика (тип, оси X, поля данных) не задана или неполная.');
        throw new Error('Конфігурація графіка (тип, осі X, поля даних) не задана чи неповна.');
    }

    const xAxisField = chartConfig.x_axis.field;
    const yAxisValueFields = chartConfig.body_fields;
    // Используем y_axis.field для лейблов, если есть, иначе body_fields
    const yAxisLabels = chartConfig.y_axis?.field?.split(',').map(s => s.trim()).filter(Boolean) || yAxisValueFields;
    const yAxisTitleLabel = chartConfig.y_axis_label;

    const xAxisIndex = executionResult.columns.indexOf(xAxisField);
    const yAxisIndices = yAxisValueFields.map((field) =>
        executionResult.columns.indexOf(field)
    );

    // Validate indices
    if (xAxisIndex === -1) {
        throw new Error(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
    }
    // Для круговой диаграммы нужен хотя бы первый индекс Y
    if (chartConfig.type === 'circular' && yAxisIndices[0] === -1) {
         throw new Error(`Поле для данных '${yAxisValueFields[0]}' не найдено в результатах.`);
    }
    // Для линейной проверяем все индексы Y
    if (chartConfig.type !== 'circular' && yAxisIndices.some((index) => index === -1)) {
        const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
        throw new Error(`Одно или несколько полей для данных (${missing.join(', ')}) не найдены в результатах.`);
    }

    // Process data based on chart type
    try {
        let processedChartData: ChartData;
        let determinedChartType: 'linear' | 'circular';

        if (chartConfig.type === 'circular') {
            // --- Подготовка данных для Circular Chart ---
            if (yAxisIndices.length > 1) {
                console.warn("MiniReport: Circular chart config has multiple body_fields. Using the first one:", yAxisValueFields[0]);
            }

            const segmentLabels = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? ''
            );
            const segmentValues = executionResult.rows.map((row) => {
                const value = row[yAxisIndices[0]]; // Используем первое поле Y
                if (value === null || value === undefined) return 0; // По умолчанию 0 для круговой
                const num = Number(value);
                return !isNaN(num) ? num : 0; // По умолчанию 0, если конвертация не удалась
            });
            // Используем первый лейбл из y_axis.field или имя первого body_field
            const datasetLabel = yAxisLabels[0] || yAxisValueFields[0];

            processedChartData = {
                xAxisValues: segmentLabels, // Метки сегментов
                datasets: [{ label: datasetLabel, data: segmentValues }] // Один набор данных
            };
            determinedChartType = 'circular';

        } else { // По умолчанию или если chartConfig.type === 'linear'
            // --- Подготовка данных для Line Chart (существующая логика) ---
            const xAxisValues = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? ''
            );
            const datasets = yAxisIndices.map((yAxisIndex, index) => ({
                // Используем соответствующий лейбл из y_axis.field или имя body_field
                label: yAxisLabels[index] || yAxisValueFields[index],
                data: executionResult.rows.map((row) => {
                    const value = row[yAxisIndex];
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
            determinedChartType = 'linear'; // Предполагаем линейный, если не круговой
        }

        return { chartData: processedChartData, chartType: determinedChartType };

    } catch (processError: any) {
        console.error("Error processing data for chart in MiniReport:", processError);
        throw new Error(`Ошибка при обработке данных для графика: ${processError.message}`);
    }
};


// --- MiniReport Component ---

const MiniReport: React.FC<MiniReportProps> = ({ report, parameters, displayMode, height = 'auto' }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [chartType, setChartType] = useState<'linear' | 'circular' | null>(null); // <-- 2. Добавляем состояние для типа графика

    // Effect to run the report when props change
    useEffect(() => {
        const runReport = async () => {
            setIsLoading(true);
            setError(null);
            setExecutionResult(null);
            setChartData(null);
            setChartType(null); // <-- Сбрасываем тип графика

            try {
                const result = await executeReportQuery(report.id, parameters);
                setExecutionResult(result); // Сохраняем результат в любом случае

                // Обрабатываем для графика, если нужно и если результат не ошибка/сообщение
                if (displayMode === 'chart' && !(result.columns.length === 1 && (result.columns[0] === 'Ошибка' || result.columns[0] === 'Сообщение'))) {
                    try {
                        // <-- 4. Обновляем вызов processChartData -->
                        const { chartData: processedData, chartType: determinedType } = processChartData(result, report.config);
                        setChartData(processedData);
                        setChartType(determinedType); // <-- Устанавливаем тип графика
                    } catch (chartError: any) {
                        setError(chartError.message); // Показываем ошибку обработки графика
                    }
                } else if (displayMode === 'chart' && result.columns.length === 1 && result.columns[0] === 'Ошибка') {
                    // Если режим графика, но результат - ошибка от бэкенда
                    setError(result.rows[0]?.[0] || 'Ошибка выполнения отчета');
                } else if (displayMode === 'chart' && result.columns.length === 1 && result.columns[0] === 'Сообщение') {
                     // Если режим графика, но результат - сообщение (например, "Нет данных")
                     setError(result.rows[0]?.[0] || 'Нет данных для графика'); // Отображаем как ошибку/предупреждение
                }

            } catch (err: any) { // Ловим ошибки из executeReportQuery (если он бросает исключения)
                setError(err.message || 'Неизвестная ошибка при выполнении отчета');
            } finally {
                setIsLoading(false);
            }
        };

        runReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report.id, displayMode, JSON.stringify(parameters)]); // Re-run if report, mode, or params change

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

        // Сначала показываем ошибку, если она есть (из executeReportQuery или processChartData)
        if (error) {
            return <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>;
        }

        if (!executionResult) {
            // Fallback, если не загрузка и не ошибка
            return <Typography sx={{ m: 1 }}>Нет данных для отображения.</Typography>;
        }

        // Обрабатываем специфичные результаты "Сообщение" или "Ошибка" от бэкенда, если они не были перехвачены как error выше
        const isMessageResult = executionResult.columns.length === 1 && (executionResult.columns[0] === 'Сообщение' || executionResult.columns[0] === 'Ошибка');
        if (isMessageResult) {
             const severity = executionResult.columns[0] === 'Ошибка' ? 'error' : 'info';
             // Если режим графика, а получили сообщение, лучше показать как warning/error
             const finalSeverity = displayMode === 'chart' && severity === 'info' ? 'warning' : severity;
             return <Alert severity={finalSeverity} sx={{ m: 1 }}>{executionResult.rows[0]?.[0] ?? 'Нет данных'}</Alert>;
        }


        // Display Table
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

        // Display Chart
        // <-- 5. Обновляем логику рендеринга графика -->
        if (displayMode === 'chart') {
            // Убедимся, что есть и данные, и тип графика
            if (chartData && chartType) {
                return (
                    <Box sx={{ height: '100%', position: 'relative' }}>
                        {chartType === 'circular' ? (
                            <CircularChart
                                reportName={report.name || ''}
                                labels={chartData.xAxisValues} // Метки сегментов
                                datasets={chartData.datasets.map(ds => ({
                                    label: ds.label,
                                    data: ds.data.map(d => d ?? 0), // null -> 0 для круговой
                                }))}
                            />
                        ) : ( // По умолчанию или 'linear'
                            <LineChart
                                reportName={report.name || ''}
                                xAxisValues={chartData.xAxisValues} // Значения оси X
                                datasets={chartData.datasets} // Наборы данных
                                yAxisLabel={chartData.yAxisLabel}
                            />
                        )}
                    </Box>
                );
            } else {
                // Эта ветка сработает, если обработка данных для графика не удалась,
                // но сама загрузка данных прошла успешно (и не было ошибки).
                // Ошибка должна была быть установлена в `error` и показана выше.
                // Но на всякий случай добавим сообщение.
                 return <Alert severity="warning" sx={{ m: 1 }}>Не удалось подготовить данные для графика.</Alert>;
            }
        }

        return null; // Should not be reached
    };

    // p: 1 - padding, border, borderRadius, overflow, flexDirection
    return (
        <Box sx={{ height: height, width: '100%', p: 1, border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
           {/* Optional Title */}
           {/* <Typography variant="subtitle2" gutterBottom noWrap sx={{ flexShrink: 0 }}>{report.name}</Typography> */}
           <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
               {renderContent()}
           </Box>
        </Box>
    );
};

export default MiniReport;
