// QueryTest.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  Typography,
  DialogActions,
} from '@mui/material';
import { ChartData, ParsedReport, ReportExecutionResult } from '../Reports/ReportList';
import { ReportDescriptor } from './QueryEdit';
import { backend, fetchData } from '../../api/data/fetchData';
import packageJson from '../../../package.json';
import ReportResult from './ReportResult'; // ReportResult IS a Dialog
import QueryParam from './QueryParam';     // QueryParam is NOT a Dialog (it's content)
import LineChart from '../Charts/LineChart'; // LineChart is NOT a Dialog (it's content)

// Helper function to convert ReportDescriptor to ParsedReport
const MakeParsedReport = (reportData: ReportDescriptor): ParsedReport => {
  const config = reportData.report_config || {};
  const params = config.params || [];
  const columns = config.columns || [];
  const chart = config.chart;

  return {
    id: reportData.report_id,
    name: reportData.report_name,
    description: reportData.report_description,
    query: reportData.query,
    config: {
      params: params.map((param) => ({
        name: param.name,
        description: param.description,
        type: param.type,
        notNull: param.notNull,
        defaultValue:
          param.type === 'boolean'
            ? false
            : param.type === 'number'
            ? 0
            : '',
        selectOptions: param.selectOptions || [],
      })),
      columns: columns.map((col) => ({
        field: col.field,
        width: col.width,
      })),
      chart: chart,
    },
  };
};


interface QueryTestProps {
  _reportData: ReportDescriptor;
  open: boolean; // Controls overall visibility from parent
  onClose: () => void; // Function to call when QueryTest should close
}

