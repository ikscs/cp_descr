import React from 'react';
import Grid from '../components/grid copy';
import { gridCols } from '../tools/widegridtools';

interface WideGridProps {
    rows: [],
    width?: string,
}

const WideGrid: React.FC<WideGridProps> = ({ rows, width }) => {

    const rowKeyGetter = (row: any) => {
        return row.manuf +'/'+ row.article
    };

    const onCellClick = (event: any) => {
        console.log('event', event);
        // Implement your onCellClick logic here
    };

    const onRowSelect = (selectedRow: any) => {
        console.log('selectedRow', selectedRow);
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
