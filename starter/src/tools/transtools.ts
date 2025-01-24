import { escapeSingleQuotes, fetchData } from "../api/fetchData";
import AppContext from "../AppContext";
import { IValueLabel } from "../types";
import { EType } from "./descrtools";

const transOptions: IValueLabel[] = [
    {value: 'ua-ru', label: 'ua -> ru'},
    {value: 'ua-en', label: 'ua -> en'},
    {value: 'en-ru', label: 'en -> ru'},
    {value: 'en-ua', label: 'en -> ua'},
    {value: 'ru-en', label: 'ru -> en'},
    {value: 'ru-ua', label: 'ru -> ua'},
]
const transExec1 = async (row: any, transDir: string, type: EType) => {
    const [from,to] = transDir.split('-')
    const [manuf,article] = row.split('/')
    console.log('manuf,article',manuf,article)
    const query =
`INSERT INTO cp3.product_descr(manuf, article, descr_type, lang, state,descr)
SELECT manuf, article, descr_type, '${to}', 2, translate.trans(descr,'${from}','${to}')
FROM  cp3.product_descr
WHERE manuf='${manuf}'
AND article='${article}'
AND descr_type='${type}'
AND lang='${from}'
ON CONFLICT(manuf,article,descr_type,lang) DO UPDATE SET 
  descr = EXCLUDED.descr,
  state = EXCLUDED.state
`
    const fetchParam = {
        backend_point: AppContext.backend_point_query,
        query: escapeSingleQuotes(query),
    }
    console.log(fetchParam)
    const result = await fetchData(fetchParam)    
    console.log('transExec result',result)
}

const transExec = async (rows: any, transDir: string, type: EType) => {
    rows.forEach((item: string) => { transExec1(item, transDir, type) })
}

export { transOptions, transExec }