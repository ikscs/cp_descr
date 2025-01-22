import { fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { IDescrDetail } from "../types"

const defaultDescrDetail: IDescrDetail = {
    name_ua: '',
    description_ua: '',
    state_ua: -1,
    name_ru: '',
    description_ru: '',
    state_ru: -1,
    name_en: '',
    description_en: '',
    state_en: -1,
}

const getDescrData = async (manuf: string, article: string): Promise<IDescrDetail> => {

    const fetchParam = {
        backend_point: AppContext.backend_point_select,
        fields: 'descr_type,lang,descr,state',
        from: 'cp3.product_descr',
        where: {manuf: manuf, article: article}
    }

    const data = await fetchData(fetchParam)
    // const result: any = defaultDescrDetail
    const result: any = {}
    for (const data1 of data) {
        result[data1.descr_type + '_' + data1.lang] = data1.descr
        result['state_' + data1.lang] = data1.state
    }

    return result
}

const postDescrData = async (manuf: string, article: string, data: IDescrDetail) => {
    console.log(manuf, article, data)
}

export { getDescrData, postDescrData, defaultDescrDetail }
