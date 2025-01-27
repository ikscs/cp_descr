import { escapeSingleQuotes, fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { IDescrFilter, } from '../types'

// interface IGridColumn {
//     key: string,
//     name: string,
//     width: number,
//     editable?: boolean,
// }

const gridCols = [
    { key: 'manuf', name: 'Manufacturer' },
    { key: 'article', name: 'Article' },
    { key: 'name', name: 'Internal Name' },
    { key: 'state_n_ua', name: 'n-ua', width: 50}, 
    { key: 'state_d_ua', name: 'd-ua', width: 50}, 
    { key: 'state_n_ru', name: 'n-ru', width: 50}, 
    { key: 'state_d_ru', name: 'd-ru', width: 50}, 
    { key: 'state_n_en', name: 'n-en', width: 50}, 
    { key: 'state_d_en', name: 'd-en', width: 50}, 

    { key: 'ivl_n_ua', name: 'i_n-ua', width: 60}, 
    { key: 'ivl_d_ua', name: 'i_d-ua', width: 60}, 
    { key: 'ivl_n_ru', name: 'i_n-ru', width: 60}, 
    { key: 'ivl_d_ru', name: 'i_d-ru', width: 60}, 
    { key: 'ivl_n_en', name: 'i_n-en', width: 60}, 
    { key: 'ivl_d_en', name: 'i_d-en', width: 60}, 

    { key: 'dl_n_ua', name: 'd_n-ua', width: 60}, 
    { key: 'dl_d_ua', name: 'd_d-ua', width: 60}, 
    { key: 'dl_n_ru', name: 'd_n-ru', width: 60}, 
    { key: 'dl_d_ru', name: 'd_d-ru', width: 60}, 
    { key: 'dl_n_en', name: 'd_n-en', width: 60}, 
    { key: 'dl_d_en', name: 'd_d-en', width: 60}, 

    { key: 'name_ua', name: 'Name (UA)' },
    { key: 'name_ru', name: 'Name (RU)' },
    { key: 'name_en', name: 'Name (EN)' },
    { key: 'description_ua', name: 'Description (UA)', width: 300, resizable: true },
    { key: 'description_ru', name: 'Description (RU)', width: 300, resizable: true },
    { key: 'description_en', name: 'Description (EN)', width: 300, resizable: true },
];

const getGridRows = async (manufFilter: string, descrFilter: IDescrFilter, gridLimit: number) => {
    const andManufFilter = manufFilter && `AND manuf ilike ''%${manufFilter}%''`
    const andDescrState = (descrFilter.descrState??-1) >= 0 ? `AND state=${descrFilter.descrState}` : ``
    const andDescrDescr = descrFilter.descrDescr ? `AND descr ilike ''%${descrFilter.descrDescr}%''` : ``
    const query = 
`
SELECT
	manuf,
	article,
	max(name) AS name,
	max(CASE WHEN lang='ua' AND descr_type='name'       THEN state ELSE NULL END) AS state_n_ua,
	max(CASE WHEN lang='ru' AND descr_type='name'       THEN state ELSE NULL END) AS state_n_ru,
	max(CASE WHEN lang='en' AND descr_type='name'       THEN state ELSE NULL END) AS state_n_en,
	max(CASE WHEN lang='ua' AND descr_type='description' THEN state ELSE NULL END) AS state_d_ua,
	max(CASE WHEN lang='ru' AND descr_type='description' THEN state ELSE NULL END) AS state_d_ru,
	max(CASE WHEN lang='en' AND descr_type='description' THEN state ELSE NULL END) AS state_d_en,

	max(CASE WHEN lang='ua' AND descr_type='name'       THEN descr ELSE NULL END) AS name_ua,
	max(CASE WHEN lang='ru' AND descr_type='name'       THEN descr ELSE NULL END) AS name_ru,
	max(CASE WHEN lang='en' AND descr_type='name'       THEN descr ELSE NULL END) AS name_en,
	max(CASE WHEN lang='ua' AND descr_type='description' THEN descr ELSE NULL END) AS description_ua,
	max(CASE WHEN lang='ru' AND descr_type='description' THEN descr ELSE NULL END) AS description_ru,
	max(CASE WHEN lang='en' AND descr_type='description' THEN descr ELSE NULL END) AS description_en,

	max(CASE WHEN lang='ua' AND descr_type='name'       THEN detect_lang ELSE NULL END) AS dl_n_ua,
	max(CASE WHEN lang='ru' AND descr_type='name'       THEN detect_lang ELSE NULL END) AS dl_n_ru,
	max(CASE WHEN lang='en' AND descr_type='name'       THEN detect_lang ELSE NULL END) AS dl_n_en,
	max(CASE WHEN lang='ua' AND descr_type='description' THEN detect_lang ELSE NULL END) AS dl_d_ua,
	max(CASE WHEN lang='ru' AND descr_type='description' THEN detect_lang ELSE NULL END) AS dl_d_ru,
	max(CASE WHEN lang='en' AND descr_type='description' THEN detect_lang ELSE NULL END) AS dl_d_en,

	max(CASE WHEN lang='ua' AND descr_type='name'       AND is_valid_lang THEN 1 ELSE NULL END) AS ivl_n_ua,
	max(CASE WHEN lang='ru' AND descr_type='name'       AND is_valid_lang THEN 1 ELSE NULL END) AS ivl_n_ru,
	max(CASE WHEN lang='en' AND descr_type='name'       AND is_valid_lang THEN 1 ELSE NULL END) AS ivl_n_en,
	max(CASE WHEN lang='ua' AND descr_type='description' AND is_valid_lang THEN 1 ELSE NULL END) AS ivl_d_ua,
	max(CASE WHEN lang='ru' AND descr_type='description' AND is_valid_lang THEN 1 ELSE NULL END) AS ivl_d_ru,
	max(CASE WHEN lang='en' AND descr_type='description' AND is_valid_lang THEN 1 ELSE NULL END) AS ivl_d_en
--    is_valid_lang,
--    detect_lang
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
JOIN cp3.vproduct_descr d USING (manuf,article)
WHERE product_exists 
	AND qtty > 0
    ${andManufFilter} 
    ${andDescrState} 
    ${andDescrDescr}
GROUP BY 1,2
${gridLimit && ('LIMIT ' + gridLimit)}
`
    const fetchParam = {
        backend_point: AppContext.backend_point_query,
        user: AppContext.userName,
        restore: ['temp_cp_group'],
        query: escapeSingleQuotes(query),
    }

    const data = await fetchData(fetchParam)
    if (data[0]) { // for DEBUG
        data[0].query = query
    }
    return data
}

export { gridCols, getGridRows, }
