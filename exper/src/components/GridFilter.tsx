import { useEffect, useMemo, useState, createContext, useCallback } from "react"; 
import DataGrid, { SelectColumn, textEditor, type SortColumn } from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import GridFilterRenderer from "./GridFilterRenderer";

const filterColumnClassName = 'filter-cell';

interface IGridProps {
    cols: any[],
    rows: any[],
    rowKeyGetter?: (row: any) => any,
    onRowsChange?: (rows: any, data: any) => void,
    onCellClick?: (row: any) => void,
    onRowSelect?: (row: any) => any,
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

const FilterContext = createContext<Filter | undefined>(undefined);

function Grid(props: IGridProps) {
    const [selectedPosition, setSelectedPosition] = useState<ISelectedPosition | null>(null);
    const [rows, setRows] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
    
    const [filters, setFilters] = useState<Filter>(() => {
        const f: Filter = {};
        props.cols.forEach(col => { f[col.key] = '' });
        return f;
    });

    useEffect(() => {
        setRows(props.rows);
    }, [props.rows]);

    const onRowsChange = useCallback((rows: any, data: any) => {
        try {
            props.onRowsChange && props.onRowsChange(rows, data);
            setRows(rows);
        } catch(e) {
            // continue
        }
    }, [props]);

    const colsRendered = useMemo(() => {
        return props.cols.map(col => {
            const colsRendered = {
                ...col,
                headerCellClass: filterColumnClassName,
                renderHeaderCell: (props: any) => 
                    <GridFilterRenderer {...props} 
                        filters={filters} 
                        setFilters={setFilters} 
                        getEditable={getEditable}
                    />,
            };
            return col.editable ?
                { ...colsRendered, renderEditCell: textEditor, editable: true } : 
                colsRendered;
        }).concat(SelectColumn);
    }, [props.cols, filters]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            return Object.keys(filters).every((key) => {
                if (!filters[key]) return true;
                const rowValue = (row[key] as string)?.toString().toLowerCase();
                const filterValue = filters[key].toString().toLowerCase();
                if (rowValue === undefined) return false;
                return rowValue.includes(filterValue);
            });
        });
    }, [rows, filters]);

    const sortedRows = useMemo((): readonly any[] => {
        if (sortColumns.length === 0) return filteredRows;
    
        return [...filteredRows].sort((a, b) => {
            for (const sort of sortColumns) {
                const vala = a[sort.columnKey];
                const valb = b[sort.columnKey];
                const compResult = (vala == valb) ? 0 : (vala < valb) ? -1 : 1;
                if (compResult !== 0) {
                    return sort.direction === 'ASC' ? compResult : -compResult;
                }
            }
            return 0;
        });
    }, [filteredRows, sortColumns]);

    const onSelectedCellChange = useCallback((cellInfo: any) => {
        setSelectedPosition({ rowIdx: cellInfo.rowIdx, colName: cellInfo.column.name });
    }, []);

    const getEditable = useCallback((): boolean => {
        const found = props.cols.find(col => col.name === selectedPosition?.colName);
        return found ? found.editable : false;
    }, [props.cols, selectedPosition]);

    const handleFilterInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

    const handleFilterInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            ['manuf']: value
        }));
    };

    return (
        <div>
            <DataGrid
                columns={colsRendered}
                rows={sortedRows}
                style={{ height: props.height || '800px', width: props.width || '750px' }}
                defaultColumnOptions={{
                    sortable: true,
                    resizable: true,
                    maxWidth: props.maxColWidth || 300,
                }}
                direction={'ltr'}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                onRowsChange={onRowsChange}
                rowKeyGetter={props.rowKeyGetter}
                onCellClick={props.onCellClick}
                selectedRows={selectedRows}
                onSelectedRowsChange={(selectedRows: Set<number>) => { 
                    setSelectedRows(selectedRows);
                    if (props.onRowSelect) props.onRowSelect(selectedRows);
                }}
                className="fill-grid"
                headerRowHeight={70}
                onSelectedCellChange={onSelectedCellChange}
            />
            <div>Record count: {props.rows?.length} selected: {selectedPosition?.colName}</div>
            <input
                type="text"
                name="filter"
                placeholder="Filter"
                onKeyDown={handleFilterInputKeyDown}
                onChange={handleFilterInputChange}
                value={filters['filter']}
            />
        </div>
    );
}

export default Grid;
