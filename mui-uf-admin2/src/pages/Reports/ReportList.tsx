// ReportList.tsx
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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getReports, Report } from '../../api/data/reportTools';
import { backend, fetchData } from '../../api/data/fetchData';
import QueryParam from './QueryParam';
import packageJson from '../../../package.json';
import LineChart from '../Charts/LineChart';
import ReportResult from './ReportResult';

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
  return {
    ...report,
    config: report.config ? JSON.parse(report.config) : null,
  };
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

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const fetchedReports = await getReports();
        setReports(fetchedReports);
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

  const handleExecuteReport = async (report: Report) => {
    setSelectedReport(ReportToParsedReport(report));
    setExecutionResult(null);
    setError(null);
    const config = report.config ? JSON.parse(report.config) : null;
    if (config && config.params && config.params.length > 0) {
      setIsParamDialogOpen(true);
    } else {
      await executeReport(ReportToParsedReport(report), []);
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
    await executeReport(selectedReport!, params);
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
      setIsResultDialogOpen(true);
    } catch (err) {
      console.error('Error executing report:', err);
      setError('Ошибка при выполнении отчета');
      setExecutionResult({
        columns: ['Error'],
        rows: [[`Error executing report: ${err}`]],
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
      if (response.length === 0) {
        return { columns: ['Сообщение'], rows: [['Нет данных']] };
      }

      if (!response.ok)
        throw new Error(
          `Error executing report: ${response.status} - ${response.statusText}`
        );

      const data = response.data;
      const columns = Object.keys(data[0]);
      const rows = data.map((row: any) => columns.map((col) => row[col]));
      return { columns, rows };
    } catch (err) {
      throw err;
    }
  };

  const handleOpenChartDialog = () => {
    if (executionResult && selectedReport) {
      const config = selectedReport.config;
      const chartConfig = config?.chart;

      if (
        chartConfig &&
        chartConfig.x_axis &&
        chartConfig.y_axis &&
        chartConfig.body_fields
      ) {
        const xAxisField = chartConfig.x_axis.field;
        const yAxisFields = chartConfig.body_fields;

        const xAxisIndex = executionResult.columns.indexOf(xAxisField);
        const yAxisIndices = yAxisFields.map((field) =>
          executionResult.columns.indexOf(field)
        );

        if (xAxisIndex !== -1 && yAxisIndices.every((index) => index !== -1)) {
          const xAxisValues = executionResult.rows.map(
            (row) => row[xAxisIndex]?.toString() || ''
          );
          const datasets = yAxisIndices.map((yAxisIndex, index) => ({
            label: yAxisFields[index],
            data: executionResult.rows.map((row) => {
              const value = row[yAxisIndex];
              return value === null || value === undefined ? value : Number(value);
            }),
          }));

          setChartData({ xAxisValues, datasets });
          setIsChartDialogOpen(true);
        } else {
          console.error(`Fields not found in columns`);
          setError(`Fields not found in columns`);
        }
      } else {
        console.error('Chart configuration or axis fields are missing');
        setError('Chart configuration or axis fields are missing');
      }
    }
  };

  const handleCloseChartDialog = () => {
    setIsChartDialogOpen(false);
  };

  const handleResultDialogClose = () => {
    setIsResultDialogOpen(false);
  };

  const handleReopenParamDialog = () => {
    setIsResultDialogOpen(false);
    setIsParamDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Список отчетов для выполнения
      </Typography>

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
              {reports.map((report) => (
                <TableRow
                  key={report.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {report.id}
                  </TableCell>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleExecuteReport(report)}
                      disabled={isExecuting}
                    >
                      {isExecuting && selectedReport?.id === report.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <PlayArrowIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
          Параметры для отчета: {selectedReport?.name}
        </DialogTitle>
        <DialogContent>
          {selectedReport &&
            selectedReport.config &&
            selectedReport.config.params && (
              <QueryParam
                report={selectedReport}
                onExecute={handleExecuteWithParams}
                onClose={handleParamDialogClose}
                initialParams={queryParams}
              />
            )}
        </DialogContent>
      </Dialog>

      {/* Chart Dialog */}
      <Dialog
        open={isChartDialogOpen}
        onClose={handleCloseChartDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>График: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          {chartData && (
            <LineChart
              reportName={selectedReport?.name || ''}
              xAxisValues={chartData.xAxisValues}
              datasets={chartData.datasets}
              onClose={handleCloseChartDialog}
              onReopenParamDialog={handleReopenParamDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Report Result Dialog */}
      {selectedReport && executionResult && (
        <ReportResult
          report={selectedReport}
          executionResult={executionResult}
          open={isResultDialogOpen}
          onClose={handleResultDialogClose}
          chartData={chartData}
          setChartData={setChartData}
          handleOpenChartDialog={handleOpenChartDialog}
          onReopenParamDialog={handleReopenParamDialog}
        />
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ReportList;
