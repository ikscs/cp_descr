// import { number } from "yup";

export const backend = {
    backend_url: 'https://rise.theweb.place/back',
    backend_point_select: '/f5.php?func=cp3.js_select_b',
    backend_point_query:  '/f5.php?func=cp3.js_query_b',
    backend_point_insert: '/f5.php?func=cp3.js_insert_b',
    backend_point_upsert: '/f5.php?func=cp3.js_upsert_b',
    backend_point_update: '/f5.php?func=cp3.js_update_b',
    backend_point_report:  '/f5.php?func=cp3.js_report_b',
}

interface IFetchBody {
    backend_point?: string;
    from?: string;
    dest?: string;
    fields?: string;
    order?: string;
    where?: { [key: string]: string | number | boolean | null }; // Refined 'where' type
    values?: any[];
    user?: string;
    query?: string;
    // method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Add method
    // data?: any; // Add data
  }
  

export const escapeSingleQuotes = (str: string): string => {
    return str.replace(/'/g, "\'\'");
}

// export interface IPostResponse {
//   ok: boolean;
//   data: any[];
// }

// export interface IPostResponseCount {
//   count: number;
// }

export interface IPostResponse {
  ok: boolean;
  data: any;
  count?: number;
}

// export type IPostResponse = IPostResponseCount | IPostResponseOk;

export type IFetchResponse = any[];

export type FetchData = (props: IFetchBody) => Promise<IFetchResponse>;
export type PostData = (props: IFetchBody) => Promise<IPostResponse>;

export const fetchData: FetchData = async (props: IFetchBody) => {

    console.log('fetchData')
    const backend_point = props.backend_point || backend.backend_point_select
    const url = backend.backend_url + backend_point
    console.log('url', url)
    console.log(JSON.stringify(props))

    try {
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
        throw error;
    }
};

export const postData: PostData = async (props: IFetchBody) => {

  console.log('postData')
  const backend_point = props.backend_point
  const url = backend.backend_url + backend_point
  console.log('url', url)
  console.log(JSON.stringify(props))

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(props)
        });
      
      console.log('response', response.status);
      const data = await response.json();
      console.log('response.ok', response.ok);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return data
  } catch (error) {
      console.error('Error fetching data: ', error);
      throw error;
  }
};
