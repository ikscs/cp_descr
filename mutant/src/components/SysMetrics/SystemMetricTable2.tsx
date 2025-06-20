import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { Metric } from './types';

interface Props {
  group_name: string;
  metrics: Metric[];
}

const formatValue = (value: any, type?: string, digits?: number) => {
  if (type === 'float' && typeof value === 'number' && typeof digits === 'number') {
    return value.toFixed(digits);
  }
  return value;
};

// const getStatusColor = (metric: Metric, fieldName: string) => {
//   if (
//     metric.template.status &&
//     fieldName === 'status' &&
//     metric.value['status'] !== undefined
//   ) {
//     const statusValue = Number(metric.value['status']);
//     const statusObj = metric.template.status.find(s => s.value === statusValue);
//     return statusObj?.colour || undefined;
//   }
//   return undefined;
// };

const getStatusColor = (metric: Metric, fieldName: string) => {
  if (
    metric.template.status &&
    fieldName === 'status' &&
    metric.value['status'] !== undefined
  ) {
    const statusValue = String(metric.value['status']);
    const statusObj = metric.template.status.find(s => s.value === statusValue);
    return statusObj?.colour || undefined;
  }
  return undefined;
};

const SystemMetricTable2: React.FC<Props> = ({ group_name, metrics }) => {
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
            <TableCell>Поле</TableCell>
            <TableCell>Значение</TableCell>
            <TableCell>Время сбора</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map(metric => {
            const fields = metric.template.fields;
            return fields.map((field, idx) => {
              const cellColor = getStatusColor(metric, field.name);
              return (
                <TableRow key={metric.id + '-' + field.name}>
                  {idx === 0 && (
                    <>
                      <TableCell rowSpan={fields.length}>{metric.metric_name}</TableCell>
                      <TableCell rowSpan={fields.length}>{metric.comment}</TableCell>
                    </>
                  )}
                  {idx !== 0 && null}
                  <TableCell>{field.label || field.name}</TableCell>
                  <TableCell
                    sx={cellColor ? { color: cellColor, fontWeight: 600 } : undefined}
                  >
                    {metric.value[field.name] !== undefined
                      ? formatValue(metric.value[field.name], field.type, field.digits)
                      : '-'}
                  </TableCell>
                  {idx === 0 && (
                    <TableCell rowSpan={fields.length}>
                      {new Date(metric.collected_at).toLocaleTimeString()}
                    </TableCell>
                  )}
                  {idx !== 0 && null}
                </TableRow>
              );
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SystemMetricTable2;