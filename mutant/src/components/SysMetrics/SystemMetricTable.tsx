import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { Metric } from './types';

interface Props {
  group_name: string;
  metrics: Metric[];
}

const SystemMetricTable: React.FC<Props> = ({ group_name, metrics }) => {
  if (!metrics.length) {
    return (
      <Typography variant="body2" sx={{ mt: 2 }}>
        Нет метрик для группы <b>{group_name}</b>
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Комментарий</TableCell>
            {/* Для каждого поля из шаблона выводим отдельный столбец */}
            {metrics[0].template.fields.map(field => (
              <TableCell key={field.name}>{field.label || field.name}</TableCell>
            ))}
            <TableCell>Время сбора</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map(metric => (
            <TableRow key={metric.id}>
              <TableCell>{metric.metric_name}</TableCell>
              <TableCell>{metric.comment}</TableCell>
              {metric.template.fields.map(field => (
                <TableCell key={field.name}>
                  {metric.value[field.name] !== undefined ? metric.value[field.name] : '-'}
                </TableCell>
              ))}
              <TableCell>
                {new Date(metric.collected_at).toLocaleTimeString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SystemMetricTable;