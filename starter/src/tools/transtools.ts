import { fetchData } from "../api/fetchData";
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

const transExec = async (rows: any, transDir: string, type: EType) => {
    const [from,to] = transDir.split('-')
    rows.forEach((item: string) => {
        const [manuf,article] = item.split(' / ')
        console.log('manuf,article',manuf,article)
        const query =
`INSERT INTO cp3.descr(manuf,article,descr_type,lang,state,descr)
SELECT manuf,article,descr_type,\'\'${to}\'\',translate,2,trans(src.descr,${from},${to})
FROM  cp3.descr
WHERE manuf=\'\'${manuf}\'\'
AND article=\'\'${article}\'\'
AND descr_type=\'\'${type}\'\'
AND lang=\'\'${from}\'\'
ON CONFLICT(manuf,article,descr_type,lang) DO UPDATE SET 
descr = EXCLUDED.descr,
state = EXCLUDED.state
`
        const fetchParam = {
            backend_point: AppContext.backend_point_query,
            query: query,
        }
        console.log(fetchParam)
        const result = fetch(fetchParam)    
        console.log(result)
    })
}

const fetch = async (fetchParam: any) => {
    return await fetchData(fetchParam)
}

export { transOptions, transExec }