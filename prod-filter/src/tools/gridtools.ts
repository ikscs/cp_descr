import writeXlsxFile from "write-excel-file"
import { fetchData } from "../api/fetchData"
import AppContext from "../contexts/AppContext"

export interface IValueLabel {
    value: Object,
    label: string,
}

export interface IGridColumn {
    key: string,
    name: string,
    width?: number | string,
    editable?: boolean,
	filterType?: string,
	filterOptions?: {value: any, label: string}[],
	resizable?: boolean,
    options?: IValueLabel[],
}

const gridColNames: IGridColumn[] = [
    { key: 'group', name: 'Group', width: 150, filterType: 'select' },
    { key: 'manuf_org', name: 'Manufacturer', width: 200, filterType: 'select', },
    { key: 'article_org', name: 'Article', width: 200, filterType: 'textbox', },
    { key: 'name', name: 'Name', width: 200, filterType: 'textbox', },
    { key: 'price_buy', name: 'price_buy', width: 100, filterType: 'textbox', },
    { key: 'price_sell', name: 'price_sell', width: 100, filterType: 'textbox', },
    { key: 'qtty', name: 'Quantity', width: 50, filterType: 'textbox', },
    { key: 'product_exists', name: 'product_exists', width: 20, filterType: 'textbox', },
    { key: 'subject_role', name: 'subject_role', width: 20, filterType: 'textbox', },
    { key: 'subject_id', name: 'subject_id', width: 100, filterType: 'select', },
]

const getGridCols = () => {
    return gridColNames;
}

const makeInList = (field: string, list: string[]) => {
    return list.length == 0 ? '' : `AND ${field} IN (${list.map(e => '\'\'' + e + '\'\'').join(',')})`
}

const makeLikeList = (field: string, list: string[]) => {
    if (list.length == 0)
        return ''

    const ll = list.map(item => `${field} ilike '\'\%${item}%\'\'`)
    return `AND (${ll.join(' OR ') })`
}

const getGridRows = async (withoutTree: boolean, 
    subrFilter: number, 
    manufFilter: string, 
    articleFilter: string, 
    gridLimit?: number, 
    manufs?: string[],
    names?: string[],
) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    const andArticleFilter = articleFilter && `AND article ilike ''%${articleFilter}%''`
    const query = 
`
SELECT
    subject_role,
    subject_id,
    COALESCE(group_name,product_group) AS group,
    product_id,
	manuf_org,
	article_org,
	name,
    price_sell,
    price_buy,
    product_exists
FROM cp3.vcp_product_org
${withoutTree ? '' : 'JOIN temp_cp_group USING (subject_role, subject_id, product_group)'}
WHERE product_exists 
	AND qtty > 0
    ${withoutTree ? 'AND subject_role ='+ subrFilter : ''}
    ${andManufFilter}
    ${andArticleFilter}
    ${makeInList('manuf', manufs??[])}
    ${makeLikeList('name', names??[])}
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