const QueryTest: React.FC<QueryTestProps> = ({ _reportData, open, onClose }) => {
  // State for internal logic
  const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
  // const [isExecuting, setIsExecuting] = useState<boolean>(false); // Replaced by currentView
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'idle' | 'params' | 'executing' | 'results' | 'chart' | 'error'>('idle');
  const [queryParams, setQueryParams] = useState<{ name: string; value: string | number | boolean }[]>([]);
  const [reportData, setReportData] = useState<ParsedReport>(MakeParsedReport(_reportData));
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Update parsed report data when input changes
  useEffect(() => {
    setReportData(MakeParsedReport(_reportData));
  }, [_reportData]);

  // Effect to manage state transitions when 'open' prop changes
  useEffect(() => {
    if (open) {
      // Reset internal state when dialog is opened
      setExecutionResult(null);
      setError(null);
      setChartData(null);
      // setIsExecuting(false); // No longer needed

      // Determine initial view: params or execute directly
      const hasParams = reportData.config?.params && reportData.config.params.length > 0;
      if (hasParams) {
        // Reset queryParams only if opening fresh, keep if reopening from error/result?
        // Let's reset for simplicity on initial open.
        // setQueryParams(reportData.config.params.map(p => ({ name: p.name, value: p.defaultValue }))); // Initialize params
        setCurrentView('params');
      } else {
        executeReport([]); // Execute immediately if no params
      }
    } else {
      // Reset view when dialog is closed externally
      setCurrentView('idle');
    }
  }, [open]); // Rerun only when 'open' changes

  // Effect to update reportData state without triggering initial execution logic again
  useEffect(() => {
      setReportData(MakeParsedReport(_reportData));
  }, [_reportData]);


  // --- Data Fetching ---
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

      // Check if response indicates an error (e.g., !response.ok, status >= 400)
      // Adapt this based on your actual fetchData structure and how errors are returned
      const isErrorStatus = response.ok === false || response.status >= 400;
      const responseData = response.data || response; // Adjust based on where data/error is

      if (isErrorStatus) {
          // Try to get a meaningful error message
          const errorMsg = response.error // If backend sends { error: '...' }
                        || response.message // If backend sends { message: '...' }
                        || (typeof responseData === 'string' ? responseData : null) // If error is just a string response
                        || response.statusText // Standard HTTP status text
                        || `HTTP error ${response.status}`;
          throw new Error(`Backend error: ${errorMsg}`);
      }


      if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
        return { columns: ['Сообщение'], rows: [['Нет данных']] };
      }

      // Basic check for valid data structure (array of objects)
      if (!Array.isArray(responseData) || responseData.length === 0 || typeof responseData[0] !== 'object' || responseData[0] === null) {
          // Consider logging the actual responseData structure here for debugging
          console.warn("Received unexpected data format from backend:", responseData);
          return { columns: ['Сообщение'], rows: [['Некорректный формат данных в ответе']] };
      }

      const columns = Object.keys(responseData[0]);
      const rows = responseData.map((row: any) => columns.map((col) => row[col]));
      return { columns, rows };
    } catch (err: any) {
      console.error("Error in executeReportQuery:", err);
      // Rethrow a more specific error or the original one
      throw new Error(`Failed to fetch or process report data: ${err.message || err}`);
    }
  };

  // --- Core Execution Logic ---
  const executeReport = async (
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setCurrentView('executing'); // Show loading state
    setExecutionResult(null);
    setError(null);
    setChartData(null);

    try {
      // Ensure reportData is available before accessing id
      if (!reportData) {
          throw new Error("Report data is not available.");
      }
      const result = await executeReportQuery(reportData.id, params);
      setExecutionResult(result);
      setCurrentView('results'); // Show results view on success
    } catch (err: any) {
      console.error('Error executing report:', err);
      const errorMessage = err.message || 'Неизвестная ошибка при выполнении отчета';
      setError(`Ошибка при выполнении отчета: ${errorMessage}`);
      setCurrentView('error'); // Show error view on failure
    }
  };

  // --- Event Handlers ---

  // Close the entire QueryTest component
  const handleClose = () => {
    setCurrentView('idle'); // Reset internal state
    onClose(); // Call parent's close handler
  };

  // Close parameter view and trigger main close
  const handleParamDialogClose = () => {
    handleClose();
  };

  // Execute from parameters view
  const handleExecuteWithParams = async (
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setQueryParams(params); // Store params in case user goes back
    await executeReport(params); // This will change currentView
  };

  // Close results view and trigger main close
  const handleResultDialogClose = () => {
    handleClose();
  };

  // Go back to parameters view from results/chart/error
  const handleReopenParamDialog = () => {
    // Reset results/chart/error states before going back
    setExecutionResult(null);
    setChartData(null);
    setError(null);
    setCurrentView('params');
  };

  // Prepare and switch to chart view
  const handleOpenChartDialog = () => {
    setError(null); // Clear previous errors specific to chart generation
    if (executionResult && reportData) {
       // Check if result is just an error/message
       if (executionResult.columns.length === 1 && (executionResult.columns[0] === 'Error' || executionResult.columns[0] === 'Сообщение')) {
           setError("Невозможно построить график по сообщению об ошибке или отсутствию данных.");
           setCurrentView('error'); // Switch to error view
           return;
       }

      const config = reportData.config;
      const chartConfig = config?.chart;

      if (
        chartConfig &&
        chartConfig.x_axis?.field &&
        chartConfig.body_fields &&
        chartConfig.body_fields.length > 0
      ) {
        const xAxisField = chartConfig.x_axis.field;
        const yAxisValueFields = chartConfig.body_fields; // These are the fields for the lines
        const labels = ['11', '12', '13',];

        const xAxisIndex = executionResult.columns.indexOf(xAxisField);
        const yAxisIndices = yAxisValueFields.map((field) =>
          executionResult.columns.indexOf(field)
        );

        // Validate indices
        if (xAxisIndex === -1) {
            setError(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
            setCurrentView('error');
            return;
        }
        if (yAxisIndices.some((index) => index === -1)) {
            const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
            setError(`Одно или несколько полей для данных (${missing.join(', ')}) не найдены в результатах.`);
            setCurrentView('error');
            return;
        }

        // Process data
        try {
            const xAxisValues = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? '' // Ensure string conversion
            );
            const datasets = yAxisIndices.map((yAxisIndex, index) => ({
                label: yAxisValueFields[index], // Use the field name as label
                // todo: label: labels[index],
                data: executionResult.rows.map((row) => {
                    const value = row[yAxisIndex];
                    // Convert to number, handle null/undefined explicitly
                    if (value === null || value === undefined) return null;
                    const num = Number(value);
                    return !isNaN(num) ? num : null; // Return null if conversion fails
                }),
                // Add other dataset properties if needed (colors, etc.) - LineChart handles defaults
            }));

            setChartData({ xAxisValues, datasets });
            setCurrentView('chart'); // Switch to chart view
        } catch (processError: any) {
            console.error("Error processing data for chart:", processError);
            setError(`Ошибка при обработке данных для графика: ${processError.message}`);
            setCurrentView('error');
        }

      } else {
        setError('Конфигурация графика (оси X, поля данных) не задана или неполная в настройках отчета.');
        setCurrentView('error');
      }
    } else {
        setError("Нет данных для построения графика (результат выполнения отсутствует).");
        setCurrentView('error');
    }
  };

  // Close chart view and trigger main close
  const handleCloseChartDialog = () => {
    handleClose();
  };

  // --- Rendering Logic ---

  // Render nothing if the main 'open' prop is false or view is 'idle'
  if (!open || currentView === 'idle') {
    return null;
  }

  // Render Loading Dialog
  if (currentView === 'executing') {
    return (
      <Dialog open={true} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
        <DialogContent style={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography>Выполнение отчета...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Parameter Dialog Content
  if (currentView === 'params') {
    // Ensure reportData and its config/params are loaded before rendering
    const paramsExist = reportData?.config?.params && reportData.config.params.length > 0;
    return (
      <Dialog
        open={true} // Always open when view is 'params' and parent 'open' is true
        onClose={handleParamDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Параметры для тестового отчета: {reportData?.name || 'Загрузка...'}
        </DialogTitle>
        <DialogContent>
          {reportData && paramsExist ? ( // Check if reportData is loaded and params exist
            <QueryParam
              report={reportData}
              onExecute={handleExecuteWithParams}
              onClose={handleParamDialogClose}
              initialParams={queryParams} // Use stored params if re-opening
            />
          ) : reportData ? ( // reportData loaded but no params
             <Box>
                <Typography sx={{mb: 2}}>У отчета нет настраиваемых параметров.</Typography>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                     <Button onClick={handleParamDialogClose}>Отмена</Button>
                     {/* Button to execute directly if needed, though it should have happened automatically */}
                     {/* <Button variant="contained" onClick={() => executeReport([])}>Выполнить</Button> */}
                 </Box>
             </Box>
          ) : ( // reportData still loading
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Render Results Dialog (using ReportResult component which is a Dialog)
  if (currentView === 'results' && executionResult && reportData) {
    return (
      <ReportResult
        report={reportData}
        executionResult={executionResult}
        open={true} // ReportResult manages its own visibility via this prop
        onClose={handleResultDialogClose} // Closes the whole test
        chartData={chartData} // Pass chartData (might be null)
        setChartData={setChartData} // Pass setter (might be unused by ReportResult)
        handleOpenChartDialog={handleOpenChartDialog} // Pass handler to switch view to chart
        onReopenParamDialog={handleReopenParamDialog} // Pass handler to switch view to params
      />
    );
  }

  // Render Chart Dialog Content
  if (currentView === 'chart' && chartData && reportData) {
    return (
      <Dialog
        open={true} // Always open when view is 'chart'
        onClose={handleCloseChartDialog} // Closes the whole test
        fullWidth
        maxWidth="lg" // Use lg for potentially wider charts
      >
        <DialogTitle sx={{ pb: 0 }}>График: {reportData.name}</DialogTitle>
        <DialogContent>
          {/* LineChart component expects data and options */}
          {/* Wrap LineChart in a Box to ensure it takes height */}
           <Box sx={{ height: '60vh', minHeight: '400px', position: 'relative' }}>
              <LineChart
                reportName={reportData.name || ''}
                xAxisValues={chartData.xAxisValues}
                datasets={chartData.datasets}
                onClose={handleCloseChartDialog} // Close the whole test
                onReopenParamDialog={handleReopenParamDialog} // Go back to params
              />
           </Box>
        </DialogContent>
        {/* Actions like close/reopen params are handled by LineChart's internal buttons */}
      </Dialog>
    );
  }

  // Render Error Dialog
  if (currentView === 'error' && error) {
    const canReopenParams = reportData?.config?.params && reportData.config.params.length > 0;
    return (
      <Dialog open={true} onClose={handleClose}> {/* Close triggers main onClose */}
        <DialogTitle>Ошибка</DialogTitle>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          {/* Allow going back to params if applicable */}
          {canReopenParams && (
             <Button onClick={handleReopenParamDialog}>Изменить параметры</Button>
          )}
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Fallback if state is inconsistent (should not happen with proper view management)
  console.warn("QueryTest reached inconsistent render state:", currentView);
  return null;
};

export default QueryTest;
