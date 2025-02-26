import { fetchData } from "../api/fetchData"
import AppContext from "../contexts/AppContext"

// return empty string if no image found
export const imageFindUrl = async (
    manuf: string, 
    article: string
): Promise<string> => {

    const data = await fetchData({
        backend_point: AppContext.backend_point_query,
        user: AppContext.userName,
        query: 
`SELECT full_path FROM image.hub
WHERE manuf ilike ''${manuf}'' 
AND article ilike ''${article}'' 
AND hub_id = 0`,
    })
    
    return data.ok && data.data.length > 0 ? data.data[0].full_path : ''
}
