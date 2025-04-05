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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExcelIcon from '@mui/icons-material/FileDownload';
import ChartIcon from '@mui/icons-material/BarChart';
import { getReports, Report } from '../../api/data/reportTools';
import { backend, fetchData } from '../../api/data/fetchData';
import { toExcel } from '../../api/tools/toExcel';
import QueryParam from './QueryParam';
import packageJson from '../../../package.json';
// import TestLineChart from '../Charts/TestLineChart';
import LineChart from '../Charts/LineChart';

interface ReportExecutionResult {
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
      type: string;
      x_axis: { field: string };
      y_axis: { field: string };
      body_fields: string[];
    };
  }
};

const ReportToParsedReport = (report: Report): ParsedReport => {
  return {
    ...report,
    config: report.config ? JSON.parse(report.config) : null,
  };
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
  const [chartData, setChartData] = useState<{
    xAxisValues: string[];
    yAxisValues: number[];
    yAxisLabel: string;
  } | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const fetchedReports = await getReports();
        setReports(fetchedReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Ошибка при загрузке отчетов');
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
    console.log(report);
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

  const handleExecuteWithParams = async (params: { name: string; value: string | number | boolean }[]) => {
    setIsParamDialogOpen(false);
    await executeReport(selectedReport!, params);
  };

  const executeReport = async (report: ParsedReport, params: { name: string; value: string | number | boolean }[]) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setError(null);

    try {
      const result = await executeReportQuery(report.id, params);
      setExecutionResult(result);
    } catch (err) {
      console.error('Error executing report:', err);
      setError('Ошибка при выполнении отчета');
      setExecutionResult({ columns: ['Error'], rows: [[`Error executing report: ${err}`]] });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeReportQuery = async (id: number, params: { name: string; value: string | number | boolean }[]): Promise<ReportExecutionResult> => {
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
        throw new Error(`Error executing report: ${response.status} - ${response.statusText}`);

      const data = response.data;
      const columns = Object.keys(data[0]);
      const rows = data.map((row: any) => columns.map((col) => row[col]));
      return { columns, rows };
    } catch (err) {
      throw err;
    }
  };

  const handleExportToExcel = () => {
    if (selectedReport && executionResult) {
      const data = executionResult.rows.map((row) => {
        const rowData: { [key: string]: any } = {};
        executionResult.columns.forEach((column, index) => {
          rowData[column] = row[index];
        });
        return rowData;
      });
      let columns = executionResult.columns.map((col, index) => ({
        key: col,
        name: executionResult.rows.length > 0 ? executionResult.rows[0][index] : col,
        width: 20,
      }));
      toExcel(columns, data, selectedReport.name);
    }
  };

  const handleOpenChartDialog = () => {
    if (executionResult && selectedReport) {
      // const config = selectedReport.config ? JSON.parse(selectedReport.config) : null;
      const config = selectedReport.config;
      const chartConfig = config?.chart;
  
      if (chartConfig && chartConfig.x_axis && chartConfig.y_axis) {
        const xAxisField = chartConfig.x_axis.field;
        const yAxisField = chartConfig.y_axis.field;
  
        // Find the indices of the x and y axis fields in the columns
        const xAxisIndex = executionResult.columns.indexOf(xAxisField);
        const yAxisIndex = executionResult.columns.indexOf(yAxisField);
  
        if (xAxisIndex !== -1 && yAxisIndex !== -1) {
          const xAxisValues = executionResult.rows.map((row) => row[xAxisIndex]?.toString() || '');
          const yAxisValues = executionResult.rows.map((row) => Number(row[yAxisIndex]));
          const yAxisLabel = yAxisField;
  
          setChartData({ xAxisValues, yAxisValues, yAxisLabel });
          setIsChartDialogOpen(true);
        } else {
          console.error(`Fields ${xAxisField} or ${yAxisField} not found in columns`);
          setError(`Fields ${xAxisField} or ${yAxisField} not found in columns`);
        }
      } else {
        console.error('Chart configuration or axis fields are missing');
        setError('Chart configuration or axis fields are missing');
      }
    }
  };
  
  const _handleOpenChartDialog = () => {
    if (executionResult) {
      // Assuming the first column is the x-axis and the second is the y-axis
      const xAxisValues = executionResult.rows.map((row) => row[0].toString());
      const yAxisValues = executionResult.rows.map((row) =>
        Number(row[1])
      );
      const yAxisLabel = executionResult.columns[1];
      setChartData({ xAxisValues, yAxisValues, yAxisLabel });
      setIsChartDialogOpen(true);
    }
  };

  const handleCloseChartDialog = () => {
    setIsChartDialogOpen(false);
  };

  const isErrorResult = executionResult && executionResult.columns.length === 1 && executionResult.columns[0] === 'Error';

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Список отчетов для выполнения
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
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

      {/* Display execution result */}
      {selectedReport && executionResult && (
        <Box mt={3}>
          <Typography variant="h6">
            Результат выполнения отчета: {selectedReport.name}
          </Typography>
          <Box mt={2} display="flex" gap={2}> {/* Container for buttons */}
            {/* Conditionally render the export button */}
            {!isErrorResult && (
              <>
                <Button variant="contained" startIcon={<ExcelIcon />} onClick={() => handleExportToExcel()}>
                  Экспорт в Excel
                </Button>
                <Button variant="contained" startIcon={<ChartIcon />} onClick={handleOpenChartDialog}>
                  График
                </Button>
              </>
            )}
          </Box>
          {isErrorResult ? (
            <Typography color="error">
              {executionResult.rows[0][0]}
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {executionResult.columns.map((column, index) => (
                      <TableCell key={index}>{column}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {executionResult.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Parameter Input Dialog */}
      <Dialog open={isParamDialogOpen} onClose={handleParamDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Параметры для отчета: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          {selectedReport && selectedReport.config && selectedReport.config.params && (
            <QueryParam report={selectedReport} onExecute={handleExecuteWithParams} onClose={handleParamDialogClose} />
          )}
        </DialogContent>
      </Dialog>

      {/* Chart Dialog */}
      <Dialog open={isChartDialogOpen} onClose={handleCloseChartDialog} fullWidth maxWidth="md">
        <DialogTitle>График: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          {chartData && (
            <LineChart
              reportName={selectedReport?.name || ''}
              xAxisValues={chartData.xAxisValues}
              yAxisValues={chartData.yAxisValues}
              yAxisLabel={chartData.yAxisLabel}
              onClose={handleCloseChartDialog}
            />
          )}
        </DialogContent>
      </Dialog>      
      {/* <Dialog open={isChartDialogOpen} onClose={handleCloseChartDialog} fullWidth maxWidth="md">
        <DialogTitle>График: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          <TestLineChart/>
          <Typography>Chart will be displayed here</Typography>
        </DialogContent>
      </Dialog> */}
    </Box>
  );
};

export default ReportList;

// function makeColumns(data: { [key: string]: any; }[]): IGridColumn[] {
//   if (data.length === 0) 
//     return [];
//   const columns = Object.keys(data[0]);
//   const result: IGridColumn[] = [];
//   columns.forEach((col) => {
//     result.push({ key: col, name: col, width: 20 });
//   });
//   return result;
// }