// import React, { useEffect, useState } from 'react';
import Grid from '../components/grid';
import { IGridColumn } from '../tools/gridtools';
// import packageJson from '../../package.json';
// import { fetchData } from '../api/fetchData';
// import { InputString } from '../components/Input';
// import AppContext from '../contexts/AppContext';
// import { getCount } from '../api/dataTools';
import { usePresetContext } from '../contexts/PresetContext';

interface IManufGridView {
    // width: string
    // height: string
    // manufGridCols: any[]
    // manufGridRows: any[]
    // manufGridRowsSelected: Set<number>
    // setManufGridCols: (cols: any[])=>void
    // setManufGridRows: (rows: any[])=>void
    // setManufGridRowsSelected: (set_: Set<number>)=>void
    // preset: string
    // setPreset: (value: string)=>void
}

// https://www.flaticon.com/free-icons/close

const cols: IGridColumn[] = [
    { key: 'key', name: 'key', width: 40, },
    { key: 'value', name: 'manuf', width: 150, editable: true, },
]

// export const loadPreset = async (preset: string) => {
//     return await fetchData({
//         from: 'cp3.perm_preset', 
//         fields: 'preset_id,preset_data',
//         where: preset.length > 0 ? {app_id: packageJson.name, preset_id: preset} : {app_id: packageJson.name}
//     })
// }
//
// const qq = (s: string) => `''${s}''`
//const q = (s: string) => `'${s}'`
//
// const postPreset = async (preset: string, rows: any[]) => {
//     if (rows.length == 0)
//         return

//     const count = await getCount({
//         from: 'cp3.perm_preset',
//         where: {app_id: packageJson.name, preset_id: preset}
//     })

//     const fetchParam = count == 0 ? {
//         backend_point: AppContext.backend_point_insert,
//         dest: 'cp3.perm_preset', 
//         fields: 'app_id,preset_id,preset_data',
//         values: [[qq(packageJson.name), qq(preset), qq(JSON.stringify({manuf: rows}))]]
//     } : {
//         backend_point: AppContext.backend_point_update,
//         dest: 'cp3.perm_preset', 
//         set: {preset_data: qq(JSON.stringify({manuf: rows}))  },
//         where: {app_id: packageJson.name, preset_id: preset }
//     }

//     console.log(fetchParam)
//     const result = await fetchData(fetchParam)
//     return `Number of affected rows ${result||-1}`
// }
//
/*
const presetToRows = (presetData: any[]) => {
    if (presetData.length == 0)
        return []
    
    const obj = JSON.parse(presetData[0])
    console.log(obj)
    return []
}
*/
// const presetToSelected = (presetData: any[]) => {
//     if (presetData.length == 0)
//         return new Set<number>()
    
//     const obj = JSON.parse(presetData[0])
//     console.log(obj)
//     return new Set<number>() // TODO: !!!
// }

const ManufGridView: React.FC<IManufGridView> = ({
        // manufGridCols, 
        // setManufGridCols, 
        // manufGridRows, 
        // setManufGridRows, 
        // manufGridRowsSelected, 
        // setManufGridRowsSelected,
        // preset, -- see usePresetContext
        // setPreset,
     }) => {

    const { 
        manufGridRowsSelected, setManufGridRowsSelected,
        manufGridRows, setManufGridRows,
        // manufGridCols, setManufGridCols,
     } = usePresetContext();

    console.log('ManufGridView manufGridRowsSelected', Array.from(manufGridRowsSelected), manufGridRows)

    // const [presetSaveTo_old,setPresetSaveTo_old] = useState(preset)
    // useEffect(() => {
    //     console.log('ManufGridView useEffect')
    //     // setManufGridCols(gridColNames)
    // }, [])

    // useEffect(() => {
    //     // preset && init()
    // }, [preset])

    // useEffect(() => {
    //     // console.log('setManufGridRowsSelected reset')
    //     // setManufGridRowsSelected(new Set<number>())
    // }, [manufGridRows])

    // const init = async () => {
    //     console.log('ManufGridView init')
    //     // setManufGridCols(gridColNames)
    //     const presetData: any[] = await loadPreset(preset)
    //     if (presetData.length == 0)
    //         return

    //     const manufs = presetData[0].preset_data.manuf
    //     setManufGridRows(manufs)
    //     // setManufGridRowsSelected(presetToSelected(manufs))
    //     // setManufGridRowsSelected(new Set<number>())
    //     setPresetSaveTo_old(preset)
    // }

    const rowKeyGetter = (row: any) => { return row.key }
    
    const deleteItem = () => {
        const rows: any[] = manufGridRows.filter(row => !manufGridRowsSelected.has(row.key))
        setManufGridRows(rows)
        setManufGridRowsSelected(new Set<number>())
    }

    const nextKey = () => {
        const rows: number[] = manufGridRows.map(o => o.key)
        return Math.max(...rows, 0) + 1
    }

    const addItem = () => {
        setManufGridRows([ ...manufGridRows, {key: nextKey(), value: ''}]);    
    }

    const onRowsChange = (rows: any, data: any) => {
        console.log(rows, data)
        setManufGridRows(rows)
        setManufGridRowsSelected(new Set([]))
    }

    // const saveItems = async () => {
    //     const r = await postPreset(presetSaveTo_old, manufGridRows)
    //     console.log('r',r)
    // }

    return (
        <div>
            <button
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                title="Delete"
                onClick={deleteItem}
                >
                <img src="/src/assets/close.png" 
                alt="Delete" 
                style={{ width: '12px', height: '12px' }} 
                />
            </button>
            <button
                // onClick={() => closeTab(tab.index)}
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                title="Add"
                onClick={addItem}
            >
                <img src="/src/assets/plus.png" 
                alt="Add" 
                style={{ width: '12px', height: '12px' }} 
                />
            </button>
            {/* <div style={{width: '10px'}}/> */}
            {/* <button
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                title="Save Preset"
                onClick={saveItems}
            >Сохранить как</button>&nbsp;
            <InputString
                    size={5}
                    placeholder="preset ?"
                    value={presetSaveTo_old}
                    setValue={setPresetSaveTo_old}/> */}
            <Grid
                width="250px"
                height="400px"
                cols={cols}
                rows={manufGridRows}
                rowKeyGetter={rowKeyGetter}
                onRowsChange={onRowsChange}
                selectedRows={manufGridRowsSelected}
                onSelectedRowsChange={setManufGridRowsSelected}
            />
        </div>
    )
}

export default ManufGridView
