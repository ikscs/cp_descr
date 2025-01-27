import { escapeSingleQuotes, fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { IDescrFilter, } from '../types'
import BooleanFormatter from '../components/BooleanFormatter'


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

    // { key: 'ivl_n_ua', name: 'i_n-ua', width: 60, formatter: (props: any) => BooleanFormatter ({...props})  }, 
    { key: 'ivl_n_ua', name: 'i_n-ua', width: 60, formatter: (props: any) => <BooleanFormatter {...props} /> }, 
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

    { key: 'descr_n_ua', name: 'Name (UA)' },
    { key: 'descr_n_ru', name: 'Name (RU)' },
    { key: 'descr_n_en', name: 'Name (EN)' },
    { key: 'descr_d_ua', name: 'Description (UA)', width: 300, resizable: true },
    { key: 'descr_d_ru', name: 'Description (RU)', width: 300, resizable: true },
    { key: 'descr_d_en', name: 'Description (EN)', width: 300, resizable: true },
];

const getGridRows = async (manufFilter: string, descrFilter: IDescrFilter, gridLimit: number, isValidLangFilter: boolean, isValidDetectFilter: boolean) => {
    const andManufFilter = manufFilter && `AND manuf ilike '%${manufFilter}%'`
    const andDescrState = (descrFilter.descrState??-1) >= 0 ? `AND state=${descrFilter.descrState}` : ``
    const andDescrDescr = descrFilter.descrDescr ? `AND descr ilike '%${descrFilter.descrDescr}%'` : ``
    const andIsValidLang = isValidLangFilter ? `AND NOT is_valid_lang` : ``
    const andIsValidDetected = isValidDetectFilter ? `AND detect_lang <> lang` : ``
    /*const query_ = 
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
FROM cp3.vcp_product_org 
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
JOIN cp3.vproduct_descr d USING (manuf,article)
WHERE product_exists 
	AND qtty > 0
    ${andManufFilter} 
    ${andDescrState} 
    ${andDescrDescr}
    ${andIsValidLang}
    ${andIsValidDetected}
GROUP BY 1,2
${gridLimit && ('LIMIT ' + gridLimit)}
`
    console.log('query_:', query_)

    const query = 
`SELECT * 
FROM cp3.vproduct_descr_wide
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
WHERE 1=1
${andManufFilter} 
${andDescrState} 
${andDescrDescr}
${andIsValidLang}
${andIsValidDetected}
${gridLimit && ('LIMIT ' + gridLimit)}
`
*/
    const query = 
`SELECT
	p.subject_role,
	p.subject_id,
	p.product_group,
	p.manuf,
	p.article,
	p.name,
	
	n_ua.state AS state_n_ua,
	n_ua.descr AS descr_n_ua,
	case when translate.is_valid_lang(n_ua.descr, n_ua.lang) then 1 else 0 end AS ivl_n_ua,
	case when n_ua.descr IS NULL then NULL else translate.detect_lang(n_ua.descr) end AS dl_n_ua,
	d_ua.state AS state_d_ua,
	d_ua.descr AS descr_d_ua,
	case when translate.is_valid_lang(d_ua.descr, d_ua.lang) then 1 else 0 end AS ivl_d_ua,
	case when d_ua.descr IS NULL then NULL else translate.detect_lang(d_ua.descr) end AS dl_d_ua,

	n_ru.state AS state_n_ru,
	n_ru.descr AS descr_n_ru,
	case when translate.is_valid_lang(n_ru.descr, n_ru.lang) then 1 else 0 end AS ivl_n_ru,
	case when n_ru.descr IS NULL then NULL else translate.detect_lang(n_ru.descr) end AS dl_n_ru,
	d_ru.state AS state_d_ru,
	d_ru.descr AS descr_d_ru,
	case when translate.is_valid_lang(d_ru.descr, d_ru.lang) then 1 else 0 end AS ivl_d_ru,
	case when d_ru.descr IS NULL then NULL else translate.detect_lang(d_ru.descr) end AS dl_d_ru,
	
	n_en.state AS state_n_en,
	n_en.descr AS descr_n_en,
	case when translate.is_valid_lang(n_en.descr, n_en.lang) then 1 else 0 end AS ivl_n_en,
	case when n_en.descr IS NULL then NULL else translate.detect_lang(n_en.descr) end AS dl_n_en,
	d_en.state AS state_d_en,
	d_en.descr AS descr_d_en,
	case when translate.is_valid_lang(d_en.descr, d_en.lang) then 1 else 0 end AS ivl_d_en,
	case when d_en.descr IS NULL then NULL else translate.detect_lang(d_en.descr) end AS dl_d_en,
	1
FROM cp3.vcp_product_org p
JOIN temp_cp_group USING (subject_role, subject_id, product_group)
LEFT JOIN cp3.product_descr n_ua ON p.manuf = n_ua.manuf AND p.article = n_ua.article AND n_ua.lang='ua' AND n_ua.descr_type='name'
LEFT JOIN cp3.product_descr d_ua ON p.manuf = d_ua.manuf AND p.article = d_ua.article AND d_ua.lang='ua' AND d_ua.descr_type='description'
LEFT JOIN cp3.product_descr n_ru ON p.manuf = n_ru.manuf AND p.article = n_ru.article AND n_ru.lang='ru' AND n_ru.descr_type='name'
LEFT JOIN cp3.product_descr d_ru ON p.manuf = d_ru.manuf AND p.article = d_ru.article AND d_ru.lang='ru' AND d_ru.descr_type='description'
LEFT JOIN cp3.product_descr n_en ON p.manuf = n_en.manuf AND p.article = n_en.article AND n_en.lang='en' AND n_en.descr_type='name'
LEFT JOIN cp3.product_descr d_en ON p.manuf = d_en.manuf AND p.article = d_en.article AND d_en.lang='en' AND d_en.descr_type='description'
WHERE product_exists 
${andManufFilter} 
${andDescrState} 
${andDescrDescr}
${andIsValidLang}
${andIsValidDetected}
${gridLimit && ('LIMIT ' + gridLimit)}`
    const fetchParam = {
        backend_point: AppContext.backend_point_query,
        user: AppContext.userName,
        restore: ['temp_cp_group'],
        query: escapeSingleQuotes(query),
    }

    const data = await fetchData(fetchParam)
    data.query = query
    return data
}

export { gridCols, getGridRows, }
