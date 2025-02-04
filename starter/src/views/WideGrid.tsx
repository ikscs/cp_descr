import React from 'react';
import Grid from '../components/grid copy';
import { gridCols } from '../tools/widegridtools';

interface WideGridProps {
    rows: [],
    width?: string,
    onRowSelect: (rows: any[]) => void
}

const WideGrid: React.FC<WideGridProps> = ({ rows, width, onRowSelect }) => {

    const rowKeyGetter = (row: any) => {
        return row.manuf +'/'+ row.article
    };

    const onCellClick = (event: any) => {
        console.log('onCellClick event', event);
        // Implement your onCellClick logic here
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
                // todo: postGrid(rows, data, subj);
            }}
            onCellClick={onCellClick}
            onRowSelect={onRowSelect}
        />
    );
};

export default WideGrid;
