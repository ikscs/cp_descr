// ReportList.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  TextField,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getReports, type Report } from '../../api/data/reportTools';
import { fetchData, getBackend } from '../../api/data/fetchData';
import QueryParam from './QueryParam';
import packageJson from '../../../package.json';
import LineChart from '../Charts/LineChart';
import CircularChart from '../Charts/CircularChart'; // <-- 1. Импортируем CircularChart
import ReportResult from './ReportResult';
// import { get } from 'http';

const backend = getBackend();

// ... (keep existing interfaces: ReportExecutionResult, ParsedReport, ChartData, ReportToParsedReport) ...
export interface ReportExecutionResult {
  columns: string[];
  rows: any[][];
}

export interface ParsedReport {
  id: number;
  name: string;
  description: string;
  query: string;
  config: {
    params?: {
      name: string;
      description: string;
      type: string;
      notNull: boolean;
      defaultValue: string | number | boolean;
      selectOptions?: string[];
    }[];
    columns?: {
      field: string;
      width: number;
    }[];
    chart?: {
      type: 'buble' | 'linear' | 'circular' | 'other'; // Убедись, что 'circular' есть
      x_axis: { field: string };
      y_axis: { field: string }; // Используется для заголовков (линий/сегментов)
      body_fields: string[]; // Поля для данных
      y_axis_label?: string; // <-- Добавлено поле для заголовка оси Y
    };
  };
}

export const ReportToParsedReport = (report: Report): ParsedReport => {
  try {
    const configObject = report.config && typeof report.config === 'string'
      ? JSON.parse(report.config)
      : null;
    const config = typeof configObject === 'object' && configObject !== null
      ? configObject
      : { params: [], columns: [], chart: undefined };

    // Добавим проверку и установку типа графика по умолчанию, если он отсутствует
    if (config.chart && !config.chart.type) {
        config.chart.type = 'linear'; // По умолчанию линейный
    }

    // Извлекаем конфигурацию графика, если она есть
    const chartConfig = typeof config.chart === 'object' && config.chart?.type
        ? {
            type: config.chart.type,
            x_axis: config.chart.x_axis || { field: '' }, // Добавим значения по умолчанию
            y_axis: config.chart.y_axis || { field: '' }, // Добавим значения по умолчанию
            body_fields: Array.isArray(config.chart.body_fields) ? config.chart.body_fields : [], // Добавим значения по умолчанию
            y_axis_label: config.chart.y_axis_label || undefined, // <-- Извлекаем y_axis_label
          }
        : undefined;

    return {
      id: report.id,
      name: report.name || '',
      description: report.description || '',
      query: report.query || '',
      config: {
        params: Array.isArray(config.params) ? config.params : [],
        columns: Array.isArray(config.columns) ? config.columns : [],
        chart: chartConfig, // Используем извлеченную и обработанную конфигурацию графика
      },
    };
  } catch (error) {
    console.error(`Помилка розбору конфігурації для звіту ID ${report.id}:`, error, "Рядок конфігурації:", report.config);
    // Возвращаем структуру по умолчанию в случае ошибки парсинга
    return {
      id: report.id,
      name: report.name || '',
      description: report.description || '',
      query: report.query || '',
      config: { params: [], columns: [], chart: undefined },
    };
  }
};


export interface ChartData {
  xAxisValues: string[]; // Для LineChart - значения оси X, для CircularChart - метки сегментов
  datasets: { label: string; data: (number | null )[] }[]; // Для LineChart - несколько наборов данных, для CircularChart - обычно один
  yAxisLabel?: string; // <-- Добавлено необязательное поле для метки оси Y
}

// Add new prop to ReportList
interface ReportListProps {
  reportFilterPredicate?: (report: Report) => boolean;
}

