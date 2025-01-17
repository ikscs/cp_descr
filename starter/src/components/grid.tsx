import { useEffect, useMemo, useState } from "react"; 
// import DataGrid from "react-data-grid";
import DataGrid, {
    // SelectCellFormatter,
    SelectColumn,
    textEditor,
    // type Column,
    // type DataGridHandle,
    type SortColumn
  } from "react-data-grid";
  import 'react-data-grid/lib/styles.css';

// yarn add react-data-grid
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

//     const sortedRows = useMemo((): readonly Row[] => {
  
    const sortedRows = useMemo((): readonly any[] => {
        if (sortColumns.length === 0) return rows;
    
        return [...rows].sort((a, b) => {
          for (const sort of sortColumns) {
            // const comparator = getComparator(sort.columnKey);
            // const compResult = comparator(a, b);
            const vala = a[sort.columnKey]
            const valb = b[sort.columnKey]
            const compResult = (vala == valb) ? 0 : (vala < valb) ? -1 : 1
            // console.log(a,b,compResult)
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

    // function onCellClick(args: CellClickArgs<R, SR>, event: CellMouseEvent) {
    //     if (args.column.key === 'id') {
    //       event.preventGridDefault();
    //       args.selectCell(true);
    //     }
    //   }
    
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
        < tr >Record count: { props.rows.length}</ tr >
    </ div >
    )
}

export default Grid
