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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MyChartProps {
  chartData: ChartData<'line'>;
  chartOptions: ChartOptions<'line'>;
}

const MyLineChart2: React.FC<MyChartProps> = ({ chartData, chartOptions }) => {
  return <Line data={chartData} options={chartOptions} />;
};

const App: React.FC = () => {
  const data: ChartData<'line'> = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'График 1',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'График 2',
        data: [7, 11, 5, 8, 3, 6],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
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
        text: 'Два графика на одной оси',
      },
    },
    scales: {
      x: {
        type: 'category',
      },
      y: {
        type: 'linear',
        beginAtZero: true,
      },
    },
  };

  return <MyLineChart2 chartData={data} chartOptions={options} />;
};

export default App;