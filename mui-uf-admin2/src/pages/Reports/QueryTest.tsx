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
  DialogActions, // Added for potential use if needed
} from '@mui/material';
import { ChartData, ParsedReport, ReportExecutionResult } from '../Reports/ReportList';
import { ReportDescriptor } from './QueryEdit';
import { backend, fetchData } from '../../api/data/fetchData';
import packageJson from '../../../package.json';
import ReportResult from './ReportResult';
import QueryParam from './QueryParam';
import LineChart from '../Charts/LineChart';

// Helper function to convert ReportDescriptor to ParsedReport (Keep as is)
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
  _reportData: ReportDescriptor; // Make sure ReportDescriptor is imported
  open: boolean;
  onClose: () => void;
}

const QueryTest: React.FC<QueryTestProps> = ({ _reportData, open, onClose }) => {
  const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
  const [isParamDialogOpen, setIsParamDialogOpen] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<{ name: string; value: string | number | boolean }[]>([]);
  const [reportData, setReportData] = useState<ParsedReport>(MakeParsedReport(_reportData));
  const [isChartDialogOpen, setIsChartDialogOpen] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    setReportData(MakeParsedReport(_reportData));
  }, [_reportData]);


  useEffect(() => {
    if (open) {
      // Reset state when the component becomes "active"
      setExecutionResult(null);
      setError(null);
      setIsResultDialogOpen(false);
      setIsExecuting(false); // Reset execution state
      setChartData(null);
      setIsChartDialogOpen(false);
      setIsParamDialogOpen(false); // Ensure param dialog is closed initially

      // Use the already parsed reportData state here
      const hasParams = reportData.config?.params && reportData.config.params.length > 0;
      if (hasParams) {
        // Directly open parameter dialog if needed
        setIsParamDialogOpen(true);
      } else {
        // Otherwise, execute immediately
        executeReport([]);
      }
    }
    // No else needed here, the component effectively becomes inactive when `open` is false
  }, [open, reportData]); // Rerun when open status or report data changes


  // executeReportQuery function remains the same
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

      const responseData = response.data || response;
      const isErrorStatus = response.ok === false || response.status >= 400;

      if (isErrorStatus) {
          const errorMsg = response.error || response.statusText || `HTTP error ${response.status}`;
          throw new Error(`Backend error: ${errorMsg}`);
      }

      if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
        return { columns: ['Сообщение'], rows: [['Нет данных']] };
      }

      if (!Array.isArray(responseData) || typeof responseData[0] !== 'object' || responseData[0] === null) {
          return { columns: ['Сообщение'], rows: [['Некорректный формат данных в ответе']] };
      }

      const columns = Object.keys(responseData[0]);
      const rows = responseData.map((row: any) => columns.map((col) => row[col]));
      return { columns, rows };
    } catch (err: any) {
      console.error("Error in executeReportQuery:", err);
      throw new Error(`Failed to fetch or process report data: ${err.message || err}`);
    }
  };

  // executeReport function remains largely the same
  const executeReport = async (
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setError(null);
    setIsResultDialogOpen(false); // Ensure result dialog is closed before execution
    setChartData(null);
    setIsChartDialogOpen(false);

    try {
      const result = await executeReportQuery(reportData.id, params);
      setExecutionResult(result);
      setIsResultDialogOpen(true); // Open result dialog on success
    } catch (err: any) {
      console.error('Error executing report:', err);
      const errorMessage = err.message || 'Неизвестная ошибка при выполнении отчета';
      setError(`Ошибка при выполнении отчета: ${errorMessage}`);
      // Error is now shown conditionally outside dialogs or within result/chart dialogs
    } finally {
      setIsExecuting(false);
    }
  };

  // --- Handlers for Dialogs ---

  const handleParamDialogClose = () => {
    setIsParamDialogOpen(false);
    // If user closes params without executing, close the whole test process
    onClose();
  };

  const handleExecuteWithParams = async (
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setIsParamDialogOpen(false); // Close param dialog
    setQueryParams(params);
    await executeReport(params); // Execute
  };

  const handleResultDialogClose = () => {
    setIsResultDialogOpen(false);
    // Closing the result dialog finishes the test process
    onClose();
  };

  const handleReopenParamDialog = () => {
    setIsResultDialogOpen(false);
    setIsChartDialogOpen(false);
    setIsParamDialogOpen(true); // Reopen param dialog
  };

  // --- Chart Handlers (remain the same) ---
  const handleOpenChartDialog = () => {
    setError(null);
    if (executionResult && reportData && !isExecuting) {
      const config = reportData.config;
      const chartConfig = config?.chart;

       if (executionResult.columns.length === 1 && (executionResult.columns[0] === 'Error' || executionResult.columns[0] === 'Сообщение')) {
           setError("Невозможно построить график по сообщению об ошибке или отсутствию данных.");
           setIsChartDialogOpen(false);
           return;
       }

      if (
        chartConfig &&
        chartConfig.x_axis?.field &&
        chartConfig.y_axis?.field &&
        chartConfig.body_fields &&
        chartConfig.body_fields.length > 0
      ) {
        const xAxisField = chartConfig.x_axis.field;
        const yAxisValueFields = chartConfig.body_fields;

        const xAxisIndex = executionResult.columns.indexOf(xAxisField);
        const yAxisIndices = yAxisValueFields.map((field) =>
          executionResult.columns.indexOf(field)
        );

        if (xAxisIndex === -1) {
            setError(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
            return;
        }
        if (yAxisIndices.some((index) => index === -1)) {
            const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
            setError(`Одно или несколько полей для данных (${missing.join(', ')}) не найдены в результатах.`);
            return;
        }

        try {
            const xAxisValues = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? ''
            );
            const datasets = yAxisIndices.map((yAxisIndex, index) => ({
                label: yAxisValueFields[index],
                data: executionResult.rows.map((row) => {
                const value = row[yAxisIndex];
                let num: any = Number(value);
                if (value === null || value === undefined)
                  num = null;
                return !isNaN(num) ? num : null;
                }),
            }));

            setChartData({ xAxisValues, datasets });
            setIsResultDialogOpen(false); // Close result table dialog if open
            setIsChartDialogOpen(true); // Open chart dialog
        } catch (processError: any) {
            console.error("Error processing data for chart:", processError);
            setError(`Ошибка при обработке данных для графика: ${processError.message}`);
        }

      } else {
        setError('Конфигурация графика (оси X, поля данных) не задана или неполная в настройках отчета.');
      }
    } else if (isExecuting) {
        setError("Дождитесь завершения выполнения отчета перед построением графика.");
    } else {
        setError("Нет данных для построения графика.");
    }
  };

  const handleCloseChartDialog = () => {
    setIsChartDialogOpen(false);
    // Closing the chart dialog finishes the test process
    onClose();
  };


  // --- Rendering Logic ---
  // No initial dialog needed. Render other dialogs or loading/error directly.
  return (
    <>
      {/* Conditionally render loading indicator if executing and no other dialog is open */}
      {isExecuting && !isParamDialogOpen && !isResultDialogOpen && !isChartDialogOpen && (
         <Dialog open={true} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
           <DialogContent style={{ textAlign: 'center' }}>
             <CircularProgress />
             <Typography>Выполнение отчета...</Typography>
           </DialogContent>
         </Dialog>
      )}

      {/* Conditionally render error if present and no other dialog is handling it */}
      {error && !isParamDialogOpen && !isResultDialogOpen && !isChartDialogOpen && (
         <Dialog open={true} onClose={onClose}>
           <DialogTitle>Ошибка</DialogTitle>
           <DialogContent>
             <Alert severity="error">{error}</Alert>
           </DialogContent>
           <DialogActions>
             <Button onClick={onClose}>Закрыть</Button>
           </DialogActions>
         </Dialog>
      )}

      {/* Parameter Input Dialog */}
      {/* Check for reportData.config?.params to prevent rendering before reportData is ready */}
      {reportData?.config?.params && (
        <Dialog
          open={isParamDialogOpen}
          onClose={handleParamDialogClose} // Use updated handler
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Параметры для тестового отчета: {reportData.name}
          </DialogTitle>
          <DialogContent>
            <QueryParam
              report={reportData}
              onExecute={handleExecuteWithParams}
              onClose={handleParamDialogClose} // Use updated handler
              initialParams={queryParams}
            />
          </DialogContent>
        </Dialog>
      )}


      {/* Report Result Dialog */}
      {/* Ensure executionResult and reportData exist before rendering */}
      {isResultDialogOpen && executionResult && reportData && (
        <ReportResult
          report={reportData}
          executionResult={executionResult}
          open={isResultDialogOpen}
          onClose={handleResultDialogClose} // Use updated handler
          chartData={chartData}
          setChartData={setChartData} // Keep passing, though ReportResult might not use it
          handleOpenChartDialog={handleOpenChartDialog}
          onReopenParamDialog={handleReopenParamDialog}
        />
      )}

       {/* Chart Dialog */}
       {/* Ensure reportData exists */}
       {reportData && (
         <Dialog
           open={isChartDialogOpen}
           onClose={handleCloseChartDialog} // Use updated handler
           fullWidth
           maxWidth="md"
         >
           <DialogTitle>График: {reportData.name}</DialogTitle>
           <DialogContent>
             {/* Display error specific to chart generation if chart dialog is open */}
             {error && isChartDialogOpen && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
             )}
             {chartData && (
               <LineChart
                 reportName={reportData.name || ''}
                 xAxisValues={chartData.xAxisValues}
                 datasets={chartData.datasets}
                 onClose={handleCloseChartDialog} // Use updated handler
                 onReopenParamDialog={handleReopenParamDialog}
               />
             )}
             {/* Show loading indicator inside chart dialog if needed? Unlikely needed here. */}
           </DialogContent>
         </Dialog>
       )}
    </>
  );
};

export default QueryTest;
