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

interface IMyChartProps {
  chartData: ChartData<'line'>;
  chartOptions: ChartOptions<'line'>;
}

const MyLineChart: React.FC<IMyChartProps> = ({ chartData, chartOptions }) => {
  return <Line data={chartData} options={chartOptions} />;
};

const App: React.FC = () => {
  const data: ChartData<'line'> = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'Продажи',
        data: [12, 19, 3, 5, 2, 3],
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
        text: 'Линейный график',
      },
    },
    scales: {
      x: {
        type: 'category', // явно указываем категориальную шкалу
      },
      y: {
        type: 'linear', // явно указываем линейную шкалу
        beginAtZero: true,
      },
    },
  };

  return <MyLineChart chartData={data} chartOptions={options} />;
};

export default App;