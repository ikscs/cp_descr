import { fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { ILang, IDescrFilter, } from '../types'

// 'qtty', 'price_sell', 
const cols = ['manuf', 'article', 'descr_ua', 'descr_ru', 'descr_en', 'max_state', 'min_state',]

const destTable = 'cp3.product_descr'

const removeLangCols = function(cols: string[], lang: ILang) {
    return cols.filter((col) => {
        if(col.includes('ua')) return lang.ua
        if(col.includes('en')) return lang.en
        if(col.includes('ru')) return lang.ru
        return true
    })
}

const getGridCols = (lang: ILang) => {
    // todo: mark 'lang' columns as editable
    return removeLangCols(cols, lang).map(col => ({key: col, name: col, }))
}

const getGridRows = async (manufFilter: string, descrFilter: IDescrFilter, gridLimit: number, lang: ILang) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    const andDescrState = (descrFilter.descrState??-1) >= 0 ? `AND state=${descrFilter.descrState}` : ``
    const andDescrDescr = descrFilter.descrDescr ? `AND descr ilike ''%${descrFilter.descrDescr}%''` : ``
    const query = 
`
SELECT
	manuf,
	article,
	${lang.ua ? 'max(CASE lang WHEN \'\'ua\'\' THEN descr ELSE NULL END) AS descr_ua,' : ''}
	${lang.ru ? 'max(CASE lang WHEN \'\'ru\'\' THEN descr ELSE NULL END) AS descr_ru,' : ''}
	${lang.en ? 'max(CASE lang WHEN \'\'en\'\' THEN descr ELSE NULL END) AS descr_en,' : ''}
	max(state) AS max_state,
	min(state) AS min_state
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
JOIN cp3.product_descr d USING (manuf,article)
WHERE product_exists 
	AND qtty > 0
	AND descr_type = \'\'${descrFilter.descrType}\'\' ${andManufFilter} ${andDescrState} ${andDescrDescr}
GROUP BY 1,2
${gridLimit && ('LIMIT ' + gridLimit)}
`
// `
// SELECT DISTINCT ${removeLangCols(cols, lang).join(',')}
// FROM cp3.vcp_product_org JOIN temp_cp_group USING (subject_role, subject_id, product_group)
// WHERE product_exists AND qtty > 0 ${andManufFilter} ${andDescrState}
// ${gridLimit ? 'LIMIT ' + gridLimit : '' }
// `
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

const postGrid = async (rows: any, data: any, descrType: string) => {
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

/**
SELECT
	manuf,
	article,
	max(CASE lang WHEN 'ua' THEN descr ELSE '' END) AS descr_ua, 
	max(CASE lang WHEN 'ru' THEN descr ELSE '' END) AS descr_ru,
	max(CASE lang WHEN 'en' THEN descr ELSE '' END) AS descr_en,
	max(state) AS max_state,
	min(state) AS min_state
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
JOIN product_descr d USING (manuf,article)
WHERE product_exists 
	AND qtty > 0
	AND descr_type = 'name'
-- 	AND descr_type = 'description'
GROUP BY 1,2
*/