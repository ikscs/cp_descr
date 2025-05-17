import React from 'react';
import { Box, Typography } from '@mui/material';
import LineChart from '../Charts/LineChart';
import type { ChartData } from './ReportList';
import type { AggregationType } from './pivotUtils'; // Import types
import { aggregationTypeLabels } from './pivotUtils'; // Import labels

interface PivotChartContentProps {
  chartData: ChartData;
  reportName: string;
  xAxisField: string;
  yAxisField: string;
  valueField: string;
  aggregation: AggregationType;
  // Optional handlers for buttons if needed within the chart area
  onClose?: () => void;
  onReopenParamDialog?: () => void;
}

const PivotChartContent: React.FC<PivotChartContentProps> = ({
  chartData,
  reportName,
  xAxisField,
  yAxisField,
  valueField,
  aggregation,
  onClose,
  onReopenParamDialog,
}) => {
  // Construct a descriptive title/subtitle
  const chartTitle = `График для сводной таблицы: ${reportName}`;
  const chartSubtitle = `${aggregationTypeLabels[aggregation]} of ${valueField} by ${xAxisField} and ${yAxisField}`;

  return (
    <Box sx={{ height: '100%', minHeight: '400px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Optional: Add title/subtitle above the chart */}
      {/* <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="h6">{chartTitle}</Typography>
        <Typography variant="caption" display="block">{chartSubtitle}</Typography>
      </Box> */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}> {/* Container for the chart */}
        <LineChart
          reportName={chartTitle} // Use the constructed title for the chart component
          xAxisValues={chartData.xAxisValues}
          datasets={chartData.datasets}
          yAxisLabel={chartData.yAxisLabel}
          // Pass handlers down if LineChart supports them or if we add buttons here
          onClose={onClose}
          onReopenParamDialog={onReopenParamDialog}
        />
      </Box>
      {/* Optional: Add buttons here if not handled by parent dialog */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        {onReopenParamDialog && <Button onClick={onReopenParamDialog}>Изменить параметры</Button>}
        {onClose && <Button onClick={onClose}>Закрыть</Button>}
      </Box> */}
    </Box>
  );
};

export default PivotChartContent;