import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { HostDiskUsage } from './types';

interface DiskUsageTableProps {
  data: HostDiskUsage[];
}

const DiskUsageTable: React.FC<DiskUsageTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      {/* <Typography variant="h6" component="div" sx={{ p: 2 }}>
        Host Disk Usage
      </Typography> */}
      <Table aria-label="host disk usage table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Host Name</TableCell>
            <TableCell>Disk Path</TableCell>
            <TableCell align="right">Total Size (GB)</TableCell>
            <TableCell align="right">Free Space (GB)</TableCell>
            <TableCell align="right">%</TableCell>
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
              <TableCell>{row.disk_path}</TableCell>
              <TableCell align="right">{row.total_size_gb.toFixed(2)}</TableCell>
              <TableCell align="right">{row.free_space_gb.toFixed(2)}</TableCell>
              <TableCell align="right">{(row.free_space_gb/row.total_size_gb*100).toFixed(2)}</TableCell>
              <TableCell>{new Date(row.collected_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiskUsageTable;