// PivotTableDialog.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

// Define AggregationType and its labels (can be moved to a separate types file)
export enum AggregationType {
  SUM = 'SUM',
  COUNT = 'COUNT',
  AVERAGE = 'AVERAGE',
  MIN = 'MIN',
  MAX = 'MAX',
  NONE = 'NONE', // Represents no aggregation or showing raw data initially
}

interface PivotTableDialogProps {
  open: boolean;
  onClose: () => void;
  rows: any[][];
  columns: string[];
  reportName: string;
  defaultXAxisField?: string;
  defaultYAxisField?: string;
  defaultValueField?: string;
  defaultAggregation?: AggregationType;
}

interface PivotedData {
  rows: any[]; // Can be array of objects after pivoting
  columns: string[];
}

const aggregationTypeLabels: Record<AggregationType, string> = {
  [AggregationType.NONE]: 'None (Raw Data)',
  [AggregationType.SUM]: 'Sum',
  [AggregationType.COUNT]: 'Count',
  [AggregationType.AVERAGE]: 'Average',
  [AggregationType.MIN]: 'Min',
  [AggregationType.MAX]: 'Max',
};

const PivotTableDialog: React.FC<PivotTableDialogProps> = ({
  open,
  onClose,
  rows,
  columns: originalColumns, // Renamed for clarity
  reportName,
  defaultXAxisField: initialDefaultX = '',
  defaultYAxisField: initialDefaultY = '',
  defaultValueField: initialDefaultValue = '',
  defaultAggregation: initialDefaultAgg = AggregationType.NONE,
}) => {
  const [xAxisField, setXAxisField] = useState<string>('');
  const [yAxisField, setYAxisField] = useState<string>('');
  const [valueField, setValueField] = useState<string>('');
  const [aggregation, setAggregation] = useState<AggregationType>(AggregationType.NONE);

  // Initialize state with defaults, and reset when dialog opens or data/defaults change
  useEffect(() => {
    if (open) {
      const isValid = (field: string | undefined): field is string =>
        !!field && originalColumns.includes(field);

      let newX = isValid(initialDefaultX) ? initialDefaultX : '';
      
      let newY = isValid(initialDefaultY) && initialDefaultY !== newX 
        ? initialDefaultY 
        : '';
      
      let newValue = isValid(initialDefaultValue) && 
                     initialDefaultValue !== newX && 
                     initialDefaultValue !== newY
        ? initialDefaultValue
        : '';

      // If a higher-priority default was invalid, clear subsequent ones to avoid partial/conflicting setup
      if (initialDefaultX && !newX) { // defaultX was provided but invalid
        newY = ''; 
        newValue = '';
      } else if (initialDefaultY && !newY && newX) { // defaultY was provided but invalid/conflicted
        newValue = '';
      }

      setXAxisField(newX);
      setYAxisField(newY);
      setValueField(newValue);

      if (newX && newY && newValue) {
        setAggregation(initialDefaultAgg !== AggregationType.NONE ? initialDefaultAgg : AggregationType.SUM);
      } else {
        setAggregation(AggregationType.NONE);
      }
    }
  }, [open, originalColumns, initialDefaultX, initialDefaultY, initialDefaultValue, initialDefaultAgg]);

  const generatePivotData = (): PivotedData => {
    if (
      !xAxisField ||
      !yAxisField ||
      !valueField ||
      aggregation === AggregationType.NONE ||
      xAxisField === yAxisField // Basic validation: X and Y axes should be different
    ) {
      return { rows, columns: originalColumns }; // Return raw data
    }

    const xAxisIndex = originalColumns.indexOf(xAxisField);
    const yAxisIndex = originalColumns.indexOf(yAxisField);
    const valueIndex = originalColumns.indexOf(valueField);

    if (xAxisIndex === -1 || yAxisIndex === -1 || valueIndex === -1) {
      console.error('Invalid field selected for pivot.');
      return { rows, columns: originalColumns }; // Return raw data on error
    }

    const pivotMap = new Map<any, Map<any, any | { sum: number; count: number }>>();
    const uniqueYValues = new Set<any>();

    rows.forEach(row => {
      const xValue = row[xAxisIndex];
      const yValue = row[yAxisIndex];
      const cellValue = row[valueIndex];

      uniqueYValues.add(yValue);

      if (!pivotMap.has(xValue)) {
        pivotMap.set(xValue, new Map());
      }
      const yMap = pivotMap.get(xValue)!;
      const numValue = parseFloat(String(cellValue)); // Attempt to convert value to number

      switch (aggregation) {
        case AggregationType.COUNT:
          yMap.set(yValue, (yMap.get(yValue) || 0) + 1);
          break;
        case AggregationType.SUM:
          if (!isNaN(numValue)) {
            yMap.set(yValue, (yMap.get(yValue) || 0) + numValue);
          }
          break;
        case AggregationType.MIN:
          if (!isNaN(numValue)) {
            yMap.set(yValue, Math.min(yMap.get(yValue) ?? Infinity, numValue));
          }
          break;
        case AggregationType.MAX:
          if (!isNaN(numValue)) {
            yMap.set(yValue, Math.max(yMap.get(yValue) ?? -Infinity, numValue));
          }
          break;
        case AggregationType.AVERAGE:
          if (!isNaN(numValue)) {
            const current = yMap.get(yValue) || { sum: 0, count: 0 };
            yMap.set(yValue, { sum: current.sum + numValue, count: current.count + 1 });
          }
          break;
        default:
          break;
      }
    });

    const sortedUniqueYValues = Array.from(uniqueYValues).sort((a, b) => String(a).localeCompare(String(b)));
    const pivotColumnsOutput = [xAxisField, ...sortedUniqueYValues.map(String)];
    const pivotRowsOutput: any[] = [];

    const sortedXValues = Array.from(pivotMap.keys()).sort((a, b) => String(a).localeCompare(String(b)));

    sortedXValues.forEach(xValue => {
      const rowObject: any = { [xAxisField]: xValue };
      const yMap = pivotMap.get(xValue)!;

      sortedUniqueYValues.forEach(yColValue => {
        const aggregated = yMap.get(yColValue);
        if (aggregation === AggregationType.AVERAGE) {
          rowObject[String(yColValue)] = aggregated && aggregated.count > 0 ? (aggregated.sum / aggregated.count).toFixed(2) : null;
        } else {
          rowObject[String(yColValue)] = aggregated !== undefined ? aggregated : null;
        }
      });
      pivotRowsOutput.push(rowObject);
    });

    return { rows: pivotRowsOutput, columns: pivotColumnsOutput };
  };

  const pivotedData = useMemo(generatePivotData, [
    rows,
    originalColumns,
    xAxisField,
    yAxisField,
    valueField,
    aggregation,
  ]);

  const availableColumns = originalColumns || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Pivot Table Data for: {reportName}</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>Pivot Controls</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="xaxis-label">X-Axis (Rows)</InputLabel>
                <Select
                  labelId="xaxis-label"
                  value={xAxisField}
                  label="X-Axis (Rows)"
                  onChange={(e) => setXAxisField(e.target.value as string)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {availableColumns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="yaxis-label">Y-Axis (Columns)</InputLabel>
                <Select
                  labelId="yaxis-label"
                  value={yAxisField}
                  label="Y-Axis (Columns)"
                  onChange={(e) => setYAxisField(e.target.value as string)}
                  disabled={!xAxisField}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {availableColumns.filter(col => col !== xAxisField).map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="valuefield-label">Value Field</InputLabel>
                <Select
                  labelId="valuefield-label"
                  value={valueField}
                  label="Value Field"
                  onChange={(e) => setValueField(e.target.value as string)}
                  disabled={!xAxisField || !yAxisField}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {availableColumns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="aggregation-label">Aggregation</InputLabel>
                <Select
                  labelId="aggregation-label"
                  value={aggregation}
                  label="Aggregation"
                  onChange={(e) => setAggregation(e.target.value as AggregationType)}
                  disabled={!xAxisField || !yAxisField || !valueField}
                >
                  {Object.entries(aggregationTypeLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {pivotedData.rows.length > 0 && pivotedData.columns.length > 0 ? (
          <TableContainer component={Paper} sx={{ marginTop: 2, maxHeight: '60vh' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {pivotedData.columns.map((column, index) => (
                    <TableCell key={index}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {aggregation === AggregationType.NONE || !xAxisField || !yAxisField || !valueField
                  ? rows.map((rowArray, rowIndex) => ( // Render raw data if pivot not fully configured
                      <TableRow key={`raw-${rowIndex}`}>
                        {rowArray.map((cell, cellIndex) => (
                          <TableCell key={`raw-${rowIndex}-${cellIndex}`}>{String(cell)}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  : pivotedData.rows.map((rowObject, rowIndex) => ( // Render pivoted data
                      <TableRow key={`${rowObject[xAxisField]}-${rowIndex}`}>
                        {pivotedData.columns.map((colName) => (
                          <TableCell key={`${rowObject[xAxisField]}-${colName}`}>
                            {rowObject[colName] !== null && rowObject[colName] !== undefined ? String(rowObject[colName]) : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ marginTop: 2 }}>
            {aggregation !== AggregationType.NONE && xAxisField && yAxisField && valueField
              ? "No data to display for the selected pivot configuration."
              : "No data available or select pivot parameters to transform data."}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {/* Optional: Add a button to reset pivot controls explicitly */}
        {/* <Button onClick={() => {
          setXAxisField('');
          setYAxisField('');
          setValueField('');
          setAggregation(AggregationType.NONE);
        }}>Reset Pivot</Button> */}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PivotTableDialog;
