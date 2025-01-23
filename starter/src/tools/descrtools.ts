import { fetchData } from "../api/fetchData"
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

const postDescrData = async (manuf: string, article: string, data: IDescrDetail) => {
    console.log(manuf, article, data)
}

export { getDescrData, postDescrData, makeDescr, copyDescr, ELang, EType, }
export type { IDescrDetail }
