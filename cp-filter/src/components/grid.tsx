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
    rows: any[],
    filter?: Object,
    rowKeyGetter?: (row: any) => any,
    onRowsChange?: (rows: any, data: any) => void,
    onCellClick?: (row: any) => void,
    height?: string, 
    width?: string, 
    maxColWidth?: number,
    selectedRows?: Set<number>
    onSelectedRowsChange?: (rows: Set<number>) => void,
}

// const emptySet = (): ReadonlySet<number> => new Set([])

function Grid(props: IGridProps) {
    console.log('Grid props', props)
    const [rows, setRows] = useState<any[]>([]);
    // const [selectedRows, setSelectedRows] = useState(emptySet);
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
    
    // let cols1 = props.cols.map(obj => ({ ...obj, renderEditCell: textEditor }))
    let cols1 = props.cols.map(obj => {
        if (obj.editable)
            return {...obj, renderEditCell: textEditor }
        else
            return obj;
    })
    cols1.push(SelectColumn)

    // rows

    return (
    < div >
        < DataGrid
            columns ={ cols1 }
            rows ={ sortedRows}
            style={{ height: props.height || '800px', width: props.width || '750px'}}
            defaultColumnOptions={{
                sortable: true,
                resizable: true,
                maxWidth: props.maxColWidth || 300,
            }}
            direction ={ 'ltr'}
            sortColumns = {sortColumns}
            onSortColumnsChange={setSortColumns}
            onRowsChange={onRowsChange}
            rowKeyGetter={props.rowKeyGetter}
            onCellClick={props.onCellClick}
            selectedRows={props.selectedRows}
            onSelectedRowsChange={props.onSelectedRowsChange} 
            className="fill-grid"
        />
        < tr >Record count: { props.rows?.length}</ tr >
    </ div >
    )
}

export default Grid
