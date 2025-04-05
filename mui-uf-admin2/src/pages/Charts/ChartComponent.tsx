import React from 'react';
import { LineChart, XAxis, YAxis, Line, CartesianGrid, Tooltip } from '@mui/x-charts';
import { Legend } from '@mui/x-charts'; // Import Legend from @mui/x-charts
import { ResponsiveContainer } from '@mui/x-charts/LineChart';
import { Typography } from '@mui/material';

interface ChartData {
  name: string;
  value: number;
}

interface ChartComponentProps {
  title: string;
  data: ChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  dataKey: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ title, data, xAxisLabel = 'X-Axis', yAxisLabel = 'Y-Axis', dataKey }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }} />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
