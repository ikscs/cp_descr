import { fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { ILang, IDescrFilter, } from '../types'

const gridColNames = ['manuf', 'article', 'name', 'state_ua', 'state_ru', 'state_en']

const destTable = 'cp3.product_descr'

const getGridCols = () => {
    return gridColNames.map(col => ({key: col, name: col,  width: 200, }))
}

const getGridRows = async (manufFilter: string, descrFilter: IDescrFilter, gridLimit: number) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    const andDescrState = (descrFilter.descrState??-1) >= 0 ? `AND state=${descrFilter.descrState}` : ``
    const andDescrDescr = descrFilter.descrDescr ? `AND descr ilike ''%${descrFilter.descrDescr}%''` : ``
    const query = 
`
SELECT
	manuf,
	article,
	max(CASE WHEN lang = \'\'ua\'\' AND descr_type=\'\'name\'\' THEN descr ELSE NULL END) AS name,
	max(CASE lang WHEN \'\'ua\'\' THEN state ELSE NULL END) AS state_ua,
	max(CASE lang WHEN \'\'ru\'\' THEN state ELSE NULL END) AS state_ru,
	max(CASE lang WHEN \'\'en\'\' THEN state ELSE NULL END) AS state_en
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
JOIN cp3.product_descr d USING (manuf,article)
WHERE product_exists 
	AND qtty > 0
--	AND descr_type = \'\'${descrFilter.descrType}\'\' 
    ${andManufFilter} ${andDescrState} ${andDescrDescr}
GROUP BY 1,2
${gridLimit && ('LIMIT ' + gridLimit)}
`
    const fetchParam = {
        backend_point: AppContext.backend_point_query,
        user: AppContext.userName,
        restore: ['temp_cp_group'],
        query: query,
    }

    const data = await fetchData(fetchParam)
    if (data[0]) { // for DEBUG
        data[0].query = query
    }
    return data
}

const postGrid = async (rows: any, data: any, descrType: string) => {
    
    return -1

    if (data.indexes.length != 1) { // DEBUG
        alert('Unexpected multiple update')
    }

    const col = data.column.key
    const idx = data.indexes[0]
    const set = { descr: rows[idx][col] }
    const match = col.match(/descr_(\w+)/);
    const lang = match ? match[1] : 'nodata'
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

export { getGridCols, getGridRows, postGrid }
