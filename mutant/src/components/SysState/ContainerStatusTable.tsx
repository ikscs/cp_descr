import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip } from '@mui/material';
import { HostContainerStatus } from './types';

interface ContainerStatusTableProps {
  data: HostContainerStatus[];
}

const ContainerStatusTable: React.FC<ContainerStatusTableProps> = ({ data }) => {
  const getStatusChipColor = (status: HostContainerStatus['status']) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'error';
      case 'exited':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      {/* <Typography variant="h6" component="div" sx={{ p: 2 }}>
        Host Container Status
      </Typography> */}
      <Table aria-label="host container status table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Host Name</TableCell>
            <TableCell>Container Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Collected At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell>{row.host_name}</TableCell>
              <TableCell>{row.container_name}</TableCell>
              <TableCell>
                <Chip label={row.status} color={getStatusChipColor(row.status)} />
              </TableCell>
              <TableCell>{new Date(row.collected_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContainerStatusTable;