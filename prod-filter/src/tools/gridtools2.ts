import writeXlsxFile from "write-excel-file"
import { fetchData } from "../api/fetchData"
import AppContext from "../contexts/AppContext"

interface IGridColumn {
    key: string,
    name: string,
    width?: number | string,
    editable?: boolean,
	filterType?: string,
	filterOptions?: {value: any, label: string}[],
	resizable?: boolean,
}

const gridColNames: IGridColumn[] = [
    { key: 'group', name: 'Group', width: 150, filterType: 'textbox' },
    { key: 'manuf_org', name: 'Manufacturer', width: 200, filterType: 'textbox', },
    { key: 'article_org', name: 'Article', width: 200, filterType: 'textbox', },
    { key: 'name', name: 'Internal Name', width: 200, filterType: 'textbox', },
    { key: 'price_sell', name: 'price_sell', width: 100, filterType: 'textbox', },
    { key: 'price_buy', name: 'price_buy', width: 100, filterType: 'textbox', },
    { key: 'qtty', name: 'Quantity', width: 50, filterType: 'textbox', },
    { key: 'product_exists', name: 'product_exists', width: 20, filterType: 'textbox', },
]

const getGridCols = () => {
    return gridColNames;
}

const getGridRows = async (manufFilter: string, gridLimit?: number) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    const query = 
`
SELECT
    COALESCE(group_name,product_group) AS group,
    product_id,
	manuf_org,
	article_org,
	name,
    price_sell,
    price_buy,
    product_exists
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
WHERE product_exists 
	AND qtty > 0
    ${andManufFilter} 
${gridLimit && ('LIMIT ' + gridLimit)}
`
    const fetchParam = {
        backend_point: AppContext.backend_point_query,
        user: AppContext.userName,
        restore: ['temp_cp_group'],
        query: query,
    }

    const data = await fetchData(fetchParam)
    data.query = query
    return data
}

// const postGrid = async (rows: any, data: any, descrType: string) => {

const toExcel = async (cols: any, rows: any) => {
    console.log('toExcel', rows)

    const exportCols = cols.map((col: any) => {
        return {value: col.name, fontWeight: 'bold'}
    })

    const exportRows = rows.map((row: any) => {
        const exportRow: any[] = []
        cols.map((col: any) => {
            exportRow.push({ value: row[col.key] })
        })
        return exportRow
    })
    exportRows.unshift(exportCols)

    try {
        const xlsxBlob = await writeXlsxFile(exportRows, {
            // schema: columnsDefinition,
            // https://gitlab.com/catamphetamine/write-excel-file#browser
            // when no fileName is given results in blob
            fileName: `temp_data.xlsx`,
        });
        console.log("xlsxBlob", xlsxBlob);
    } catch (error) {
        console.log(error);
    }
}

export { getGridCols, getGridRows, toExcel, }
