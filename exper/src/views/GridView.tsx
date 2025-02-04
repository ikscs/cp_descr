import React from 'react';
// import GridFilter from 'best-component-library';
import GridFilter from '../components/GridFilter';
import { useTabContext } from './TabContext';

export interface IGridViewState {
    rows: any[];
}
  
interface GridViewProps {
    width?: string,
    height?: string,
}

interface IGridColumn {
    key: string,
    name: string,
    width?: number | string,
    editable?: boolean,
	filterType?: string,
	filterOptions?: {value: any, label: string}[],
	resizable?: boolean,
}

const gridCols: IGridColumn[] = [
    { key: 'product_group', name: 'Group', width: 150, filterType: 'textbox' },
    { key: 'manuf', name: 'Manufacturer', width: 100, filterType: 'textbox', editable: true },
    { key: 'article', name: 'Article', width: 150, filterType: 'textbox'},
];

export const gridRowsInitial: any[] = [
    { product_group: 'Group1', manuf: 'Manuf5 ****', article: 'Art1' },
    { product_group: 'Group2', manuf: 'Manuf4', article: 'Art2' },
    { product_group: 'Group3', manuf: 'Manuf3', article: 'Art3' },
    { product_group: 'Group4', manuf: 'Manuf2', article: 'Art4' },
    { product_group: 'Group5', manuf: 'Manuf1', article: 'Art5' },
    { product_group: 'Group6', manuf: 'Manuf6', article: 'Art6' },
    { product_group: 'Group7', manuf: 'Manuf7', article: 'Art7' },
    { product_group: 'Group8', manuf: 'Manuf8', article: 'Art8' },
    { product_group: 'Group9', manuf: 'Manuf9', article: 'Art9' },
]

const GridView: React.FC<GridViewProps> = ({ width,height }) => {
    const { gridViewState, setGridViewState } = useTabContext();

    const rowKeyGetter = (row: any) => {
        return row.manuf +'/'+ row.article
    };

    const onCellClick = (event: any) => {
        console.log('onCellClick event', event);
        // Implement your onCellClick logic here
    };

    const onRowSelect = (selectedRow: any) => {
        console.log('selectedRow', selectedRow);
        // Implement your onRowSelect logic here
    };

    React.useEffect(() => {
        // console.log('GridView useEffect');
        // setGridViewState({ rows: gridRowsInitial});
    }, []);

    // const [gridRows, setGridRows] = useState<any[]>(); // gridRowsInitial

    return (
        <GridFilter
            width={width || '800px'}
            height={height || '400px'}
            cols={gridCols}
            rows={gridViewState.rows||[]}
            rowKeyGetter={rowKeyGetter}
            onRowsChange={(rows: any, data: any) => {
                console.log(rows, data);
                setGridViewState({rows});
            }}
            onCellClick={onCellClick}
            onRowSelect={onRowSelect}
        />
    );
};

export default GridView;
