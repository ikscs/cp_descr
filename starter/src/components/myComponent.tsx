import React, { useState } from 'react';
import DataGrid, { Column, RowsChangeData } from 'react-data-grid';

interface Row {
  id: number;
  title: string;
}

const columns: Column<Row>[] = [
  { key: 'id', name: 'ID' },
  { key: 'title', name: 'Title' },
  // other columns
];

const initialRows: Row[] = [
  { id: 0, title: 'Example' },
  { id: 1, title: 'Example 2' },
  { id: 2, title: 'Example 3' },
  // add more rows as needed
];

const MyComponent: React.FC = () => {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const handleRowsChange = (newRows: Row[], data: RowsChangeData<Row>) => {
    console.log('Rows changed', newRows, data);
    setRows(newRows);
  };

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onRowsChange={handleRowsChange}
    />
  );
};

export default MyComponent;
