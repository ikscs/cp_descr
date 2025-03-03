import Grid from '../components/grid';
import { IGridColumn } from '../tools/gridtools';
import { usePresetContext } from '../contexts/PresetContext';
import Checkbox from '../components/checkbox';

interface IArticleGridView {
    // width: string
    // height: string
}

// https://www.flaticon.com/free-icons/close

const cols: IGridColumn[] = [
    { key: 'key', name: 'key', width: 40, },
    { key: 'value', name: 'article', width: 200, editable: true, },
]

const ArticleGridView: React.FC<IArticleGridView> = ({}) => {

    const { 
        articleGridRowsSelected, setArticleGridRowsSelected,
        articleGridRows, setArticleGridRows,
        articleInvert, setArticleInvert,
     } = usePresetContext();

    console.log('ArticleGridView articleGridRowsSelected', Array.from(articleGridRowsSelected), articleGridRows)

    const rowKeyGetter = (row: any) => { return row.key }
    
    const deleteItem = () => {
        const rows: any[] = articleGridRows.filter(row => !articleGridRowsSelected.has(row.key))
        setArticleGridRows(rows)
        setArticleGridRowsSelected(new Set<number>())
    }

    const nextKey = () => {
        const rows: number[] = articleGridRows.map(o => o.key)
        return Math.max(...rows, 0) + 1
    }

    const addItem = () => {
        setArticleGridRows([ ...articleGridRows, {key: nextKey(), value: ''}]);    
    }

    const onRowsChange = (rows: any, data: any) => {
        console.log(rows, data)
        setArticleGridRows(rows)
        setArticleGridRowsSelected(new Set([]))
    }

    return (
        <div> 
            <div className='flexbox-container'>
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
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                    title="Add"
                    onClick={addItem}
                >
                    <img src="/src/assets/plus.png" 
                    alt="Add" 
                    style={{ width: '12px', height: '12px' }} 
                    />
                </button>
                <div style={{width: '10px'}}/>
                <Checkbox
                    label='Инверсно'
                    checked={articleInvert}
                    onChange={(v) => {
                        setArticleInvert(v)
                    }}
                />
            </div>
            <Grid
                width="300px"
                height="400px"
                cols={cols}
                rows={articleGridRows}
                rowKeyGetter={rowKeyGetter}
                onRowsChange={onRowsChange}
                selectedRows={articleGridRowsSelected}
                onSelectedRowsChange={setArticleGridRowsSelected}
            />
        </div>
    )
}

export default ArticleGridView
