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
    filterOptions?: { value: any, label: string }[],
    resizable?: boolean,
    options?: IValueLabel[],
    dataSource?: string,
}

const gridColNames: IGridColumn[] = [
    { key: 'group', name: 'Group', width: 150, filterType: 'select' },
    { key: 'manuf', name: 'Manufacturer', width: 200, filterType: 'select', },
    { key: 'article', name: 'Article', width: 200, filterType: 'textbox', },
    { key: 'name', name: 'Name', width: 400, filterType: 'textbox', editable: true, },
    { key: 'price_buy', name: 'price_buy', width: 100, filterType: 'textbox', },
    { key: 'price_sell', name: 'price_sell', width: 100, filterType: 'textbox', },
    { key: 'qtty', name: 'Quantity', width: 50, filterType: 'textbox', },
    { key: 'product_exists', name: 'product_exists', width: 20, filterType: 'textbox', },
    { key: 'subject_role', name: 'subject_role', width: 20, filterType: 'textbox', },
    { key: 'subject_id', name: 'subject_id', width: 100, filterType: 'select', },
    { key: 'manuf_org', name: 'manuf_org', width: 200, filterType: 'select', },
    { key: 'article_org', name: 'article_org', width: 200, filterType: 'textbox', },
    { key: 'product_group', name: 'product_group', width: 150, filterType: 'select' },
    { key: 'subject_role_org', name: 'subject_role_org', width: 200, filterType: 'textbox', },
    { key: 'subject_id_org', name: 'subject_id_org', width: 200, filterType: 'textbox', },
    { key: 'product_id_org', name: 'product_id_org', width: 200, filterType: 'textbox', },
    { key: 'date1', name: 'date1', width: 150, filterType: 'textbox', },
]

const getGridCols = () => {
    return gridColNames;
}

const makeInList = (field: string, list: string[]) => {
    return list.length == 0 ? '' : `AND ${field} IN (${list.map(e => '\'\'' + e + '\'\'').join(',')})`
}

const makeLikeList = (field: string, list: string[], invertFlag: boolean) => {
    if (list.length == 0)
        return ''
    if (invertFlag) {
        const ll = list.map(item => `${field} not ilike '\'\%${item}%\'\'`)
        return `AND (${ll.join(' AND ')})`

    } else {
        const ll = list.map(item => `${field} ilike '\'\%${item}%\'\'`)
        return `AND (${ll.join(' OR ')})`
    }
}

const snot = (notFlag: boolean) => notFlag ? ' not ' : ''

const makeOrList = (field: string, list: any[]) => {
    const lf = list.filter(item => !item.andFlag)
    if (lf.length == 0)
        return ''

    const ll = lf.map(item => `${field} ${snot(item.notFlag)} ilike '\'\%${item.value}%\'\'`)
    return `AND (${ll.join(' OR ')})`
}

const makeAndList = (field: string, list: any[]) => {
    const lf = list.filter(item => item.andFlag)
    if (lf.length == 0)
        return ''

    const ll = lf.map(item => `${field} ${snot(item.notFlag)} ilike '\'\%${item.value}%\'\'`)
    return `AND (${ll.join(' AND ')})`
}

export interface IFlaggedValue {
    value: string,
    andFlag: boolean,
    notFlag: boolean,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getGridRows = async (withoutTree: boolean,
    subrFilter: number,
    manufFilter: string,
    articleFilter: string,
    gridLimit?: number,
    manufs?: string[],
    articles?: IFlaggedValue[],
    _articleInvert?: boolean,
    names?: string[],
    dataSource?: string,
    presetQuery?: string,
) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    // const andArticleFilter = articleFilter && `AND article ilike ''%${articleFilter}%''`
    const andArticleFilter = articleFilter && `AND (article ilike ''%${articleFilter}%'' OR name ilike ''%${articleFilter}%'' )`
    const subject_role_org = dataSource == 'cp3.ikscs' ? 'subject_role_org' : 'null AS subject_role_org'
    const subject_id_org = dataSource == 'cp3.ikscs' ? 'subject_id_org' : 'null AS subject_id_org'
    const product_id_org = dataSource == 'cp3.ikscs' ? 'product_id_org' : 'null AS product_id_org'
    const date1 = dataSource !== 'cp3.vcp_product_org_rated' ? 'date AS date1' : 'null AS date1'
    console.log('presetQuery', presetQuery)
    const query = doubleq(presetQuery ?? '') ||
        // const query = 
        `
SELECT
	subject_role,
	subject_id,
 	product_group,
 	COALESCE(group_name,product_group) AS group,
 	product_id,
	manuf_org,
	article_org,
	manuf,
	article,
	name,
	price_sell,
	price_buy,
	qtty,
	${dataSource == 'cp3.vcp_product_org' ? 'product_exists' : 'true AS product_exists'},
	${subject_role_org},
	${subject_id_org},
	${product_id_org},
    ${date1}
FROM ${dataSource || 'cp3.vcp_product_org'} s
${withoutTree ? '' : 'JOIN temp_cp_group USING (subject_role, subject_id, product_group)'}
WHERE 
     ${dataSource == 'cp3.vcp_product_org' ? 'product_exists' : 'true'}
	AND qtty > 0
    ${withoutTree ? 'AND subject_role =' + subrFilter : ''}
    ${andManufFilter}
    ${andArticleFilter}
    ${makeInList('manuf', manufs ?? [])}
    ${makeOrList('article', articles ?? [])}
    ${makeAndList('article', articles ?? [])}
    ${makeLikeList('name', names ?? [], false)}
${gridLimit && ('LIMIT ' + gridLimit)}
`
    //     ${makeLikeList('article', articles??[], articleInvert??false)}

    console.log('query', query)

    const fetchParam = {
        backend_point: AppContext.backend_point_query,
        user: AppContext.userName,
        restore: ['temp_cp_group'],
        query: query,
    }

    const data = await fetchData(fetchParam)
    data.query = deqq(query)
    return data
}

// const postGrid = async (rows: any, data: any, descrType: string) => {

const toExcel = async (cols: any, rows: any) => {
    console.log('toExcel', rows)

    const exportCols = cols.map((col: any) => {
        return { value: col.name, fontWeight: 'bold' }
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

const productFind = async (manuf: string, manufacturer_code: string): Promise<{
    ok: boolean,
    schema?: string,
    category_id?: string,
    product_id?: string,
}> => {
    const result = await productFindFrom('ikscs.v_product', manuf, manufacturer_code)
    return result.ok ? result :
        await productFindFrom('mc.v_product', manuf, manufacturer_code)
}

const productFindFrom = async (from: string, manuf: string, manufacturer_code: string): Promise<{
    ok: boolean,
    schema?: string,
    category_id?: string,
    product_id?: string,
}> => {
    const data = await fetchData({
        from,
        fields: 'category_id,product_id',
        where: { manuf, manufacturer_code },
    })
    if (data.length > 0) {
        return {
            ok: true,
            schema: from.split('.')[0],
            category_id: data[0].category_id,
            product_id: data[0].product_id,
        }
    } else {
        return { ok: false }
    }
}

const deqq = (query: string) => {
    return query.replace(/''/g, "'")
}

// const qq = (s: string) => `''${s}''`

const doubleq = (query: string) => {
    return query.replace(/'/g, "''")
}

export { getGridCols, getGridRows, toExcel, productFind, }
