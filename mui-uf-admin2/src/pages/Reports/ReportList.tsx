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
import { getReports, Report } from '../../api/data/reportTools';
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
    console.error(`Error parsing config for report ID ${report.id}:`, error, "Config string:", report.config);
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


const ReportList: React.FC = () => {
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
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const fetchedReports = await getReports();
        setReports(fetchedReports || []);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setFetchError('Ошибка при загрузке отчетов');
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

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
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setIsParamDialogOpen(false);
    setQueryParams(params);
    if (selectedReport) {
        await executeReport(selectedReport, params);
    } else {
        console.error("Cannot execute report: selectedReport is null.");
        setError("Не удалось выполнить отчет: отчет не выбран.");
    }
  };

  const executeReport = async (
    report: ParsedReport,
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setError(null);

    try {
      const result = await executeReportQuery(report.id, params);
      setExecutionResult(result);
      // Проверяем, есть ли ошибка в результате перед открытием диалога
      const isErrorResult = result.columns.length === 1 && (result.columns[0] === 'Ошибка' || result.columns[0] === 'Сообщение');
      if (isErrorResult && result.columns[0] === 'Ошибка') {
          setError(result.rows[0]?.[0] || 'Неизвестная ошибка выполнения');
      }
      setIsResultDialogOpen(true);
    } catch (err: any) {
      console.error('Error executing report:', err);
      const errorMessage = err.message || 'Неизвестная ошибка';
      setError(`Ошибка при выполнении отчета: ${errorMessage}`);
      setExecutionResult({
        columns: ['Ошибка'],
        rows: [[`Не удалось выполнить отчет: ${errorMessage}`]],
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
          // Возвращаем результат с ошибкой, чтобы показать в таблице
          // throw new Error(`Backend error: ${errorMsg}`);
          return { columns: ['Ошибка'], rows: [[`Ошибка бэкенда: ${errorMsg}`]] };
      }

      if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
        return { columns: ['Сообщение'], rows: [['Нет данных']] };
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
      // Возвращаем результат с ошибкой
      return { columns: ['Ошибка'], rows: [[`Ошибка запроса данных: ${err.message || 'Неизвестная ошибка'}`]] };
      // throw new Error(err.message || 'Failed to fetch or process report data.');
    }
  };


  // <-- 3. Обновляем handleOpenChartDialog -->
  const handleOpenChartDialog = () => {
    setError(null); // Clear previous UI errors
    if (executionResult && selectedReport) {
        // Check if the execution result itself indicates an error or just a message
        if (executionResult.columns.length === 1 && (executionResult.columns[0] === 'Ошибка' || executionResult.columns[0] === 'Сообщение')) {
            setError("Невозможно построить график по сообщению об ошибке или отсутствию данных.");
            // Don't proceed to open the chart dialog
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
            setError('Конфигурация графика (тип, оси X, поля данных) не задана или неполная.');
            return;
        }

        const xAxisField = chartConfig.x_axis.field;
        const yAxisValueFields = chartConfig.body_fields;
        // Используем y_axis.field для имен наборов данных, разделенных запятой, или fallback на body_fields
        const yAxisDatasetLabels = chartConfig.y_axis?.field?.split(',').map(s => s.trim()).filter(Boolean) || yAxisValueFields;
        const yAxisTitleLabel = chartConfig.y_axis_label; // <-- Извлекаем заголовок оси Y

        const xAxisIndex = executionResult.columns.indexOf(xAxisField);
        const yAxisIndices = yAxisValueFields.map((field) =>
            executionResult.columns.indexOf(field)
        );

        // Validate indices
        if (xAxisIndex === -1) {
            setError(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
            return;
        }
        // For circular, we only strictly need the first Y field index
        if (chartConfig.type === 'circular' && yAxisIndices[0] === -1) {
             setError(`Поле для данных '${yAxisValueFields[0]}' не найдено в результатах.`);
             return;
        }
        // For linear, check all Y field indices
        if (chartConfig.type !== 'circular' && yAxisIndices.some((index) => index === -1)) {
            const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
            setError(`Одно или несколько полей для данных (${missing.join(', ')}) не найдены в результатах.`);
            return;
        }

        // Process data based on chart type
        try {
            let processedChartData: ChartData | null = null;

            if (chartConfig.type === 'circular') {
                // --- Circular Chart Data Preparation ---
                if (yAxisIndices.length > 1) {
                    console.warn("Circular chart config has multiple body_fields. Using the first one:", yAxisValueFields[0]);
                }

                const segmentLabels = executionResult.rows.map(
                    (row) => row[xAxisIndex]?.toString() ?? ''
                );
                const segmentValues = executionResult.rows.map((row) => {
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
                // --- Linear Chart Data Preparation (Existing Logic) ---
                const xAxisValues = executionResult.rows.map(
                    (row) => row[xAxisIndex]?.toString() ?? ''
                );
                const datasets = yAxisIndices.map((yAxisIndex, index) => ({
                    // Use corresponding label from y_axis.field or fallback to body_field name
                    label: yAxisDatasetLabels[index] || yAxisValueFields[index],
                    data: executionResult.rows.map((row) => {
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
                 setError("Не удалось обработать данные для графика.");
            }

        } catch (processError: any) {
            console.error("Error processing data for chart:", processError);
            setError(`Ошибка при обработке данных для графика: ${processError.message}`);
        }

    } else {
        setError("Нет данных для построения графика (результат выполнения отсутствует или отчет не выбран).");
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
          Список отчетов для выполнения
        </Typography>
        <TextField
          label="Фильтр отчетов"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
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
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell align="right">Действие</TableCell>
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
                         aria-label={`Выполнить отчет ${report.name}`}
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
                        Отчеты не найдены{filterText ? ' по вашему фильтру' : ''}.
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
          Параметры для отчета: {selectedReport?.name || 'Загрузка...'}
        </DialogTitle>
        <DialogContent>
          {selectedReport?.config?.params ? (
              <QueryParam
                report={selectedReport}
                onExecute={handleExecuteWithParams}
                onClose={handleParamDialogClose}
                initialParams={queryParams}
              />
            ) : selectedReport ? (
                // Случай, когда отчет выбран, но параметров нет (хотя логика handleExecuteReport должна это предотвращать)
                 <Typography>У этого отчета нет настраиваемых параметров.</Typography>
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
             <Typography align="center" sx={{ mt: 4 }}>Нет данных для отображения графика или тип графика не определен.</Typography>
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
          handleOpenChartDialog={handleOpenChartDialog} // Передаем обработчик для кнопки "График"
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
