import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay'; // Import an icon for reopening params

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartDataset {
  label: string;
  data: (number | null )[];
  backgroundColor?: string;
  borderColor?: string;
}

interface LineChartProps {
  reportName: string;
  xAxisValues: string[];
  datasets: LineChartDataset[];
  onClose: () => void;
  onReopenParamDialog: () => void;
}

// Define a palette of distinct colors
const defaultColors = [
  'rgb(54, 162, 235)',   // Blue
  'rgb(255, 99, 132)',   // Red
  'rgb(75, 192, 192)',   // Green
  'rgb(255, 159, 64)',   // Orange
  'rgb(153, 102, 255)',  // Purple
  'rgb(255, 205, 86)',   // Yellow
  'rgb(201, 203, 207)'   // Grey
];

const LineChart: React.FC<LineChartProps> = ({
  reportName,
  xAxisValues,
  datasets,
  onClose,
  onReopenParamDialog,
}) => {
  const chartData: ChartData<'line'> = {
    labels: xAxisValues,
    datasets: datasets.map((dataset, index) => {
      // Use a predefined color or fallback to random if more datasets than colors
      const color = dataset.borderColor || defaultColors[index % defaultColors.length] || `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      return {
        label: dataset.label,
        data: dataset.data,
        fill: false,
        // Use the same color for background (optional, as fill is false)
        backgroundColor: dataset.backgroundColor || color,
        // Use the determined color, ensuring it's fully opaque
        borderColor: color,
        // Optionally increase line thickness
        borderWidth: 2, // Default is often 1 or 3, explicitly setting to 2 can help
        // Optionally add point styling for better visibility
        pointBackgroundColor: color,
        pointRadius: 3, // Show points on the line
        pointHoverRadius: 5, // Enlarge points on hover
      };
    }),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height better
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: reportName,
        font: { size: 22 }, // Increase font size for better readability
      },
      tooltip: {
        mode: 'index', // Show tooltips for all datasets at the same x-index
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        title: {
          display: true,
          // You might want to add an x-axis title if applicable
          // text: 'X Axis Label'
        }
      },
      y: {
        type: 'linear',
        display: true,
        beginAtZero: false, // Keep this false if data doesn't start near zero
        title: {
          display: true,
          // You might want to add a y-axis title if applicable
          // text: 'Y Axis Label'
          text: 'Y Axis Label'
        }
      },
    },
    interaction: { // Improve hover interaction
        mode: 'index',
        intersect: false,
    },
  };

  return (
    // Use flex column and allow chart to grow
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 1 }}>
        {/* Use a more appropriate icon for reopening parameters */}
        <IconButton onClick={onReopenParamDialog} title="Изменить параметры">
          <ReplayIcon />
        </IconButton>
        <IconButton onClick={onClose} title="Закрыть график">
          <CloseIcon />
        </IconButton>
      </Box>
      {/* Ensure the chart container can grow */}
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default LineChart;
