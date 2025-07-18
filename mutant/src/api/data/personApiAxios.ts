import axios from 'axios';

export interface Person {
    customer_id: number;
    group_id: number;
    person_id: number;
    name: string;
}

const API_URL = 'person/';

const get = async (): Promise<Person[]> => {
    console.log(`[personApi] get called`);
    const res = await axios.get<Person[]>('v_customer_person');
    return res.data;
}

const post = async (data: Partial<Omit<Person, 'person_id'>>): Promise<Person> => {
    console.log('[personApi] post called with data:', data);
    const res = await axios.post<Person>(API_URL, data);
    return res.data;
}

const put = async (person_id: number, data: Partial<Omit<Person, 'person_id'>>): Promise<Person> => {
    console.log('[personApi] put called for person_id:', person_id, 'with data:', data);
    const res = await axios.patch<Person>(API_URL, data);
    return res.data;
};

const _delete = async (person_id: number): Promise<boolean> => {
  console.log('[personApi] delete called for person_id:', person_id);
  const res = await axios.delete(API_URL + `${person_id}/`);
  console.log(`[personApi] delete response for person_id ${person_id}:`, res.data);

  return true;
}

const personApi = {
    get,
    post,
    put,
    delete: _delete,
};

export default personApi;
