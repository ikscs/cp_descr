import { escapeSingleQuotes, fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { IDescrFilter, IValueLabel, } from '../types'
// import BooleanFormatter from '../components/BooleanFormatter'

interface IGridColumn {
    key: string,
    name: string,
    width?: number | string,
    editable?: boolean,
	filterType?: string,
	filterOptions?: {value: any, label: string}[],
	resizable?: boolean,
}

const boolOptions: IValueLabel[] = [
	{value: -1, label: ''}, 
	{value: 0, label: 'False'}, 
	{value: 1, label: 'True'},
] 
console.log('boolOptions:', boolOptions)

const gridCols: IGridColumn[] = [
    { key: 'product_group', name: 'Group', width: 150, filterType: 'textbox' },
    { key: 'manuf', name: 'Manufacturer', width: 100, filterType: 'textbox' },
    { key: 'article', name: 'Article', width: 150, filterType: 'textbox'},
    { key: 'name', name: 'Internal Name', width: 200, filterType: 'textbox', },
    { key: 'state_name_ua', name: 'n-ua', width: 50, filterType: 'textbox', editable: true },
    { key: 'state_description_ua', name: 'd-ua', width: 50, filterType: 'textbox', editable: false },
    { key: 'state_name_ru', name: 'n-ru', width: 50, filterType: 'textbox', editable: false },
    { key: 'state_description_ru', name: 'd-ru', width: 50, filterType: 'textbox', editable: false },
    { key: 'state_name_en', name: 'n-en', width: 50, filterType: 'textbox', editable: false },
    { key: 'state_description_en', name: 'd-en', width: 50, filterType: 'textbox', editable: false },

    { key: 'ivl_name_ua', name: 'i_n-ua', width: 60, filterType: 'textbox', },
    { key: 'ivl_description_ua', name: 'i_d-ua', width: 60, filterType: 'textbox' }, 
    { key: 'ivl_name_ru', name: 'i_n-ru', width: 60, filterType: 'textbox' },
    { key: 'ivl_description_ru', name: 'i_d-ru', width: 60, filterType: 'textbox' }, 
    { key: 'ivl_name_en', name: 'i_n-en', width: 60, filterType: 'textbox' },
    { key: 'ivl_description_en', name: 'i_d-en', width: 60, filterType: 'textbox' },

    { key: 'dl_name_ua', name: 'd_n-ua', width: 60, filterType: 'textbox' },
    { key: 'dl_description_ua', name: 'd_d-ua', width: 60, filterType: 'textbox' },
    { key: 'dl_name_ru', name: 'd_n-ru', width: 60, filterType: 'textbox' },
    { key: 'dl_description_ru', name: 'd_d-ru', width: 60, filterType: 'textbox' },
    { key: 'dl_name_en', name: 'd_n-en', width: 60, filterType: 'textbox' },
    { key: 'dl_description_en', name: 'd_d-en', width: 60, filterType: 'textbox' },

    { key: 'descr_name_ua', name: 'Name (UA)', filterType: 'textbox', editable: false },
    { key: 'descr_name_ru', name: 'Name (RU)', filterType: 'textbox', editable: false },
    { key: 'descr_name_en', name: 'Name (EN)', filterType: 'textbox', editable: false },
    { key: 'descr_description_ua', name: 'Description (UA)', width: 300, resizable: true, filterType: 'textbox', editable: false },
    { key: 'descr_description_ru', name: 'Description (RU)', width: 300, resizable: true, filterType: 'textbox', editable: false },
    { key: 'descr_description_en', name: 'Description (EN)', width: 300, resizable: true, filterType: 'textbox', editable: false },
];

const getGridRows = async (manufFilter: string, descrFilter: IDescrFilter, gridLimit: number, isValidLangFilter: boolean, isValidDetectFilter: boolean) => {
    const andManufFilter = manufFilter && `AND manuf ilike '%${manufFilter}%'`
    
	const andDescrState = (descrFilter.descrState??-1) >= 0 ? 
`AND EXISTS (SELECT 1 FROM cp3.product_descr d 
WHERE p.manuf = d.manuf 
AND p.article = d.article 
AND d.state=${descrFilter.descrState})` : ``

    const andDescrDescr = descrFilter.descrDescr ? 
`AND EXISTS (SELECT 1 FROM cp3.product_descr d 
WHERE p.manuf = d.manuf 
AND p.article = d.article 
AND d.descr ilike '%${descrFilter.descrDescr}%')` : ``

    const andIsValidLang = isValidLangFilter ? 
`AND EXISTS (SELECT 1 FROM cp3.product_descr d 
WHERE p.manuf = d.manuf 
AND p.article = d.article 
AND NOT translate.is_valid_lang(d.descr, d.lang))` : ``

    const andIsValidDetected = isValidDetectFilter ? 
`AND EXISTS (SELECT 1 FROM cp3.product_descr d 
WHERE p.manuf = d.manuf 
AND p.article = d.article 
AND translate.detect_lang(d.descr) <> d.lang)` : ``

	const query = 
`SELECT
	p.subject_role,
	p.subject_id,
	p.product_group,
	p.manuf,
	p.article,
	p.name,
	
	n_ua.state AS state_name_ua,
	n_ua.descr AS descr_name_ua,
	case when translate.is_valid_lang(n_ua.descr, n_ua.lang) then 1 else 0 end AS ivl_name_ua,
	case when n_ua.descr IS NULL then NULL else translate.detect_lang(n_ua.descr) end AS dl_name_ua,
	d_ua.state AS state_description_ua,
	d_ua.descr AS descr_description_ua,
	case when translate.is_valid_lang(d_ua.descr, d_ua.lang) then 1 else 0 end AS ivl_description_ua,
	case when d_ua.descr IS NULL then NULL else translate.detect_lang(d_ua.descr) end AS dl_description_ua,

	n_ru.state AS state_name_ru,
	n_ru.descr AS descr_name_ru,
	case when translate.is_valid_lang(n_ru.descr, n_ru.lang) then 1 else 0 end AS ivl_name_ru,
	case when n_ru.descr IS NULL then NULL else translate.detect_lang(n_ru.descr) end AS dl_name_ru,
	d_ru.state AS state_description_ru,
	d_ru.descr AS descr_description_ru,
	case when translate.is_valid_lang(d_ru.descr, d_ru.lang) then 1 else 0 end AS ivl_description_ru,
	case when d_ru.descr IS NULL then NULL else translate.detect_lang(d_ru.descr) end AS dl_description_ru,
	
	n_en.state AS state_name_en,
	n_en.descr AS descr_name_en,
	case when translate.is_valid_lang(n_en.descr, n_en.lang) then 1 else 0 end AS ivl_name_en,
	case when n_en.descr IS NULL then NULL else translate.detect_lang(n_en.descr) end AS dl_name_en,
	d_en.state AS state_description_en,
	d_en.descr AS descr_description_en,
	case when translate.is_valid_lang(d_en.descr, d_en.lang) then 1 else 0 end AS ivl_description_en,
	case when d_en.descr IS NULL then NULL else translate.detect_lang(d_en.descr) end AS dl_description_en,
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

export { gridCols, getGridRows };
export type { IGridColumn };

