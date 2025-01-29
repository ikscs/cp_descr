import { useEffect, useMemo, useState, createContext, /*useContext,*/ } from "react"; 
import DataGrid, {
    // Row,
    SelectColumn,
    textEditor,
    // SelectCellFormatter,
    // type Column,
    // type DataGridHandle,
    type SortColumn
  } from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import GridFilterRenderer from "./GridFilterRenderer";

// https://adazzle.github.io/react-data-grid/#/CommonFeatures

const filterColumnClassName = 'filter-cell';

interface IGridProps {
    cols: any[],
    rows: [],
    rowKeyGetter?: (row: any) => any,
    onRowsChange?: (rows: any, data: any) => void,
    onCellClick?: (row: any) => void,
    onRowSelect?: (row: any) => any,
    height?: string, 
    width?: string, 
    maxColWidth?: number,
}

// const filterClassname = `
//   inline-size: 100%;
//   padding: 4px;
//   font-size: 14px;
// `;

interface Filter {
    [key: string]: string;
}

// Context is needed to read filter values otherwise columns are
// re-created when filters are changed and filter loses focus
const FilterContext = createContext<Filter | undefined>(undefined);

function Grid(props: IGridProps) {

    console.log('Grid props', props)
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
    
    // make sure filters are initialized with empty strings
    const [filters, setFilters] = useState((): Filter => {
        console.log('Setting filters')
        const f: Filter = {}
        props.cols.forEach(col => { f[col.key] = '' })
        return f
    })

    useEffect(() => {
        console.log('Setting rows', props.rows)
        setRows(props.rows)
    }, [props.rows])

    const onRowsChange = (rows: any, data: any) => {
        console.log('Rows changed', rows, data)
        try {
            props.onRowsChange && props.onRowsChange(rows, data);
            setRows(rows)
        } catch(e) {
            // continue
        }
    }

    const colsRendered = useMemo(() => {
        console.log('Rendering cols', props.cols, filters)
        let result = props.cols.map(col => {
            if (col.editable)
                return {...col, renderEditCell: textEditor, renderHeaderCell: GridFilterRenderer, }
            else
                return {
                    ...col, 
                    renderHeaderCell: (props: any) => <GridFilterRenderer {...props} filters={filters} setFilters={setFilters} />,
                    headerCellClass: filterColumnClassName,
                }
            })
            result.push(SelectColumn)
            return result
        }, [props.cols, filters])

    const filteredRows = useMemo(() => {
        console.log('Filtering rows', rows, filters)
        return rows.filter((row) => {
            return Object.keys(filters).every((key) => {
                if (!filters[key]) return true;
                const rowValue = (row[key]as string)?.toString().toLowerCase();
                const filterValue = filters[key].toString().toLowerCase();
                if (rowValue === undefined) return false
                return rowValue.includes(filterValue);
            });
        });
    }, [rows, filters]);

    const sortedRows = useMemo((): readonly any[] => {
        console.log('Sorting rows', filteredRows, sortColumns)
        if (sortColumns.length === 0) return filteredRows;
    
        return [...filteredRows].sort((a, b) => {
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
      }, [filters, filteredRows, sortColumns, ]);
      
    return (
    < div >
        <FilterContext.Provider value={filters}>
        <DataGrid
            columns ={ colsRendered }
            rows ={ sortedRows}
            // rows ={ filteredRows }
            style={{ height: props.height || '800px', width: props.width || '750px'}}
            defaultColumnOptions={{
                sortable: true,
                resizable: true,
                maxWidth: props.maxColWidth || 300,
                // maxWidth: 300, // todo: setup
            }}
            direction ={ 'ltr'}
            sortColumns = {sortColumns}
            onSortColumnsChange={setSortColumns}
            onRowsChange={onRowsChange}
            rowKeyGetter={props.rowKeyGetter}
            onCellClick={props.onCellClick}
            selectedRows={selectedRows}
            onSelectedRowsChange={(selectedRows: Set<number>) => { 
                console.log('Selected rows changed', selectedRows)
                setSelectedRows(selectedRows)
                if (props.onRowSelect)
                    props.onRowSelect(selectedRows)
            }}
            className="fill-grid"
            headerRowHeight={70}
        />
        </FilterContext.Provider>
        < tr >Record count: { props.rows?.length}</ tr >
    </ div >
    )
}

export default Grid
