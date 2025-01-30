import writeXlsxFile from "write-excel-file"
import { fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { IDescrFilter, } from '../types'

interface IGridColumn {
    key: string,
    name: string,
    width: number,
    editable?: boolean,
}

const gridColNames: IGridColumn[] = [
    { key: 'product_group', name: 'Group', width: 100}, 
    { key: 'manuf', name: 'Manufacturer', width: 100}, 
    { key: 'article', name: 'Article', width: 100}, 
    { key: 'name', name: 'Name', width: 200}, 
    { key: 'state_name_ua',        name: 'n-ua', width: 50, editable: true}, 
    { key: 'state_description_ua', name: 'd-ua', width: 50, editable: true},
    { key: 'state_name_ru',        name: 'n-ru', width: 50, editable: true},
    { key: 'state_description_ru', name: 'd-ru', width: 50, editable: true},
    { key: 'state_name_en',        name: 'n-en', width: 50, editable: true},
    { key: 'state_description_en', name: 'd-en', width: 50, editable: true},
]

const getGridCols = () => {
    return gridColNames;
}

const destTable = 'cp3.product_descr'

const getGridRows = async (manufFilter: string, descrFilter: IDescrFilter, gridLimit: number) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    const andDescrState = (descrFilter.descrState??-1) >= 0 ? `AND state=${descrFilter.descrState}` : ``
    const andDescrDescr = descrFilter.descrDescr ? `AND descr ilike ''%${descrFilter.descrDescr}%''` : ``
    const query = 
`
SELECT
    product_group,
	manuf,
	article,
	max(name) AS name,
	max(CASE WHEN lang=\'\'ua\'\' AND descr_type=\'\'name\'\'        THEN state ELSE NULL END) AS state_name_ua,
	max(CASE WHEN lang=\'\'ua\'\' AND descr_type=\'\'description\'\' THEN state ELSE NULL END) AS state_description_ua,
	max(CASE WHEN lang=\'\'ru\'\' AND descr_type=\'\'name\'\'        THEN state ELSE NULL END) AS state_name_ru,
	max(CASE WHEN lang=\'\'ru\'\' AND descr_type=\'\'description\'\' THEN state ELSE NULL END) AS state_description_ru,
	max(CASE WHEN lang=\'\'en\'\' AND descr_type=\'\'name\'\'        THEN state ELSE NULL END) AS state_name_en,
	max(CASE WHEN lang=\'\'en\'\' AND descr_type=\'\'description\'\' THEN state ELSE NULL END) AS state_description_en
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
JOIN cp3.product_descr d USING (manuf,article)
WHERE product_exists 
	AND qtty > 0
--	AND descr_type = \'\'${descrFilter.descrType}\'\' 
    ${andManufFilter} 
    ${andDescrState} 
    ${andDescrDescr}
GROUP BY 1,2,3
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
const postGrid = async (rows: any, data: any) => {
    
    // return -1

    if (data.indexes.length != 1) { // DEBUG
        alert('Unexpected multiple update')
    }

    const col = data.column.key
    const idx = data.indexes[0]
    // update descr 
    // const set = { descr: rows[idx][col] }
    // const match = col.match(/descr_(\w+)/);
    // const lang = match ? match[1] : 'nodata'

    // state_description_ua
    const[field, descrType, lang] = col.split('_')
    const set:any = {}
    set[field] = rows[idx][col]
    const where = {
        manuf: rows[idx].manuf,
        article: rows[idx].article,
        descr_type: descrType,
        lang: lang,
    }

    const fetchParam = {
        backend_point: AppContext.backend_point_update,
        dest: destTable, 
        set: set,
        where: where,
    }
    console.log(fetchParam)

    // return 0
   const result = await fetchData(fetchParam)
   return `Number of affected rows ${result||-1}`
}

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

export { getGridCols, getGridRows, postGrid, toExcel, }
