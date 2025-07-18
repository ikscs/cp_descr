import axios from 'axios';

export interface Group {
    customer_id: number;
    point_id: number;
    group_id: number;
    name: string;
}

const API_URL = 'person_group/'; 

const get = async (): Promise<Group[]> => {
    console.log('[groupApi] get called');
    const res = await axios.get<Group[]>(API_URL);
    return res.data;
}
 
const post = async (data: Partial<Omit<Group, 'group_id'>>): Promise<Group> => {
    console.log('[groupApi] post called with data:', data);
    const res = await axios.post<Group>(API_URL, data);
    return res.data;
}

const put = async (group_id: number, data: Partial<Omit<Group, 'group_id'>>): Promise<Group> => {
    console.log('[groupApi] update called for group_id:', group_id, 'with data:', data);
    const res = await axios.patch<Group>(API_URL, data);
    return res.data;
};

const _delete = async (group_id: number): Promise<boolean> => {
  console.log('[groupApi] delete called for group_id:', group_id);
  const res = await axios.delete(API_URL + `${group_id}/`);
  console.log(`[groupApi] delete response for group_id ${group_id}:`, res.data);

  return true;
}

const grouApi = {
  get,
  post,
  put,
  delete: _delete,
};

export default grouApi;