const ReportList: React.FC<ReportListProps> = ({ reportFilterPredicate }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<ParsedReport | null>(null);
  const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isParamDialogOpen, setIsParamDialogOpen] = useState<boolean>(false);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartType, setChartType] = useState<'linear' | 'circular' | null>(null); // <-- 2. Состояние для типа графика
  const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<{ name: string; value: string | number | boolean }[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastShowAsChartPreference, setLastShowAsChartPreference] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const fetchedReports = await getReports();
        let reportsToSet = fetchedReports || [];
        if (reportFilterPredicate) { // Apply the predicate here
          reportsToSet = reportsToSet.filter(reportFilterPredicate);
        }
        setReports(reportsToSet);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setFetchError('Помилка при завантаженні звітів');
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [reportFilterPredicate]); // Add reportFilterPredicate to dependency array

  const filteredReports = useMemo(() => {
    if (!filterText) {
      return reports;
    }
    const lowerCaseFilter = filterText.toLowerCase();
    return reports.filter(report =>
      (report.name?.toLowerCase() || '').includes(lowerCaseFilter) ||
      (report.description?.toLowerCase() || '').includes(lowerCaseFilter)
    );
  }, [reports, filterText]);


  const handleExecuteReport = async (report: Report) => {
    const parsedReport = ReportToParsedReport(report);
    setSelectedReport(parsedReport);
    setExecutionResult(null);
    setError(null);
    setChartData(null); // Сброс данных графика при новом запуске
    setChartType(null);  // Сброс типа графика
    setLastShowAsChartPreference(false); // Сброс предпочтения для нового отчета
    if (parsedReport.config?.params?.length || 0 > 0) {
      setQueryParams((parsedReport.config.params||[]).map(p => ({ name: p.name, value: p.defaultValue }))); // Инициализация параметров по умолчанию
      setIsParamDialogOpen(true);
    } else {
      await executeReport(parsedReport, []);
    }
  };

  const handleParamDialogClose = () => {
    setIsParamDialogOpen(false);
  };

  const handleExecuteWithParams = async (
    params: { name: string; value: string | number | boolean }[],
    showAsChart: boolean
  ) => {
    setIsParamDialogOpen(false);
    setQueryParams(params);
    setLastShowAsChartPreference(showAsChart); // Сохраняем предпочтение
    if (selectedReport) {
        await executeReport(selectedReport, params, showAsChart);
    } else {
        console.error("Cannot execute report: selectedReport is null.");
        setError("Не вдалося виконати звіт: звіт не вибрано.");
    }
  };

  const executeReport = async (
    report: ParsedReport,
    params: { name: string; value: string | number | boolean }[],
    showAsChart?: boolean
  ) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setError(null);
    // chart data and type are reset when a new report is selected or params are set

    try {
      const result = await executeReportQuery(report.id, params);
      setExecutionResult(result);
      // Проверяем, есть ли ошибка в результате перед открытием диалога
      const isErrorResult = result.columns.length === 1 && (result.columns[0] === 'Помилка' || result.columns[0] === 'Повідомлення');
      if (isErrorResult && result.columns[0] === 'Помилка') {
          setError(result.rows[0]?.[0] || 'Невідома помилка виконання');
          setIsResultDialogOpen(true); 
      } else if (showAsChart && report.config?.chart && !isErrorResult) {
          handleOpenChartDialog(result); // Pass the fresh result
      } else {
          setIsResultDialogOpen(true); // Default to showing results table
      }
    } catch (err: any) {
      console.error('Error executing report:', err);
      const errorMessage = err.message || 'Невідома помилка';
      setError(`Помилка під час виконання звіту: ${errorMessage}`);
      setExecutionResult({
        columns: ['Помилка'],
        rows: [[`Не вдалося виконати звіт: ${errorMessage}`]],
      });
      setIsResultDialogOpen(true);
    } finally {
      setIsExecuting(false);
    }
  };

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
          throw new Error('Відповідь від бекенду не отримана.');
      }

      const isErrorStatus = response.ok === false || (response.status && response.status >= 400);
      const responseData = response.data || response;

      if (isErrorStatus) {
          const errorMsg = response.error
                        || response.message
                        || (typeof responseData === 'string' ? responseData : null)
                        || response.statusText
                        || `HTTP error ${response.status || 'unknown'}`;
          // Возвращаем результат с ошибкой, чтобы показать в таблице
          // throw new Error(`Backend error: ${errorMsg}`);
          return { columns: ['Помилка'], rows: [[`Помилка бекенду: ${errorMsg}`]] };
      }

      if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
        return { columns: ['Повідомлення'], rows: [['Немає даних']] };
      }

      if (!Array.isArray(responseData) || responseData.length === 0 || typeof responseData[0] !== 'object' || responseData[0] === null) {
          console.warn("Received unexpected data format from backend:", responseData);
          return { columns: ['Повідомлення'], rows: [['Некоректний формат даних у відповіді']] };
      }

      const columns = Object.keys(responseData[0]);
      const rows = responseData.map((row: any) => columns.map((col) => row[col]));
      return { columns, rows };
    } catch (err: any) {
      console.error("Error in executeReportQuery:", err);
      // Возвращаем результат с ошибкой
      return { columns: ['Помилка'], rows: [[`Помилка запиту даних: ${err.message || 'Невідома помилка'}`]] };
      // throw new Error(err.message || 'Failed to fetch or process report data.');
    }
  };


  // <-- 3. Обновляем handleOpenChartDialog -->
  const handleOpenChartDialog = (currentExecutionResult: ReportExecutionResult) => {
    setError(null); // Clear previous UI errors
    // Ensure chart dialog is closed initially if we fall back to results
    setIsChartDialogOpen(false);
    // Используем переданный currentExecutionResult вместо состояния executionResult
    if (currentExecutionResult && selectedReport) {
        // Check if the execution result itself indicates an error or just a message
        if (currentExecutionResult.columns.length === 1 && (currentExecutionResult.columns[0] === 'Помилка' || currentExecutionResult.columns[0] === 'Повідомлення')) {
            setError("Неможливо побудувати графік за повідомленням про помилку або відсутність даних.");
            setIsResultDialogOpen(true); // Fallback to showing the message in the result dialog
            return;
        }

        // Explicitly check for empty data rows before any chart processing
        if (currentExecutionResult.rows.length === 0) {
            setError("Немає даних для побудови графіка (результат виконання містить 0 рядків).");
            setIsResultDialogOpen(true); // Fallback to showing the (empty) table in result dialog
            return;
        }

        const config = selectedReport.config;
        const chartConfig = config?.chart;

        // Ensure chart config is complete
        if (
            !chartConfig ||
            !chartConfig.type || // Make sure type is defined
            !chartConfig.x_axis?.field ||
            !chartConfig.body_fields ||
            chartConfig.body_fields.length === 0
        ) {
            setError('Конфігурація графіка (тип, осі X, поля даних) не задана або неповна.');
            setIsResultDialogOpen(true); // Fallback
            return;
        }

        const xAxisField = chartConfig.x_axis.field;
        const yAxisValueFields = chartConfig.body_fields;
        // Используем y_axis.field для имен наборов данных, разделенных запятой, или fallback на body_fields
        const yAxisDatasetLabels = chartConfig.y_axis?.field?.split(',').map(s => s.trim()).filter(Boolean) || yAxisValueFields;
        const yAxisTitleLabel = chartConfig.y_axis_label; // <-- Извлекаем заголовок оси Y

        const xAxisIndex = currentExecutionResult.columns.indexOf(xAxisField);
        const yAxisIndices = yAxisValueFields.map((field) =>
            currentExecutionResult.columns.indexOf(field)
        );

        // Validate indices
        if (xAxisIndex === -1) {
            setError(`Поле для осі X '${xAxisField}' не знайдено в результатах.`);
            setIsResultDialogOpen(true); // Fallback
            return;
        }
        // For circular, we only strictly need the first Y field index
        if (chartConfig.type === 'circular' && yAxisIndices[0] === -1) {
             setError(`Поле для даних '${yAxisValueFields[0]}' не знайдено в результатах.`);
             setIsResultDialogOpen(true); // Fallback
             return;
        }
        // For linear, check all Y field indices
        if (chartConfig.type !== 'circular' && yAxisIndices.some((index) => index === -1)) {
            const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
            setError(`Одне або декілька полей для даних (${missing.join(', ')}) не знайдено в результатах.`);
            setIsResultDialogOpen(true); // Fallback
            return;
        }

        // Process data based on chart type
        try {
            let processedChartData: ChartData | null = null;
            // chartType state is already defined in the component

            if (chartConfig.type === 'circular') {
                // --- Circular Chart Data Preparation ---
                // (Existing logic for circular chart data prep)
                if (yAxisIndices.length > 1) {
                    console.warn("Конфігурація кругової діаграми має декілька body_fields. Використовується перше:", yAxisValueFields[0]);
                }

                const segmentLabels = currentExecutionResult.rows.map(
                    (row) => row[xAxisIndex]?.toString() ?? ''
                );
                const segmentValues = currentExecutionResult.rows.map((row) => {
                    const value = row[yAxisIndices[0]]; // Use first Y field
                    if (value === null || value === undefined) return 0; // Default to 0 for circular
                    const num = Number(value);
                    return !isNaN(num) ? num : 0; // Default to 0 if conversion fails
                });
                // Use the first label from y_axis.field if available, otherwise the first body_field name
                const datasetLabel = yAxisDatasetLabels[0] || yAxisValueFields[0];

                processedChartData = {
                    xAxisValues: segmentLabels, // Segment labels
                    datasets: [{ label: datasetLabel, data: segmentValues }], // Single dataset
                    // yAxisLabel здесь не используется для круговой диаграммы в ChartData, но может быть полезен в будущем
                };
                setChartType('circular');

            } else { // Default to linear or handle other types like 'linear' explicitly
                // (Existing logic for linear chart data prep)
                // --- Linear Chart Data Preparation (Existing Logic) ---
                const xAxisValues = currentExecutionResult.rows.map(
                    (row) => row[xAxisIndex]?.toString() ?? ''
                );
                const datasets = yAxisIndices.map((yAxisIndex, index) => ({
                    // Use corresponding label from y_axis.field or fallback to body_field name
                    label: yAxisDatasetLabels[index] || yAxisValueFields[index],
                    data: currentExecutionResult.rows.map((row) => {
                        const value = row[yAxisIndex];
                        if (value === null || value === undefined) return null;
                        const num = Number(value);
                        return !isNaN(num) ? num : null;
                    }),
                }));
                // Добавляем yAxisLabel в ChartData для линейного графика
                processedChartData = {
                    xAxisValues,
                    datasets,
                    yAxisLabel: yAxisTitleLabel // <-- Передаем заголовок оси Y
                };
                setChartType('linear'); // Assume linear if not circular
            }

            // Set data and open dialog if processing was successful
            if (processedChartData) {
                setChartData(processedChartData);
                setIsResultDialogOpen(false); // Close result dialog
                setIsChartDialogOpen(true); // Open chart dialog
            } else {
                 // This case might be hit if data processing logic itself determines no valid chart can be made,
                 // without throwing an error.
                 setError("Не вдалося обробити дані для графіка.");
                 setIsResultDialogOpen(true); // Fallback
            }

        } catch (processError: any) {
            console.error("Error processing data for chart:", processError);
            setError(`Помилка при обробці даних для графіка: ${processError.message}`);
            setIsResultDialogOpen(true); // Fallback
        }

    } else {
        setError("Немає даних для побудови графіка (результат виконання відсутній або звіт не вибрано)");
        setIsResultDialogOpen(true); // Fallback
    }
};


  const handleCloseChartDialog = () => {
    setIsChartDialogOpen(false);
    setChartData(null); // Clear chart data when closing
    setChartType(null); // Clear chart type
  };

  const handleResultDialogClose = () => {
    setIsResultDialogOpen(false);
    // Consider resetting executionResult, selectedReport, queryParams here if needed
    // setError(null); // Clear execution errors shown in the main list area
  };

  const handleReopenParamDialog = () => {
    if (selectedReport?.config?.params?.length || 0 > 0) {
        setIsResultDialogOpen(false);
        setIsChartDialogOpen(false);
        setChartData(null);
        setChartType(null);
        // queryParams should still hold the last used parameters
        setIsParamDialogOpen(true);
    } else {
        // If no params, maybe just close the current dialog?
        handleResultDialogClose();
        handleCloseChartDialog();
        // Optionally show a message that there are no parameters
    }
  };


  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Перелік звітів для виконання
        </Typography>
        <TextField
          label="Фільтр звітів"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
          sx={{ width: '300px' }}
        />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Alert severity="error">{fetchError}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Назва</TableCell>
                <TableCell>Опис</TableCell>
                <TableCell align="right">Дія</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.length > 0 ? (
                 filteredReports.map((report) => (
                   <TableRow
                     key={report.id}
                     hover
                     sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                   >
                     <TableCell component="th" scope="row">
                       {report.id}
                     </TableCell>
                     <TableCell>{report.name}</TableCell>
                     <TableCell>{report.description}</TableCell>
                     <TableCell align="right">
                       <IconButton
                         aria-label={`Виконати звіт ${report.name}`}
                         onClick={() => handleExecuteReport(report)}
                         disabled={isExecuting && selectedReport?.id === report.id}
                         color="primary"
                       >
                         {isExecuting && selectedReport?.id === report.id ? (
                           <CircularProgress size={24} />
                         ) : (
                           <PlayArrowIcon />
                         )}
                       </IconButton>
                     </TableCell>
                   </TableRow>
                 ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} align="center">
                        Звіти не знайдено{filterText ? ' за вашим фільтром' : ''}.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Parameter Input Dialog */}
      <Dialog
        open={isParamDialogOpen}
        onClose={handleParamDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Параметри для звіту: {selectedReport?.name || 'Завантаження...'}
        </DialogTitle>
        <DialogContent>
          {selectedReport?.config?.params ? (
              <QueryParam
                report={selectedReport}
                onExecute={handleExecuteWithParams}
                onClose={handleParamDialogClose}
                initialParams={queryParams}
                initialShowAsChart={lastShowAsChartPreference}
              />
            ) : selectedReport ? (
                // Случай, когда отчет выбран, но параметров нет (хотя логика handleExecuteReport должна это предотвращать)
                 <Typography>У цього звіту немає параметрів, що налаштовуються.</Typography>
            ) : (
              <CircularProgress />
            )
          }
        </DialogContent>
      </Dialog>

      {/* <-- 4. Обновляем рендеринг диалога графика --> */}
      <Dialog
        open={isChartDialogOpen}
        onClose={handleCloseChartDialog}
        fullWidth
        // Можно сделать ширину разной для разных типов
        maxWidth={chartType === 'circular' ? 'md' : 'lg'}
      >
        <DialogContent>
          {chartData && selectedReport && chartType ? ( // Убедимся, что все данные есть
             <Box sx={{ height: '60vh', minHeight: '400px', position: 'relative' }}>
                {chartType === 'circular' ? (
                    <CircularChart
                        reportName={selectedReport.name || ''}
                        labels={chartData.xAxisValues} // Для CircularChart это метки сегментов
                        // Данные для CircularChart: один dataset с числовыми значениями
                        datasets={chartData.datasets.map(ds => ({
                            label: ds.label, // Метка набора данных (может отображаться в легенде/тултипах)
                            data: ds.data.map(d => d ?? 0), // Преобразуем null в 0 для круговой диаграммы
                        }))}
                        onClose={handleCloseChartDialog}
                        onReopenParamDialog={handleReopenParamDialog}
                    />
                ) : ( // По умолчанию или если chartType === 'linear'
                    <LineChart
                        reportName={selectedReport.name || ''}
                        xAxisValues={chartData.xAxisValues} // Значения оси X
                        datasets={chartData.datasets} // Наборы данных для линий
                        yAxisLabel={chartData.yAxisLabel} // <-- Передаем метку оси Y
                        onClose={handleCloseChartDialog}
                        onReopenParamDialog={handleReopenParamDialog}
                    />
                )}
             </Box>
          ) : (
             // Сообщение, если данных нет или тип не определен
             <Typography align="center" sx={{ mt: 4 }}>Немає даних для відображення графіка або тип графіка не визначено.</Typography>
          )}
        </DialogContent>
      </Dialog>


      {/* Report Result Dialog */}
      {selectedReport && executionResult && isResultDialogOpen && (
        <ReportResult
          report={selectedReport}
          executionResult={executionResult}
          open={isResultDialogOpen}
          onClose={handleResultDialogClose}
          chartData={chartData} // Передаем, но ReportResult может его не использовать напрямую
          setChartData={setChartData} // Передаем, но ReportResult может его не использовать напрямую
          handleOpenChartDialog={() => { // Оборачиваем вызов, чтобы передать актуальный executionResult из состояния
            if (executionResult) {
              handleOpenChartDialog(executionResult);
            } else {
              setError("Результати виконання звіту відсутні для побудови графіка.");
            }
          }}
          onReopenParamDialog={handleReopenParamDialog} // Передаем обработчик для кнопки "Изменить параметры"
        />
      )}

      {/* Global Error Alert */}
      {error && !isResultDialogOpen && !isChartDialogOpen && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ReportList;
