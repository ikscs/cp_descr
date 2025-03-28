import { fetchData } from './fetchData';

// data from perm_data
export const getData = async (params: any, valueField: string, labelField: string) => {
    try {
        const rows = await fetchData(params)
        return rows.map((row: any)=>({
            value: row[valueField], 
            label: row[labelField], 
        }))
    } catch (err) {
        return []
    }
}

export const getCount = async (params: any) => {
    try {
        params.fields = 'count(*) AS cnt'
        const rows = await fetchData(params)
        return rows[0].cnt
    } catch (err) {
        return -1
    }
}

export const getMax = async (params: any) => {
    try {
        params.fields = `max(${params.field}) AS _max`
        const rows = await fetchData(params)
        return (rows.length === 0) ? 0 : rows[0]._max
    } catch (err) {
        return -1
    }
}
