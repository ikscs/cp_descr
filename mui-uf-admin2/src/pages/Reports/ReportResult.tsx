// ReportResult.tsx
import React from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import ExcelIcon from '@mui/icons-material/FileDownload';
import ChartIcon from '@mui/icons-material/BarChart';
import { toExcel } from '../../api/tools/toExcel';
import { ChartData, ParsedReport } from './ReportList';
// import LineChart from '../Charts/LineChart';

interface ReportExecutionResult {
  columns: string[];
  rows: any[][];
}

// interface ParsedReport {
//   id: number;
//   name: string;
//   description: string;
//   query: string;
//   config: {
//     params?: {
//       name: string;
//       description: string;
//       type: string;
//       notNull: boolean;
//       defaultValue: string | number | boolean;
//       selectOptions?: string[];
//     }[];
//     columns?: {
//       field: string;
//       width: number;
//     }[];
//     chart?: {
//       type: string;
//       x_axis: { field: string };
//       y_axis: { field: string };
//       body_fields: string[];
//     };
//   };
// }

// interface ChartData {
//   xAxisValues: string[];
//   datasets: { label: string; data: (number | null | undefined)[] }[];
// }

interface ReportResultProps {
  report: ParsedReport;
  executionResult: ReportExecutionResult;
  open: boolean;
  onClose: () => void;
  chartData: ChartData | null;
  setChartData: React.Dispatch<React.SetStateAction<ChartData | null>>;
  handleOpenChartDialog: () => void;
  onReopenParamDialog: () => void;
}

const ReportResult: React.FC<ReportResultProps> = ({
  report,
  executionResult,
  open,
  onClose,
  // chartData,
  // setChartData,
  handleOpenChartDialog,
  onReopenParamDialog,
}) => {
  const isErrorResult =
    executionResult &&
    executionResult.columns.length === 1 &&
    executionResult.columns[0] === 'Error';

  const handleExportToExcel = () => {
    if (report && executionResult) {
      const data = executionResult.rows.map((row) => {
        const rowData: { [key: string]: any } = {};
        executionResult.columns.forEach((column, index) => {
          rowData[column] = row[index];
        });
        return rowData;
      });
      // let columns = executionResult.columns.map((col, index) => ({
      //   key: col,
      //   name:
      //     executionResult.rows.length > 0
      //       ? executionResult.rows[0][index]
      //       : col,
      //   width: 20,
      // }));
      const columns = executionResult.columns.map((col) => ({
        key: col,
        name: col,
        width: 20,
      }));
      toExcel(columns, data, report.name);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        Результат выполнения отчета: {report.name}
      </DialogTitle>
      <DialogContent>
        <Box mt={2} display="flex" gap={2}>
          {!isErrorResult && (
            <>
              <Button
                variant="contained"
                startIcon={<ExcelIcon />}
                onClick={() => handleExportToExcel()}
              >
                Експорт в Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<ChartIcon />}
                onClick={handleOpenChartDialog}
              >
                График
              </Button>
              <Button
                variant="contained"
                onClick={onReopenParamDialog}
              >
                Изменить параметры
              </Button>
            </>
          )}
        </Box>
        {isErrorResult ? (
          <Typography color="error">{executionResult.rows[0][0]}</Typography>
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
      </DialogContent>
    </Dialog>
  );
};

export default ReportResult;
