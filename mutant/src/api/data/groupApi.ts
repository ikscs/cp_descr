import { fetchData, postData, getBackend, escapeSingleQuotes, apiToken } from './fetchData';
import { selectData, } from './genericApi';
import type { IFetchResponse, IPostResponse } from './fetchData';
import axios from 'axios';

export interface Group {
    customer_id: number;
    point_id: number;
    group_id: number;
    name: string;
}

// переводим не axios / DRF
const API_URL = 'https://cnt.theweb.place/api/pcnt/person_group/'; 
// const get_ = async (customer_id: number): Promise<Group[]> => {
//     console.log('[groupApi] get called with customer_id:', customer_id);
//     const res = await axios.get<Group[]>(API_URL, {
//         headers: {
//             "Content-Type": "application/json",
//             'authorization': `Bearer ${apiToken.token}`,
//         }
//     });
//     return res.data;
// }
 
const TABLE_NAME = 'pcnt.person_group';
const get = async (customer_id: number): Promise<Group[]> => {

    try {
        const params = {
            from: TABLE_NAME,
            fields: 'customer_id,group_id,point_id,name',
            order: 'name',
            where: { customer_id },
        };

        const response: IFetchResponse = (await fetchData(params));
        console.log('[groupApi] response:', response);
        return response;

    } catch (err) {
        console.error('[groupApi] Error fetching customer\'s groups:', err);
        return [];
    }
};

const qq = (s: string) => `''${s}''`

const post = async (data: Partial<Omit<Group, 'group_id'>>): Promise<Group> => {
    console.log('[groupApi] create called with data:', data);

    if (typeof data.customer_id !== 'number' || !data.name || typeof data.name !== 'string') {
        const errorMsg = 'customer_id (number) and name (string) are required to create a group.';
        console.error(`[groupApi] create validation failed: ${errorMsg}`);
        throw new Error(errorMsg);
    }

    const groupToInsert = [
        data.customer_id,
        data.point_id,
        qq(data.name),
    ];

    try {
        const result: IPostResponse & { error?: string } = await postData({
          backend_point: getBackend().backend_point_insert,
          dest: TABLE_NAME,
          fields: 'customer_id, point_id, name',
          values: [groupToInsert],
          returning: 'group_id, customer_id, point_id, name',
        });

        if (result.ok && result.data && Array.isArray(result.data) && result.data.length > 0) {
            const newGroup = result.data[0] as Group;
            if (typeof newGroup.group_id !== 'number') {
                console.error('[groupApi] create: Insert successful, but returned data is missing group_id or is not a valid group object:', newGroup);
                throw new Error('Failed to create group: Backend returned invalid data (missing group_id).');
            }
            console.log('[groupApi] create successful, new group:', newGroup);
            return newGroup;
        } else if (result.ok && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
            // Handle cases where backend might return a single object directly (less common for INSERT...RETURNING)
            const newGroup = result.data as Group;
            if (typeof newGroup.group_id === 'number') {
                console.log('[groupApi] create successful (single object returned), new group:', newGroup);
                return newGroup;
            } else {
                console.error('[groupApi] create: Insert ok, but returned single object is not a valid group:', result.data);
                throw new Error('Failed to create group: Backend returned invalid single data object.');
            }
        } else {
            const errorMsg = result.error || (result.ok ? 'Insert reported success, but no valid data returned.' : 'Failed to create group.');
            console.error(`[groupApi] create failed: ${errorMsg}`, result);
            throw new Error(errorMsg);
        }
    } catch (err: any) {
      console.error('[groupApi] Error during create process:', err.message, err);
      throw err instanceof Error ? err : new Error(String(err.message || 'An unknown error occurred during group creation.'));
    }
};

