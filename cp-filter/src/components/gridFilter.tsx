import { useEffect, useMemo, useState, useCallback, /* createContext,useContext,*/ } from "react";
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
    rows: any[],
    rowKeyGetter?: (row: any) => any,
    onRowsChange?: (rows: any, data: any) => void,
    onCellClick?: (row: any) => void,
    selectedRows?: Set<number>,
    onSelectedRowsChange?: (set: ReadonlySet<number>) => any,
    onSelectedCellChange?: (cellInfo: any) => void,

    height?: string,
    width?: string,
    maxColWidth?: number,
}

interface Filter {
    [key: string]: string;
}

interface ISelectedPosition {
    rowIdx: number;
    colName: string;
}

// Context is needed to read filter values otherwise columns are
// re-created when filters are changed and filter loses focus
// const FilterContext = createContext<Filter | undefined>(undefined);

function Grid(props: IGridProps) {

    const [count, setCount] = useState(0);
    const increment = () => { setCount(prevCount => prevCount + 1); };

    const [selectedPosition, setSelectedPosition] = useState<ISelectedPosition | null>(null);
    const [rows, setRows] = useState<any[]>([]);
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
        // provide options for filter-select columns
        // for (const col of props.cols) {
        //     if (col.filterType == 'select') {
        //         const vals: string[] = props.rows.map((row: any) => row[col.key])
        //         const distinct_vals = [...new Set(vals)] // ES6
        //         col.options = distinct_vals.map((val: string) => ({value: val, label: val}))
        //     }
        // }

        console.log('Setting rows', props.rows)
        setRows(props.rows)
    }, [props.rows])

    const onRowsChange = (rows: any, data: any) => {
        console.log('Rows changed', rows, data)
        try {
            props.onRowsChange && props.onRowsChange(rows, data);
            setRows(rows)
        } catch (e) {
            // continue
        }
    }

    const colsRendered = useMemo(() => {
        // provide options for filter-select columns
        for (const col of props.cols) {
            if (col.filterType == 'select') {
                const vals: string[] = props.rows.map((row: any) => row[col.key])
                const distinct_vals = [...new Set(vals)] // ES6
                col.options = distinct_vals
                    .sort((a, b) => a == b ? 0 : (a < b ? -1 : 1))
                    .map((val: string) => ({ value: val, label: val }))
            }
        }

        console.log('Rendering cols', props.cols, filters)
        let result = props.cols.map(col => {
            if (col.editable)
                return {
                    ...col,
                    renderEditCell: textEditor,
                    editable: true,
                    renderHeaderCell: (props: any) =>
                        <GridFilterRenderer {...props}
                            filters={filters}
                            setFilters={setFilters}
                            getEditable={getEditable}
                        />,
                    headerCellClass: filterColumnClassName,
                }
            else
                return {
                    ...col,
                    renderHeaderCell: (props: any) =>
                        <GridFilterRenderer {...props}
                            filters={filters}
                            setFilters={setFilters}
                            getEditable={getEditable}
                        />,
                    headerCellClass: filterColumnClassName,
                }
        })
        result.push(SelectColumn)
        return result
    }, [props.cols, props.rows, filters])

    const filteredRows = useMemo(() => {
        console.log('Filtering rows', rows, filters)
        return rows.filter((row) => {
            return Object.keys(filters).every((key) => {
                if (!filters[key]) return true;
                const filterValue = filters[key].toString().toLowerCase();
                const rowValue = row[key];

                if (typeof rowValue === 'number') {
                    if (filterValue.startsWith('>')) {
                        const num = parseFloat(filterValue.substring(1));
                        return rowValue > num;
                    } else if (filterValue.startsWith('<')) {
                        const num = parseFloat(filterValue.substring(1));
                        return rowValue < num;
                    } else if (filterValue.startsWith('=')) {
                        const num = parseFloat(filterValue.substring(1));
                        return rowValue === num;
                    } else {
                        const num = parseFloat(filterValue);
                        return rowValue === num;
                    }
                } else if (typeof rowValue === 'string') {
                    const rowValueLower = rowValue.toLowerCase();
                    return rowValueLower.includes(filterValue);
                } else {
                    return false;
                }
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
    }, [filters, filteredRows, sortColumns,]);

    const onSelectedCellChange = (cellInfo: any) => {
        console.log('Cell selected', cellInfo.rowIdx, cellInfo.column.name)
        setSelectedPosition(() => {
            return {
                rowIdx: cellInfo.rowIdx,
                colName: cellInfo.column.name
            }
        });
        props.onSelectedCellChange && props.onSelectedCellChange(cellInfo)
    }

    const getSelectedPosition = () => {
        console.log('Get selected position', selectedPosition)
        return selectedPosition
    }

    // is selected cell is editable
    const getEditable = useCallback((): boolean => {
        console.log('Get editable DEBUG', count, increment()) // to trigger re-render
        getSelectedPosition()

        const found = props.cols.find(col => col.name == selectedPosition?.colName)
        console.log('Get editable', selectedPosition?.colName, found ? found.editable || false : false)
        return found ? found.editable : false
    }, [])

    console.log('Grid copy props, selectedPosition', props, selectedPosition)
    return (
        < div >
            {/* <FilterContext.Provider value={filters}> */}
            <DataGrid
                columns={colsRendered}
                rows={sortedRows}
                style={{ height: props.height || '800px', width: props.width || '750px' }}
                defaultColumnOptions={{
                    sortable: true,
                    resizable: true,
                    maxWidth: props.maxColWidth || 1000,
                    // maxWidth: 300, // todo: setup
                }}
                direction={'ltr'}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                onRowsChange={onRowsChange}
                rowKeyGetter={props.rowKeyGetter}
                onCellClick={props.onCellClick}
                selectedRows={selectedRows}
                onSelectedRowsChange={(selectedRows: Set<number>) => {
                    console.log('Selected rows changed', selectedRows)
                    setSelectedRows(selectedRows)
                    if (props.onSelectedRowsChange)
                        props.onSelectedRowsChange(selectedRows)
                }}
                className="fill-grid"
                headerRowHeight={70}
                onSelectedCellChange={onSelectedCellChange}
            />
            {/* </FilterContext.Provider> */}
            < tr >Record count: {props.rows?.length} Selected: {selectedRows.size}</ tr >
        </ div >
    )
}

export default Grid
