import packageJson from '../../package.json';
import { fetchData } from "../api/fetchData"
import { getCount } from "../api/dataTools";
import AppContext from "../contexts/AppContext";

interface IManufPreset {
    key: number; 
    value: string;
    isChecked: boolean;
}

export const presetDataGet___ = async (preset: string): Promise<{manufs: IManufPreset[], selected: number[]}> => {
    console.log('presetDataGet___')
    // const { setManufGridRowsSelected,setManufGridRows } = usePresetContext();

    const presetData: any[] = await fetchData({
        from: 'cp3.perm_preset', 
        fields: 'preset_id,preset_data',
        where: preset.length > 0 ? {app_id: packageJson.name, preset_id: preset} : {app_id: packageJson.name}
    })

    if (presetData.length == 0)
        return {manufs: [], selected: [],}

    const manufs: IManufPreset[] = presetData[0].preset_data.manuf
    const selected = manufs.filter( manuf => manuf.isChecked ).map( (_, index) => index)
    return {manufs, selected}
}

export const presetDataGet = async (preset: string): Promise<{
        presetDataSource: string,
        manufRows: any[], manufSelected: Set<number>,
        articleRows: any[], articleSelected: Set<number>, articleInvert: boolean,
        nameRows: any[], nameSelected: Set<number>,
        autostart: boolean,
        presetQuery: string,
    }> => {
    console.log('presetDataGet')

    const presetData: any[] = await fetchData({
        from: 'cp3.perm_preset', 
        fields: 'preset_id,preset_data',
        where: preset.length > 0 ? {app_id: packageJson.name, preset_id: preset} : {app_id: packageJson.name}
    })

    if (presetData.length == 0 || !(presetData[0].preset_data))
        return {
            presetDataSource: '',
            manufRows: [], manufSelected: new Set([]),
            articleRows: [], articleSelected: new Set([]), articleInvert: false,
            nameRows: [], nameSelected: new Set([]),
            autostart: false,
            presetQuery: '',
        }

    const presetDataSource = presetData[0].preset_data.presetDataSource || ''

    const manufRows = presetData[0].preset_data.manuf||[]
    const manufKeys = manufRows.filter((e:any)=>e.selected??false).map((e:any)=>e.key)
    const manufSelected = new Set<number>(manufKeys)

    const articleRows = presetData[0].preset_data.article||[]
    const articleKeys = articleRows.filter((e:any)=>e.selected??false).map((e:any)=>e.key)
    const articleSelected = new Set<number>(articleKeys)
    const articleInvert = presetData[0].preset_data.articleInvert || false

    const nameRows = presetData[0].preset_data.name||[]
    const nameKeys = nameRows.filter((e:any)=>e.selected??false).map((e:any)=>e.key)
    const nameSelected = new Set<number>(nameKeys)

    const autostart = presetData[0].preset_data.autostart || false

    const presetQuery = presetData[0].preset_data.presetQuery || ''

    return {
        presetDataSource,
        manufRows, manufSelected,
        articleRows, articleSelected, articleInvert,
        nameRows, nameSelected,
        autostart,
        presetQuery,
    }
}

const qq = (s: string) => `''${s}''`

export const presetDataPost = async (preset: string,
        presetDataSource: string,
        manufRows: any[], manufSelected: Set<number>,
        articleRows: any[], articleSelected: Set<number>, articleInvert: boolean,
        nameRows: any[], nameSelected: Set<number>,
        autostart: boolean,
        presetQuery: string,
) => {
    console.log('presetDataPost')
    
    const count = await getCount({
        from: 'cp3.perm_preset',
        where: {app_id: packageJson.name, preset_id: preset}
    })

    const manuf = manufRows.map(item => ({...item, selected: manufSelected.has(item.key)}));
    const article = articleRows.map(item => ({...item, selected: articleSelected.has(item.key)}));
    const name = nameRows.map(item => ({...item, selected: nameSelected.has(item.key)}));
    const objToSave = {presetDataSource, manuf, article, articleInvert, name, autostart, 
        presetQuery: doubleq(presetQuery), }

    const fetchParam = count == 0 ? {
        backend_point: AppContext.backend_point_insert,
        dest: 'cp3.perm_preset', 
        fields: 'app_id,preset_id,preset_data',
        values: [[qq(packageJson.name), qq(preset), qq(JSON.stringify(objToSave))]]
    } : {
        backend_point: AppContext.backend_point_update,
        dest: 'cp3.perm_preset', 
        set: {preset_data: qq(JSON.stringify(objToSave))  },
        where: {app_id: packageJson.name, preset_id: preset }
    }

    console.log(fetchParam)
    const result = await fetchData(fetchParam)
    return `Number of affected rows ${result||-1}`
}

const doubleq = (query: string) => {
    return query.replace(/'/g, "''''")
}