// interface RowSelectionParams<R> {
//     row: R;
//     rowIdx: number;
// }
  
import React, { useState, useEffect } from 'react';
import DataGrid, { DataGridProps } from 'react-data-grid';

interface ExtendedDataGridProps<R> extends DataGridProps<R> {
  newSelectedRows?: (selectedRows: R[]) => void;
}

const ExtendedDataGrid: React.FC<ExtendedDataGridProps<any>> = ({ newSelectedRows, ...props }) => {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<React.Key>>(new Set());

  useEffect(() => {
    if (newSelectedRows) {
      const selectedRowsArray = Array.from(selectedRowIds).map(id => props.rows.find(row => row.id === id));
      newSelectedRows(selectedRowsArray);
    }
  }, [selectedRowIds, newSelectedRows, props.rows]);

  const onSelectedRowsChange = (selectedRows: Set<React.Key>) => {
    setSelectedRowIds(selectedRows);
  };

  return (
    <DataGrid
      {...props}
      selectedRows={selectedRowIds}
      onSelectedRowsChange={onSelectedRowsChange}
    />
  );
};

export default ExtendedDataGrid;
