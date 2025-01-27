import React from 'react';
import Grid from '../components/grid';
import { gridCols } from '../tools/widegridtools';
// import { getGridRows, gridCols } from '../tools/widegridtools';
// import { IDescrFilter } from '../types';

interface WideGridProps {
    rows: [],
    width?: string,
    // manufFilter: string, 
    // descrFilter: IDescrFilter,
    // gridLimit: number,
}

// interface IProductWide {
//     manuf: string;
//     article: string;
//     internal_name: string;
//     name_ua: string;
//     name_ru: string;
//     name_en: string;
//     descr_ua: string;
//     descr_ru: string;
//     descr_en: string;
// }

const WideGrid: React.FC<WideGridProps> = ({ rows, width }) => {
    // const [gridRows, setGridRows] = React.useState<[]>([]);

    const rowKeyGetter = (row: any) => {
        return row.id; // Adjust according to your row data structure
    };

    const onCellClick = (event: any) => {
        console.log(event);
        // Implement your onCellClick logic here
    };

    const onRowSelect = (selectedRow: any) => {
        console.log(selectedRow);
        // Implement your onRowSelect logic here
    };

    React.useEffect(() => {

    }, [rows]);

    return (
        <Grid
            width={width || '800px'}
            cols={gridCols}
            rows={rows}
            rowKeyGetter={rowKeyGetter}
            onRowsChange={(rows: any, data: any) => {
                console.log(rows, data);
                // postGrid(rows, data, subj);
            }}
            onCellClick={onCellClick}
            onRowSelect={onRowSelect}
        />
    );
};

export default WideGrid;
