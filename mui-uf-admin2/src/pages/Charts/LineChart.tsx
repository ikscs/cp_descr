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

interface LineChartProps {
  reportName: string;
  xAxisValues: string[];
  yAxisValues: number[];
  yAxisLabel: string;
  onClose: () => void; // Add a callback for closing the chart
}

const LineChart: React.FC<LineChartProps> = ({
  reportName,
  xAxisValues,
  yAxisValues,
  yAxisLabel,
  onClose, // Receive the onClose callback
}) => {
  const data: ChartData<'line'> = {
    labels: xAxisValues,
    datasets: [
      {
        label: yAxisLabel,
        data: yAxisValues,
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
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
      <Line data={data} options={options} />
    </Box>
  );
};

export default LineChart;
