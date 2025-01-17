import { useEffect, useMemo, useState } from "react"; 
import DataGrid, {
    SelectColumn,
    textEditor,
    // SelectCellFormatter,
    // type Column,
    // type DataGridHandle,
    type SortColumn
  } from "react-data-grid";
  import 'react-data-grid/lib/styles.css';

// https://adazzle.github.io/react-data-grid/#/CommonFeatures

interface IGridProps {
    cols: any[],
    rows: [],
    filter?: Object,
    rowKeyGetter?: (row: any) => any,
    onRowsChange?: (rows: any, data: any) => void,
}

function Grid(props: IGridProps) {
    console.log('Grid props', props)
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

    const sortedRows = useMemo((): readonly any[] => {
        if (sortColumns.length === 0) return rows;
    
        return [...rows].sort((a, b) => {
          for (const sort of sortColumns) {
            const vala = a[sort.columnKey]
            const valb = b[sort.columnKey]
            const compResult = (vala == valb) ? 0 : (vala < valb) ? -1 : 1
            if (compResult !== 0) {
              return sort.direction === 'ASC' ? compResult : -compResult;
            }
          }
          return 0;
        });
      }, [rows, sortColumns]);
      
    useEffect(() => {
        setRows(props.rows)
    }, [props.rows])

    const onRowsChange = (rows: any, data: any) => {
        try {
            props.onRowsChange && props.onRowsChange(rows, data);
            setRows(rows)
        } catch(e) {
            // continue
        }
    }

    let cols1 = props.cols.map(obj => ({ ...obj, renderEditCell: textEditor }))
    cols1.push(SelectColumn)

    // rows

    return (
    < div >
        < DataGrid
            columns ={ cols1 }
            rows ={ sortedRows}
            style={{ height: '800px' }} 
            defaultColumnOptions={{
                sortable: true,
                resizable: true
            }}
            direction ={ 'ltr'}
            sortColumns = {sortColumns}
            onSortColumnsChange={setSortColumns}
            onRowsChange={onRowsChange}
            rowKeyGetter={props.rowKeyGetter}
            // onCellClick={onCellClick}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            className="fill-grid"
        />
        {/* < tr >Record count: { props.rows.length}</ tr > */}
    </ div >
    )
}

export default Grid
