// ReportResult.tsx
import React, { useState } from 'react';
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
import type { ChartData, ParsedReport } from './ReportList';
import PivotTableDialog, { AggregationType } from './PivotTableDialog'; // <-- Import the new component and AggregationType
import { fillPlaceholders } from './reportTools';
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
  queryParams: { name: string; value: string | number | boolean }[], // Parameters used in the report
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
  queryParams,
  executionResult,
  open,
  onClose,
  // chartData,
  // setChartData,
  handleOpenChartDialog,
  onReopenParamDialog,

}) => {
  const [isPivotDialogOpen, setIsPivotDialogOpen] = useState(false);

  const isErrorResult =
    executionResult &&
    executionResult.columns.length === 1 &&
    executionResult.columns[0] === 'Error';

  const onPivot = () => {
    // Open the pivot dialog
    setIsPivotDialogOpen(true);
  };
  
  const getPivotDefaults = () => {
    const { columns } = executionResult;
    const chartConfig = report.config?.chart;

    let dX: string | undefined = undefined;
    let dY: string | undefined = undefined;
    let dV: string | undefined = undefined;
    let dAgg: AggregationType = AggregationType.NONE;

    const isValid = (field: string | undefined): field is string => !!field && columns.includes(field);

    // 1. Try to get defaults from chart configuration
    if (chartConfig) {
      if (isValid(chartConfig.x_axis?.field)) {
        dX = chartConfig.x_axis.field;
      }
      // For value, take first body_field that is valid and not dX
      if (chartConfig.body_fields && chartConfig.body_fields.length > 0) {
        for (const bf of chartConfig.body_fields) {
          if (isValid(bf) && bf !== dX) {
            dV = bf;
            break;
          }
        }
      }
      // For Y-axis, take y_axis.field if valid and not dX or dV
      if (isValid(chartConfig.y_axis?.field)) {
        const yChart = chartConfig.y_axis.field;
        if (yChart !== dX && yChart !== dV) {
          dY = yChart;
        }
      }
    }

    // 2. Fill remaining from available columns if not found in chartConfig
    //    or if chartConfig values were invalid/conflicting.
    const availableForX = columns.filter(c => c !== dY && c !== dV);
    if (!dX && availableForX.length > 0) {
      dX = availableForX[0];
    }

    const availableForY = columns.filter(c => c !== dX && c !== dV);
    if (!dY && availableForY.length > 0) {
      dY = availableForY[0];
    }
    
    const availableForValue = columns.filter(c => c !== dX && c !== dY);
    if (!dV && availableForValue.length > 0) {
      dV = availableForValue[0];
    }

    // Set a default aggregation if all three fields are successfully determined
    if (dX && dY && dV) {
        dAgg = AggregationType.SUM; 
    }
    
    return {
      defaultXAxisField: dX,
      defaultYAxisField: dY,
      defaultValueField: dV,
      defaultAggregation: dAgg,
    };
  };

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
        Результат выполнения отчета: { fillPlaceholders(report.name, queryParams) /*report.name}*/}
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
              <Button
                variant="contained"
                onClick={onPivot}
              >
                Сводная таблица
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
      {executionResult && !isErrorResult && (
        <PivotTableDialog
          open={isPivotDialogOpen}
          onClose={() => setIsPivotDialogOpen(false)}
          rows={executionResult.rows}
          columns={executionResult.columns}
          reportName={report.name}
          {...getPivotDefaults()} 
        />
      )}
    </Dialog>
  );
};

export default ReportResult;