const put = async (group_id: number, data: Partial<Omit<Group, 'group_id'>>): Promise<Group> => {
  console.log('[groupApi] update called for group_id:', group_id, 'with data:', data);

  if (Object.keys(data).length === 0) {
    console.warn('update: No data provided for update.');
    throw new Error('No data provided for group update.');
  }

  const backend = getBackend();
  const setClauses: string[] = [];
  const keys = Object.keys(data) as Array<keyof typeof data>;

  for (const key of keys) {
    const value = data[key];
    if (value === undefined) continue;

    if (typeof value === 'string') {
      setClauses.push(`${key} = ''${escapeSingleQuotes(value)}''`);
    } else if (typeof value === 'number') {
      setClauses.push(`${key} = ${value}`);
    } else if (value === null) {
      setClauses.push(`${key} = NULL`);
    } else {
      console.warn(`[groupApi] update: Unsupported type for key ${key}. Value: ${value}`);
      throw new Error(`Unsupported type for field ${key} in group update.`);
    }
  }

  if (setClauses.length === 0) {
    console.warn('[groupApi] update: No valid fields to update after processing data.');
    throw new Error('No valid fields to update for group.');
  }

  const updateQuery = `UPDATE ${TABLE_NAME} SET ${setClauses.join(', ')} WHERE group_id = ${group_id}`;

  try {
    console.log('[groupApi] update query:', updateQuery);
    const result = await postData({
      backend_point: backend.backend_point_query,
      query: updateQuery,
    });

    if (result.ok) {
      const affectedRows = typeof result.data === 'number' ? result.data : -1; // Assuming result.data is affected rows count

      if (affectedRows > 0) {
        const updatedGroups = await selectData<Group>({
          from: TABLE_NAME,
          fields: 'customer_id, group_id, name',
          where: { group_id },
        });
        if (updatedGroups.length > 0) {
          return updatedGroups[0];
        }
        throw new Error(`CRITICAL: Group ${group_id} update reported success (${affectedRows} rows), but subsequent fetch failed.`);
      } else if (affectedRows === 0) {
        const existingGroup = await selectData<Group>({
          from: TABLE_NAME,
          fields: 'customer_id, point_id, name',
          where: { group_id },
        });
        if (existingGroup.length > 0) {
          return existingGroup[0]; // Group exists, data was identical
        }
        throw new Error(`Group with id ${group_id} not found (update affected 0 rows).`);
      } else {
        console.error(`Update for group ${group_id} was OK, but 'result.data' was not a valid affected rows count:`, result.data);
        throw new Error(`Update for group ${group_id} completed with ambiguous result from backend.`);
      }
    } else {
      const errorMsg = (result as any).error || 'Unknown backend error during update.';
      console.error(`Update for group_id ${group_id} failed. Error: ${errorMsg}`, result);
      throw new Error(`Failed to update group ${group_id}: ${errorMsg}`);
    }
  } catch (err) {
    console.error(`Error during update process for group ${group_id}:`, err);
    throw err; // Re-throw original error or a new one if it's not an Error instance
  }
};

const _delete = async (group_id: number): Promise<void> => {
  console.log('[pointApi-Mock] deletePoint called for point_id:', group_id);
  const deleteQuery = `DELETE FROM ${TABLE_NAME} WHERE group_id = ${group_id}`;
  const backend = getBackend();
  try {
    const result = await postData({
      backend_point: backend.backend_point_query,
      query: deleteQuery,
    });
    if (result.ok) {
      const affectedRows = typeof result.data === 'number' ? result.data : -1;
      if (affectedRows > 0) {
        console.log(`Group with id ${group_id} deleted successfully.`);
      } else {
        console.warn(`No group found with group_id ${group_id} to delete.`);
      }
    } else {
      const errorMsg = (result as any).error || 'Unknown backend error during delete.';
      console.error(`Delete for group_id ${group_id} failed. Error: ${errorMsg}`, result);
      throw new Error(`Failed to delete group ${group_id}: ${errorMsg}`);
    }
  } catch (err) {
    console.error(`Error during delete process for group ${group_id}:`, err);
    throw err;
  }
};

const groupApi = {
  get,
  post,
  put,
  delete: _delete,
};

export default groupApi;
