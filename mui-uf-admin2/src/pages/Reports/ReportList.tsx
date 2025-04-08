// ReportList.tsx
import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
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
  TextField, // Import TextField
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getReports, Report } from '../../api/data/reportTools';
import { backend, fetchData } from '../../api/data/fetchData';
import QueryParam from './QueryParam';
import packageJson from '../../../package.json';
import LineChart from '../Charts/LineChart';
import ReportResult from './ReportResult';

// ... (keep existing interfaces: ReportExecutionResult, ParsedReport, ChartData) ...
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
      // type: string;
      type: 'buble' | 'linear' | 'circular' | 'other';
      x_axis: { field: string };
      y_axis: { field: string };
      body_fields: string[];
    };
  };
}

const ReportToParsedReport = (report: Report): ParsedReport => {
  try {
    // Add basic check for config string before parsing
    const configObject = report.config && typeof report.config === 'string'
      ? JSON.parse(report.config)
      : null; // Or provide a default empty config object if needed

    // Ensure config is an object, even if parsing fails or config is null/undefined
    const config = typeof configObject === 'object' && configObject !== null
      ? configObject
      : { params: [], columns: [], chart: undefined }; // Default structure

    return {
      id: report.id,
      name: report.name || '', // Ensure name is a string
      description: report.description || '', // Ensure description is a string
      query: report.query || '', // Ensure query is a string
      config: { // Ensure config and its properties exist
        params: Array.isArray(config.params) ? config.params : [],
        columns: Array.isArray(config.columns) ? config.columns : [],
        chart: typeof config.chart === 'object' ? config.chart : undefined,
      },
    };
  } catch (error) {
    console.error(`Error parsing config for report ID ${report.id}:`, error, "Config string:", report.config);
    // Return a default ParsedReport structure in case of error
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
  xAxisValues: string[];
  datasets: { label: string; data: (number | null )[] }[];
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
  const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<{ name: string; value: string | number | boolean }[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>(''); // State for the filter input

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const fetchedReports = await getReports();
        setReports(fetchedReports || []); // Ensure reports is always an array
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

  // Memoize filtered reports to avoid recalculating on every render
  const filteredReports = useMemo(() => {
    if (!filterText) {
      return reports; // Return all reports if filter is empty
    }
    const lowerCaseFilter = filterText.toLowerCase();
    return reports.filter(report =>
      (report.name?.toLowerCase() || '').includes(lowerCaseFilter) ||
      (report.description?.toLowerCase() || '').includes(lowerCaseFilter)
    );
  }, [reports, filterText]); // Recalculate only when reports or filterText changes


  const handleExecuteReport = async (report: Report) => {
    const parsedReport = ReportToParsedReport(report); // Parse here
    setSelectedReport(parsedReport);
    setExecutionResult(null);
    setError(null);
    // Use the parsedReport's config
    if (parsedReport.config && parsedReport.config.params && parsedReport.config.params.length > 0) {
      setIsParamDialogOpen(true);
    } else {
      await executeReport(parsedReport, []); // Pass parsedReport
    }
  };

  const handleParamDialogClose = () => {
    setIsParamDialogOpen(false);
    // Optionally reset selectedReport if needed when closing param dialog without execution
    // setSelectedReport(null);
  };

  const handleExecuteWithParams = async (
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setIsParamDialogOpen(false);
    setQueryParams(params); // Store params used for potential re-open
    if (selectedReport) { // Ensure selectedReport is not null
        await executeReport(selectedReport, params);
    } else {
        console.error("Cannot execute report: selectedReport is null.");
        setError("Не удалось выполнить отчет: отчет не выбран.");
        // Potentially show an error message to the user
    }
  };

  const executeReport = async (
    report: ParsedReport,
    params: { name: string; value: string | number | boolean }[]
  ) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setError(null); // Clear previous errors

    try {
      const result = await executeReportQuery(report.id, params);
      setExecutionResult(result);
      setIsResultDialogOpen(true); // Open result dialog on success
    } catch (err: any) { // Catch specific error type if possible
      console.error('Error executing report:', err);
      const errorMessage = err.message || 'Неизвестная ошибка';
      setError(`Ошибка при выполнении отчета: ${errorMessage}`);
      // Optionally set a specific error state for the result dialog
      setExecutionResult({
        columns: ['Ошибка'],
        rows: [[`Не удалось выполнить отчет: ${errorMessage}`]],
      });
      setIsResultDialogOpen(true); // Still open result dialog to show the error
    } finally {
      setIsExecuting(false);
    }
  };

  const executeReportQuery = async (
    id: number,
    params: { name: string; value: string | number | boolean }[]
  ): Promise<ReportExecutionResult> => {
    // Keep the existing implementation, but enhance error handling
    try {
      const paramsToSend = {
        backend_point: backend.backend_point_report,
        app_id: packageJson.name,
        report_id: id,
        parameters: params,
      };

      const response: any = await fetchData(paramsToSend);

      // --- Improved Error Handling ---
      if (!response) {
          throw new Error('No response received from backend.');
      }

      // Check for explicit error flags or status codes from fetchData/backend
      // This depends on how fetchData signals errors (e.g., response.ok, response.status)
      const isErrorStatus = response.ok === false || (response.status && response.status >= 400);
      const responseData = response.data || response; // Adjust based on where data/error message is

      if (isErrorStatus) {
          // Try to extract a meaningful error message from the response
          const errorMsg = response.error // If backend sends { error: '...' }
                        || response.message // If backend sends { message: '...' }
                        || (typeof responseData === 'string' ? responseData : null) // If error is just a string response
                        || response.statusText // Standard HTTP status text
                        || `HTTP error ${response.status || 'unknown'}`;
          throw new Error(`Backend error: ${errorMsg}`);
      }
      // --- End Improved Error Handling ---


      // Handle empty results specifically
      if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
        return { columns: ['Сообщение'], rows: [['Нет данных']] };
      }

      // Basic check for valid data structure (array of objects)
      if (!Array.isArray(responseData) || typeof responseData[0] !== 'object' || responseData[0] === null) {
          console.warn("Received unexpected data format from backend:", responseData);
          // You might want to throw an error here instead, depending on requirements
          return { columns: ['Сообщение'], rows: [['Некорректный формат данных в ответе']] };
      }


      const columns = Object.keys(responseData[0]);
      const rows = responseData.map((row: any) => columns.map((col) => row[col]));
      return { columns, rows };
    } catch (err: any) {
      console.error("Error in executeReportQuery:", err);
      // Rethrow the error to be caught by the calling executeReport function
      // This allows the UI to display a user-friendly message via the setError state
      throw new Error(err.message || 'Failed to fetch or process report data.');
    }
  };


  const handleOpenChartDialog = () => {
    setError(null); // Clear previous errors
    if (executionResult && selectedReport) {
       // Check if result is just an error/message
       if (executionResult.columns.length === 1 && (executionResult.columns[0] === 'Ошибка' || executionResult.columns[0] === 'Сообщение')) {
           setError("Невозможно построить график по сообщению об ошибке или отсутствию данных.");
           // Optionally close the result dialog and show error alert, or keep result dialog open
           // setIsResultDialogOpen(false); // Example: close result dialog
           return; // Stop chart generation
       }

      const config = selectedReport.config;
      const chartConfig = config?.chart;

      if (
        chartConfig &&
        chartConfig.x_axis?.field && // Check field exists
        chartConfig.body_fields &&
        chartConfig.body_fields.length > 0
      ) {
        const xAxisField = chartConfig.x_axis.field;
        const yAxisValueFields = chartConfig.body_fields; // These are the fields for the lines

        const xAxisIndex = executionResult.columns.indexOf(xAxisField);
        const yAxisIndices = yAxisValueFields.map((field) =>
          executionResult.columns.indexOf(field)
        );

        // Validate indices
        if (xAxisIndex === -1) {
            setError(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
            // setIsResultDialogOpen(false); // Optionally close result dialog
            return;
        }
        if (yAxisIndices.some((index) => index === -1)) {
            const missing = yAxisValueFields.filter((_, i) => yAxisIndices[i] === -1);
            setError(`Одно или несколько полей для данных (${missing.join(', ')}) не найдены в результатах.`);
            // setIsResultDialogOpen(false); // Optionally close result dialog
            return;
        }

        // Process data
        try {
            const xAxisValues = executionResult.rows.map(
                (row) => row[xAxisIndex]?.toString() ?? '' // Ensure string conversion, handle null/undefined
            );
            const datasets = yAxisIndices.map((yAxisIndex, index) => ({
                label: yAxisValueFields[index], // Use the field name as label
                data: executionResult.rows.map((row) => {
                    const value = row[yAxisIndex];
                    // Convert to number, handle null/undefined explicitly
                    if (value === null || value === undefined) return null;
                    const num = Number(value);
                    return !isNaN(num) ? num : null; // Return null if conversion fails
                }),
                // Add other dataset properties if needed (colors, etc.)
            }));

            setChartData({ xAxisValues, datasets });
            setIsResultDialogOpen(false); // Close result dialog
            setIsChartDialogOpen(true); // Open chart dialog
        } catch (processError: any) {
            console.error("Error processing data for chart:", processError);
            setError(`Ошибка при обработке данных для графика: ${processError.message}`);
            // setIsResultDialogOpen(false); // Optionally close result dialog
        }

      } else {
        setError('Конфигурация графика (оси X, поля данных) не задана или неполная.');
        // setIsResultDialogOpen(false); // Optionally close result dialog
      }
    } else {
        setError("Нет данных для построения графика (результат выполнения отсутствует).");
        // setIsResultDialogOpen(false); // Optionally close result dialog
    }
  };


  const handleCloseChartDialog = () => {
    setIsChartDialogOpen(false);
    setChartData(null); // Clear chart data when closing
  };

  const handleResultDialogClose = () => {
    setIsResultDialogOpen(false);
    // Reset states related to the specific execution when closing results
    // setExecutionResult(null); // Keep result if user might reopen? Decide based on UX.
    // setSelectedReport(null); // Keep selected report for context?
    // setQueryParams([]); // Reset params used?
    setError(null); // Clear any execution errors shown in the main list area
  };

  // Handler to go back from Results/Chart to Params
  const handleReopenParamDialog = () => {
    if (selectedReport?.config?.params && selectedReport.config.params.length > 0) {
        setIsResultDialogOpen(false); // Close results
        setIsChartDialogOpen(false); // Close chart
        setChartData(null); // Clear chart data
        // Keep executionResult? Maybe not needed if re-executing.
        // Keep queryParams as they were for this report execution
        setIsParamDialogOpen(true); // Reopen params
    } else {
        // Handle case where report has no params - maybe just close?
        handleResultDialogClose();
        handleCloseChartDialog();
    }
  };


  return (
    <Box sx={{ p: 2 }}> {/* Add padding to the main container */}
      {/* Title and Filter Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}> {/* Remove bottom margin from Typography */}
          Список отчетов для выполнения
        </Typography>
        <TextField
          label="Фильтр отчетов"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ width: '300px' }} // Adjust width as needed
        />
      </Box>

      {/* Loading/Error State */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Alert severity="error">{fetchError}</Alert>
      ) : (
        // Report Table
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
                     hover // Add hover effect
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
                         disabled={isExecuting && selectedReport?.id === report.id} // Disable only the button for the currently executing report
                         color="primary"
                       >
                         {/* Show progress only for the specific report being executed */}
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
          {/* Ensure selectedReport and its config/params are loaded before rendering QueryParam */}
          {selectedReport?.config?.params ? (
              <QueryParam
                report={selectedReport}
                onExecute={handleExecuteWithParams}
                onClose={handleParamDialogClose}
                initialParams={queryParams} // Pass previously used params for this report
              />
            ) : (
              // Optional: Show a loading or placeholder if selectedReport is somehow null here
              <CircularProgress />
            )
          }
        </DialogContent>
      </Dialog>

      {/* Chart Dialog */}
      <Dialog
        open={isChartDialogOpen}
        onClose={handleCloseChartDialog}
        fullWidth
        maxWidth="lg" // Use lg for potentially wider charts
      >
        <DialogTitle sx={{ pb: 0 }}>График: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          {chartData && selectedReport ? ( // Ensure chartData and selectedReport are available
             <Box sx={{ height: '60vh', minHeight: '400px', position: 'relative' }}>
                <LineChart
                  reportName={selectedReport.name || ''}
                  xAxisValues={chartData.xAxisValues}
                  datasets={chartData.datasets}
                  onClose={handleCloseChartDialog} // Close only the chart dialog
                  onReopenParamDialog={handleReopenParamDialog} // Go back to params
                />
             </Box>
          ) : (
             <Typography>Нет данных для отображения графика.</Typography> // Fallback
          )}
        </DialogContent>
        {/* Actions like close/reopen params are handled by LineChart's internal buttons */}
      </Dialog>


      {/* Report Result Dialog (using ReportResult component) */}
      {selectedReport && executionResult && isResultDialogOpen && ( // Control via isResultDialogOpen
        <ReportResult
          report={selectedReport}
          executionResult={executionResult}
          open={isResultDialogOpen} // Pass the state to control visibility
          onClose={handleResultDialogClose} // Handler to close this dialog
          chartData={chartData} // Pass chartData (might be null)
          setChartData={setChartData} // Pass setter (might be unused by ReportResult)
          handleOpenChartDialog={handleOpenChartDialog} // Pass handler to switch view to chart
          onReopenParamDialog={handleReopenParamDialog} // Pass handler to switch view to params
        />
      )}

      {/* Global Error Alert (for errors not shown in dialogs) */}
      {error && !isResultDialogOpen && !isChartDialogOpen && ( // Show only if no dialog is open showing an error
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ReportList;
