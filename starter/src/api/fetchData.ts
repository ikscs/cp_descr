import AppContext from '../AppContext';

// ?? agreement: 'id' is mandatory
export const fetchData = async (props: any) => {

    console.log('fetchData')
    const backend_point = props.backend_point || AppContext.backend_point_select
    let url = AppContext.backend_url + backend_point
    console.log('url', url)
    console.log(JSON.stringify(props))
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
