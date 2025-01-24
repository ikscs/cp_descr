import { escapeSingleQuotes, fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
// import { IDescrDetail } from "../types"

enum ELang {
    ua = 'ua',
    ru = 'ru',
    en = 'en',
}

enum EType {
    name = 'name',
    description = 'description',
}

interface IDescrValue { 
    value: string,
    state: number, 
}

type IDescrDetail = {
    [key in EType]: Record<ELang, IDescrValue>;
};

interface IDescrKey {
    manuf: string;
    article: string;
}

const makeDescr = () => {
    const ds: IDescrValue = {value: '', state: -1}
    const d: any = {}
    d[EType.name] = {}
    d[EType.name][ELang.ua] = ds
    d[EType.name][ELang.ru] = ds
    d[EType.name][ELang.en] = ds
    d[EType.description] = {}
    d[EType.description][ELang.ua] = ds
    d[EType.description][ELang.ru] = ds
    d[EType.description][ELang.en] = ds
    return d
}

const copyDescr = (s: IDescrDetail): IDescrDetail => {
    const d: any = {}
    d[EType.name] = {}
    d[EType.name][ELang.ua] =       s[EType.name][ELang.ua]
    d[EType.name][ELang.ru] =       s[EType.name][ELang.ru]
    d[EType.name][ELang.en] =       s[EType.name][ELang.en]
    d[EType.description] = {}
    d[EType.description][ELang.ua] =s[EType.description][ELang.ua] 
    d[EType.description][ELang.ru] =s[EType.description][ELang.ru] 
    d[EType.description][ELang.en] =s[EType.description][ELang.en] 
    return d
}

const getDescrData = async (manuf: string, article: string): Promise<IDescrDetail> => {

    const fetchParam = {
        backend_point: AppContext.backend_point_select,
        fields: 'descr_type,lang,descr,state',
        from: 'cp3.product_descr',
        where: {manuf: manuf, article: article}
    }

    const result = makeDescr()
    const data = await fetchData(fetchParam)
    for (const data1 of data) {
        result[data1.descr_type][data1.lang] = {
            value: data1.descr,
            state: data1.state,
        }
    }

    return result
}

const postDescrData = async (key: IDescrKey, data: IDescrDetail) => {
    console.log(key.manuf, key.article, data)

    const values = []
    for (const [type, langData] of Object.entries(data)) {
        for (const [lang, value] of Object.entries(langData)) {
            if (value.value === '') 
                continue
            values.push(`('${key.manuf}','${key.article}','${type}','${lang}',${value.state},'${value.value}')`)
        }
    }

    const insertQuery =
`INSERT INTO cp3.product_descr(manuf, article, descr_type, lang, state,descr)
VALUES ${values.join(',')}
ON CONFLICT(manuf,article,descr_type,lang) DO UPDATE SET 
  descr = EXCLUDED.descr,
  state = EXCLUDED.state
`
    const insertFetchParam = {
        backend_point: AppContext.backend_point_query,
        query: escapeSingleQuotes(insertQuery),
    }
    console.log(insertFetchParam)
    const insertResult = await fetchData(insertFetchParam)    
    console.log('postDescrData insert result',insertResult)
    if (!insertResult[0].ok)
        throw new Error("postDescrData insert error");

    const delKeys = []
    for (const [type, langData] of Object.entries(data)) {
        for (const [lang, value] of Object.entries(langData)) {
            if (value.value === '') 
                delKeys.push(`('${key.manuf}','${key.article}','${type}','${lang}')`)   
        }
    }

    const deleteQuery =
`WITH del AS (values ${delKeys.join(',')}) 
DELETE FROM cp3.product_descr WHERE (manuf,article,descr_type,lang) IN (SELECT * FROM del)
`
    const deleteFetchParam = {
        backend_point: AppContext.backend_point_query,
        query: escapeSingleQuotes(deleteQuery),
    }
    console.log(deleteFetchParam)
    const deleteResult = await fetchData(deleteFetchParam)    
    console.log('postDescrData delete result',deleteResult)
    if (!deleteResult[0].ok)
        throw new Error("postDescrData delete error");
}

export { getDescrData, postDescrData, makeDescr, copyDescr, ELang, EType, }
export type { IDescrDetail, IDescrKey, }
