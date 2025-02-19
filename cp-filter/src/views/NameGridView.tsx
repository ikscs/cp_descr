import Grid from '../components/grid';
import { IGridColumn } from '../tools/gridtools';
import { usePresetContext } from '../contexts/PresetContext';

interface INameGridView {
    // width: string
    // height: string
}

// https://www.flaticon.com/free-icons/close

const cols: IGridColumn[] = [
    { key: 'key', name: 'key', width: 40, },
    { key: 'value', name: 'name', width: 200, editable: true, },
]

const NameGridView: React.FC<INameGridView> = ({}) => {

    const { 
        nameGridRowsSelected, setNameGridRowsSelected,
        nameGridRows, setNameGridRows,
     } = usePresetContext();

    console.log('NameGridView nameGridRowsSelected', Array.from(nameGridRowsSelected), nameGridRows)

    const rowKeyGetter = (row: any) => { return row.key }
    
    const deleteItem = () => {
        const rows: any[] = nameGridRows.filter(row => !nameGridRowsSelected.has(row.key))
        setNameGridRows(rows)
        setNameGridRowsSelected(new Set<number>())
    }

    const nextKey = () => {
        const rows: number[] = nameGridRows.map(o => o.key)
        return Math.max(...rows, 0) + 1
    }

    const addItem = () => {
        setNameGridRows([ ...nameGridRows, {key: nextKey(), value: ''}]);    
    }

    const onRowsChange = (rows: any, data: any) => {
        console.log(rows, data)
        setNameGridRows(rows)
        setNameGridRowsSelected(new Set([]))
    }

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
            <Grid
                width="300px"
                height="400px"
                cols={cols}
                rows={nameGridRows}
                rowKeyGetter={rowKeyGetter}
                onRowsChange={onRowsChange}
                selectedRows={nameGridRowsSelected}
                onSelectedRowsChange={setNameGridRowsSelected}
            />
        </div>
    )
}

export default NameGridView
