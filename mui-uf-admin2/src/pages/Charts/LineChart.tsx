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
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}

interface LineChartProps {
  reportName: string;
  xAxisValues: string[];
  datasets: LineChartDataset[];
  onClose: () => void;
}

const LineChart: React.FC<LineChartProps> = ({
  reportName,
  xAxisValues,
  datasets,
  onClose,
}) => {
  const chartData: ChartData<'line'> = {
    labels: xAxisValues,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      fill: false,
      backgroundColor: dataset.backgroundColor || `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
      borderColor: dataset.borderColor || `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: reportName,
      },
    },
    scales: {
      x: {
        type: 'category',
      },
      y: {
        type: 'linear',
        beginAtZero: false,
      },
    },
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default LineChart;
