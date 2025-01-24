import AppContext from '../AppContext';

interface IFetchBody {
    backend_point?: string,
    from?: string,
    fields?: string,
    order?: string,
    where?: object,
    user?: string,
    query?: string,
}

export const escapeSingleQuotes = (str: string): string => {
    return str.replace(/'/g, "\'\'");
}

export const fetchData = async (props: IFetchBody) => {

    console.log('fetchData')
    const backend_point = props.backend_point || AppContext.backend_point_select
    const url = AppContext.backend_url + backend_point
    console.log('url', url)
    console.log(JSON.stringify(props))

    // Escape single quotes in the query
    // if (props.query) {
    //     props.query = escapeSingleQuotes(props.query);
    // }

    try {
// body: {from: 'cp3.cp_subject_role', fields: ['subject_role, description']}
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(props)
          });
        
        console.log('response', response.status);
        const result = await response.json();
        return result
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
};
