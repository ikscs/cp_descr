import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface SalesDynamicProps {
  onClose: () => void;
  reportName: string;
}

const data = [
  { name: 'Янв', sales: 4000 },
  { name: 'Фев', sales: 3000 },
  { name: 'Мар', sales: 2000 },
  { name: 'Апр', sales: 2780 },
  { name: 'Май', sales: 1890 },
  { name: 'Июн', sales: 2390 },
  { name: 'Июл', sales: 3490 },
];

const SalesDynamic: React.FC<SalesDynamicProps> = ({ onClose, reportName }) => {
  return (
    <Grid2 container spacing={2} sx={{ backgroundColor: '#121212', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid2 columns={{ xs: 12 }} sx={{ flex: '0 0 auto' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          {reportName}
        </Typography>
      </Grid2>
      <Grid2 columns={{ xs: 12 }} sx={{ flex: '1 1 auto' }}>
        <LineChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" />
        </LineChart>
      </Grid2>
      <Grid2 columns={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, flex: '0 0 auto' }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Закрыть
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default SalesDynamic;