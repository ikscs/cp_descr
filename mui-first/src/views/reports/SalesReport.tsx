import React from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import Grid2 from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface SalesReportProps {
  onClose: () => void;
  reportName: string;
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'product', headerName: 'Продукт', width: 200 },
  { field: 'quantity', headerName: 'Количество', width: 130 },
  { field: 'price', headerName: 'Цена', width: 130 },
  { field: 'total', headerName: 'Итого', width: 160 },
];

const rows: GridRowsProp = [
  { id: 1, product: 'Товар 1', quantity: 10, price: 100, total: 1000 },
  { id: 2, product: 'Товар 2', quantity: 5, price: 200, total: 1000 },
  { id: 3, product: 'Товар 3', quantity: 20, price: 50, total: 1000 },
  { id: 4, product: 'Товар 4', quantity: 15, price: 75, total: 1125 },
  { id: 5, product: 'Товар 5', quantity: 8, price: 120, total: 960 },
  { id: 6, product: 'Товар 6', quantity: 12, price: 90, total: 1080 },
  { id: 7, product: 'Товар 7', quantity: 18, price: 60, total: 1080 },
  { id: 8, product: 'Товар 8', quantity: 25, price: 40, total: 1000 },
  { id: 9, product: 'Товар 9', quantity: 7, price: 150, total: 1050 },
  { id: 10, product: 'Товар 10', quantity: 11, price: 80, total: 880 },
];

const SalesReport: React.FC<SalesReportProps> = ({ onClose, reportName }) => {
  return (
    <Grid2 container spacing={2} sx={{ backgroundColor: '#121212', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid2 columns={{ xs: 12 }} sx={{flex: '0 0 auto'}}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          {reportName}
        </Typography>
      </Grid2>
      <Grid2 columns={{ xs: 12 }} sx={{flex: '1 1 auto'}}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{
            backgroundColor: '#1e1e1e',
            color: 'white',
            border: '1px solid #333',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #333',
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '1px solid #333',
              color: 'black',
            },
            '& .MuiDataGrid-footer': {
              borderTop: '1px solid #333',
            },
            '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
              color: 'white',
            },
            '& .MuiTablePagination-select': {
              color: 'white',
              '& .MuiSelect-icon': {
                color: 'white',
              },
            },
          }}
        />
      </Grid2>
      <Grid2 columns={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, flex: '0 0 auto' }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Закрыть
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default SalesReport;