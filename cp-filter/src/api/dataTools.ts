import { fetchData } from '../api/fetchData';

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
