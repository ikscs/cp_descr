// src/pages/Charts/CircularChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, // Needed for Doughnut/Pie charts
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay'; // Icon for reopening params

// Register the necessary components for Chart.js
ChartJS.register(
  ArcElement, // Register ArcElement for Doughnut/Pie
  Title,
  Tooltip,
  Legend
);

// Define the structure for the dataset specific to Doughnut/Pie charts
interface CircularChartDataset {
  label?: string; // Optional label for the dataset (often not needed for single dataset charts)
  data: number[]; // Array of numerical data points for each segment
  backgroundColor?: string[]; // Array of background colors for each segment
  borderColor?: string[]; // Array of border colors for each segment
  borderWidth?: number;
}

// Define the props for the CircularChart component
interface CircularChartProps {
  reportName: string;
  labels: string[]; // Labels for each segment of the chart
  datasets: CircularChartDataset[]; // Typically only one dataset for Doughnut/Pie
  onClose?: () => void;
  onReopenParamDialog?: () => void;
}

// Define a palette of distinct colors (can be the same as LineChart)
const defaultColors = [
  'rgb(54, 162, 235)',   // Blue
  'rgb(255, 99, 132)',   // Red
  'rgb(75, 192, 192)',   // Green
  'rgb(255, 159, 64)',   // Orange
  'rgb(153, 102, 255)',  // Purple
  'rgb(255, 205, 86)',   // Yellow
  'rgb(201, 203, 207)'   // Grey
  // Add more colors if needed
];

const CircularChart: React.FC<CircularChartProps> = ({
  reportName,
  labels,
  datasets, // Expecting usually one dataset here
  onClose,
  onReopenParamDialog,
}) => {

  // Prepare the data for the Doughnut chart
  const chartData: ChartData<'doughnut'> = {
    labels: labels, // Labels for the segments
    datasets: datasets.map((dataset) => {
      // Assign colors to each segment dynamically
      const backgroundColors = dataset.backgroundColor || labels.map((_, index) => defaultColors[index % defaultColors.length]);
      const borderColors = dataset.borderColor || backgroundColors; // Often same as background or slightly darker

      return {
        label: dataset.label || 'Dataset', // Default label if not provided
        data: dataset.data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: dataset.borderWidth || 1, // Default border width
      };
    }),
  };

  // Configure options for the Doughnut chart
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to adapt to container size
    plugins: {
      legend: {
        position: 'left' as const, // Оставляем легенду слева (или меняем на 'top'/'bottom' по желанию)
      },
      title: {
        display: false, // Отключаем стандартный заголовок Chart.js
        // text: reportName,
        font: { size: 22 },
      },
      tooltip: {
        // Configure tooltips as needed
        callbacks: {
            // label: function(context) {
            //     let label = context.label || '';
            //     if (label) {
            //         label += ': ';
            //     }
            //     if (context.parsed !== null) {
            //         // Optionally format the value (e.g., add percentage)
            //         label += context.parsed;
            //     }
            //     return label;
            // }
            label: function(context) {
                const datasetLabel = context.dataset.label || '';
                const segmentLabel = context.label || '';
                const value = context.parsed;
      
                let finalLabel = '';
                if (datasetLabel) {
                    finalLabel += datasetLabel + ': ';
                }
                if (segmentLabel) {
                    finalLabel += segmentLabel + ': ';
                }
                if (value !== null) {
                    finalLabel += value;
                }
                return finalLabel;
            }        
          }
      },
    },
    // Cutout percentage for Doughnut (0 for Pie)
    cutout: '50%', // Adjust for desired doughnut thickness
  };

  // Basic validation or handling for empty data
  const hasData = datasets.length > 0 && datasets[0].data.length > 0;

  return (
    // Use flex column and allow chart to grow
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', /*minHeight: 250*/ }}>
      {/* Header with Title and buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 1 }}>
        {/* Render the title using Typography with medium font weight */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: 'left',
            mr: 1, /* Добавляем отступ справа */
            fontWeight: 'bold', //fontWeight: 'medium' // Делаем заголовок немного жирнее
            color: 'text.secondary' // Делаем цвет менее интенсивным (сероватым)
          }}>
          {reportName}
        </Typography>
        {/* Optional: Add Reopen button */}
        {onReopenParamDialog && (
          <IconButton onClick={onReopenParamDialog} title="Изменить параметры" size="small">
            <ReplayIcon />
          </IconButton>
        )}
        {/* Optional: Add Close button */}
        {onClose && (
          <IconButton onClick={onClose} title="Закрыть график" size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      {/* Old Header location (now removed or repurposed) */}
      {/*
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 1 }}>
        {onReopenParamDialog ? (
          <IconButton onClick={onReopenParamDialog} title="Изменить параметры">
            <ReplayIcon />
          </IconButton>
        ) : (
          <Box /> // Пустой Box для сохранения выравнивания
        )}        
        {onClose ? (
          <IconButton onClick={onClose} title="Закрыть график">
            <CloseIcon />
          </IconButton>
        ) : (
          <Box /> // Пустой Box для сохранения выравнивания
        )}
      </Box>
      */}
      {/* Chart container */}
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        {hasData ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <Typography align="center" sx={{ mt: 4 }}>Нет данных для отображения графика.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default CircularChart;
