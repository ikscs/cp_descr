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
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExcelIcon from '@mui/icons-material/FileDownload'; // Import Excel icon
// import { handleExportToExcel } from '../../utils/exportToExcel'; // Import exportToExcel function
import { getReports, Report } from '../../api/data/reportTools';
import { backend, fetchData, IFetchResponse } from '../../api/data/fetchData';
import { IGridColumn, toExcel } from '../../api/tools/toExcel';
import { config } from 'process';


const reportColumns: IGridColumn[] = 
  [
    { key: "subject_id", name: "ID", width: 40 },
    { key: "subject_role", name: "Role", width: 10 },
    { key: "name", name: "Name", width: 20 },
  ]
/*
{ columns:   [
    { key: "subject_id", name: "ID", width: 40 },
    { key: "subject_role", name: "Role", width: 10 },
    { key: "name", name: "Name", width: 20 },
  ] } 
*/

interface ReportExecutionResult {
  columns: string[];
  rows: any[][];
}

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsExecuting(true);
    setSelectedReport(report);
    setExecutionResult(null);
    setError(null);

    try {
      const result = await executeReportQuery(report.query);
      setExecutionResult(result);
    } catch (err) {
      console.error('Error executing report:', err);
      setError('Ошибка при выполнении отчета');
      setExecutionResult({ columns: ['Error'], rows: [[`Error executing report: ${err}`]] });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeReportQuery = async (query: string): Promise<ReportExecutionResult> => {
    try {
      const params = {
        backend_point: backend.backend_point_query,
        query: query,
      };
      const response: any/*IFetchResponse*/ = await fetchData(params);
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
      // toExcel(reportColumns, data, /*selectedReport.name*/);
      let columns: IGridColumn[] = [];
      try {
        columns = JSON.parse(selectedReport.config||'{}').columns;
      } catch {
        columns = makeColumns(data);
      }
      toExcel(columns, data);
    }
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
        <Button variant="contained" startIcon={<ExcelIcon />} onClick={() => handleExportToExcel()}>
          Экспорт в Excel
        </Button>
          {executionResult.columns.length === 1 && executionResult.columns[0] === 'Error' ? (
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
    </Box>
  );
};

export default ReportList;

function makeColumns(data: { [key: string]: any; }[]): IGridColumn[] {
  if (data.length === 0) return [];
  const columns = Object.keys(data[0]);
  const result: IGridColumn[] = [];
  columns.forEach((col) => {
    result.push({ key: col, name: col, width: 20 });
  });
  return result;
  //{ key: "subject_id", name: "ID", width: 40 },
}

