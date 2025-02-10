import packageJson from '../../package.json';
import { useState } from "react";
import Grid from "../components/grid";
import { IGridColumn } from '../tools/gridtools';
import { fetchData } from "../api/fetchData";
import AppContext from '../contexts/AppContext';

interface IPresetGridView {
    // width: string
    // height: string
}

// https://www.flaticon.com/free-icons/close

interface IPresetRow {
    app_id: string,
    preset_id: string,
    preset_data: string,
}

const cols: IGridColumn[] = [
    { key: 'app_id', name: 'App Id', width: 100, editable: false, },
    { key: 'preset_id', name: 'Preset Id', width: 100, editable: true, },
    { key: 'preset_data', name: 'Preset Data', width: 400, editable: false, },
]

const PresetView: React.FC<IPresetGridView> = ({}) => {

    const [rows, setRows] = useState<IPresetRow[]>([]) 
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const [postDisabled, setPostDisabled] = useState<boolean>(true) 

    const rowKeyGetter = (row: any) => { return row.app_id + row.preset_id }
    
    const deleteItem = () => {
        const tempRows: any[] = rows.filter(row => !selectedRows.has(rowKeyGetter(row)))
        setRows(tempRows)
        setSelectedRows(new Set<number>())
        setPostDisabled(false)
    }

    const nextKey = () => {
        return {app_id: packageJson.name, preset_id: 'new-preset', preset_data: '{}'}
    }

    // const keyExistsIn = (row: IPresetRow, rows: IPresetRow[], ): boolean => {
    //     return true
    // }

    const keyNotExistsIn = (row: IPresetRow, rows: IPresetRow[]): boolean => {
        return !rows.some(existingRow => 
            existingRow.app_id === row.app_id && 
            existingRow.preset_id === row.preset_id
        );
    }

    const addItem = () => {
        setRows([ ...rows, nextKey()]);    
        setPostDisabled(false)
    }

    const Refresh = async () => {
        const rows1 = await fetchData({
            from: 'cp3.perm_preset', 
            fields: 'app_id,preset_id,preset_data::text',
            order: 'app_id,preset_id',
        })
        setRows(rows1)
    }

    const rowVal = (row: any): string => {
        const result: string[] = []
        for (const key in row) {
            if (row.hasOwnProperty(key)) {
                result.push( key == 'preset_data' ? `''${row[key]}''::jsonb` : `''${row[key]}''`)
            }
        }
        return '('+result.join(',')+')'
    }

    const Post = async () => {
        const rowsPrev: IPresetRow[] = await fetchData({
            from: 'cp3.perm_preset', 
            fields: 'app_id,preset_id',
        })
        const rowsToDelete = rowsPrev
            .filter(( row => keyNotExistsIn(row,rows) ))
            .map(row => ({app_id: row.app_id, preset_id: row.preset_id}))
            .map(row => (rowVal(row)))

/** DELETE FROM orders WHERE (order_id, product_id) IN ((1, 101), (2, 202), (3, 303)); */            

        if (rowsToDelete.length > 0) {
            const deleteQuery = 
                `DELETE FROM cp3.perm_preset WHERE (app_id,preset_id) IN (VALUES ${rowsToDelete.join(',')});`
            const deleted = await fetchData({
                backend_point: AppContext.backend_point_query,
                query: deleteQuery, 
            })
            console.log('deleted', deleted)
            if (!(deleted.ok || false))
                throw new Error('DELETE FROM cp3.perm_preset FAILED');
        }

        const values = rows
            .map(row => (rowVal(row)))
            .join(',')
        const upsertQuery = 
`INSERT INTO cp3.perm_preset (app_id,preset_id,preset_data)
VALUES ${values}
ON CONFLICT (app_id,preset_id) DO UPDATE SET
    preset_data = EXCLUDED.preset_data;
`
        const upserted = await fetchData({
            backend_point: AppContext.backend_point_query,
            query: upsertQuery, 
        })
        console.log('upserted', upserted)
        
        setPostDisabled(true)
    }

    const onRowsChange = (rows: any, data: any) => {
        console.log(rows, data)
        setRows(rows)
        setSelectedRows(new Set([]))
    }

    return (
        <div>
            <button title="Delete"
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={deleteItem}
                >
                <img src="/src/assets/close.png" 
                alt="Delete" 
                style={{ width: '12px', height: '12px' }} 
                />
            </button>
            <button title="Add"
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={addItem}
            >
                <img src="/src/assets/plus.png" 
                alt="Add" 
                style={{ width: '12px', height: '12px' }} 
                />
            </button>
            <button title="Refresh"
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={Refresh}>Refresh
            </button>
            <button title="Post"
                disabled={postDisabled}
                onClick={Post}>Post
            </button>
            <Grid
                width="600px"
                height="500px"
                cols={cols}
                rows={rows}
                rowKeyGetter={rowKeyGetter}
                onRowsChange={onRowsChange}
                selectedRows={selectedRows}
                onSelectedRowsChange={setSelectedRows}
            />
        </div>
    )
}

export default PresetView
