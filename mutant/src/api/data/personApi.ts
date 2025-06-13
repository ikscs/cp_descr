import { getBackend, postData, escapeSingleQuotes, fetchData } from './fetchData';
import { selectData } from './genericApi';
import type { IFetchResponse, IPostResponse } from './fetchData';
// import type { ISelectParams } from './genericApiTypes';

export interface Person {
    customer_id: number;
    group_id: number;
    person_id: number;
    name: string;
    // Add any other relevant fields for a person
}

const TABLE_NAME = 'pcnt.person';
const VIEW_NAME = 'v_customer_person';

// Helper to format string values for SQL, consistent with other API files like personApi.ts
const formatSqlString = (s: string): string => {
    if (s === null || s === undefined) return 'NULL';
    return `''${escapeSingleQuotes(s)}''`;
};

const get = async (customerId: number): Promise<Person[]> => {
  console.log(`[personApi] get called for customerId: ${customerId}`);
  try {
    const params = {
      from: VIEW_NAME,
      fields: 'customer_id, group_id, person_id, name',
      where: { customer_id: customerId },
      order: 'name', // Optional: order by person name
    };

    const response: IFetchResponse = await fetchData(params);
    console.log(`[personApi get] response for customerId ${customerId}:`, response);
    // Ensure response is an array
    if (Array.isArray(response)) {
      return response as Person[];
    }
    console.warn(`[personApi get] Expected array but received:`, response);
    return [];
  } catch (err) {
    console.error(`[personApi get] Error fetching persons for customerId ${customerId}:`, err);
    return [];
  }
};

/**
 * Fetches all persons, optionally filtered by group_id.
 * @param groupId - Optional group_id to filter persons by.
 * @returns A promise that resolves to an array of persons.
 */
/*export const get = async (groupId?: number): Promise<Person[]> => {
    console.log(`[personApi] fetchPersons called for groupId: ${groupId}`);
    try {
        const params: ISelectParams = {
            from: TABLE_NAME,
            fields: 'person_id, group_id, name',
            order: 'name', // Default ordering
        };
        if (groupId !== undefined) {
            params.where = { group_id: groupId };
        }
        return await selectData<Person>(params);
    } catch (error) {
        console.error('[personApi] Error fetching persons:', error);
        throw error; // Or return [] depending on desired global error handling
    }
};*/

/**
 * Fetches a single person by their ID.
 * @param person_id - The ID of the person to fetch.
 * @returns A promise that resolves to the person object or null if not found.
 */
export const getPersonById = async (person_id: number): Promise<Person | null> => {
    console.log(`[personApi] getPersonById called for person_id: ${person_id}`);
    try {
        const persons = await selectData<Person>({
            from: TABLE_NAME,
            fields: 'person_id, group_id, name',
            where: { person_id },
        });
        return persons.length > 0 ? persons[0] : null;
    } catch (error) {
        console.error(`[personApi] Error fetching person with id ${person_id}:`, error);
        throw error; // Or return null
    }
};

/**
 * Creates a new person.
 * @param personData - The data for the new person (without person_id).
 * @returns A promise that resolves to the newly created person.
 */
export const post = async (personData: Omit<Person, 'person_id' | 'customer_id'>): Promise<Person> => {
    console.log('[personApi] createPerson called with data:', personData);

    if (typeof personData.group_id !== 'number' || !personData.name || typeof personData.name !== 'string') {
        const errorMsg = 'group_id (number) and name (string) are required to create a person.';
        console.error(`[personApi] createPerson validation failed: ${errorMsg}`);
        throw new Error(errorMsg);
    }

    // Values should be formatted as SQL literals if backend_point_insert expects them that way
    const personValues = [
        personData.group_id,
        formatSqlString(personData.name),
    ];

    try {
        const result: IPostResponse & { error?: string } = await postData({
          backend_point: getBackend().backend_point_insert,
          dest: TABLE_NAME,
          fields: 'group_id, name', // Fields being inserted
          values: [personValues],    // postData for insert expects array of arrays of formatted values
          returning: 'person_id, group_id, name', // Fields to return for the new person
        });

        if (result.ok && result.data && Array.isArray(result.data) && result.data.length > 0) {
            const newPerson = result.data[0] as Person;
            if (typeof newPerson.person_id !== 'number') {
                console.error('[personApi] createPerson: Insert successful, but returned data is missing person_id or is not a valid person object:', newPerson);
                throw new Error('Failed to create person: Backend returned invalid data (missing person_id).');
            }
            console.log('[personApi] createPerson successful, new person:', newPerson);
            return newPerson;
        } else {
            const errorMsg = result.error || (result.ok ? 'Insert reported success, but no valid data returned.' : 'Failed to create person.');
            console.error(`[personApi] createPerson failed: ${errorMsg}`, result);
            throw new Error(errorMsg);
        }
    } catch (err: any) {
      console.error('[personApi] Error during createPerson process:', err.message || err, err);
      throw err instanceof Error ? err : new Error(String(err.message || 'An unknown error occurred during person creation.'));
    }
};

/**
 * Updates an existing person.
 * @param person_id - The ID of the person to update.
 * @param updates - An object containing the fields to update.
 * @returns A promise that resolves to the updated person.
 */
export const put = async (person_id: number, updates: Partial<Omit<Person, 'person_id' | 'customer_id'>>): Promise<Person> => {
    console.log('[personApi] updatePerson called for person_id:', person_id, 'with updates:', updates);

    if (Object.keys(updates).length === 0) {
        console.warn('[personApi] updatePerson: No data provided for update.');
        throw new Error('No data provided for person update.');
    }

    const setClauses: string[] = [];
    // Ensure updatableFields only contains keys that are valid for the 'updates' object type.
    const updatableFields: (keyof Omit<Person, 'person_id' | 'customer_id'>)[] = ['group_id', 'name'];

    for (const key of updatableFields) {
        if (updates.hasOwnProperty(key)) {
            const value = updates[key];
            if (value === undefined) continue;

            if (key === 'name' && typeof value === 'string') {
                setClauses.push(`${key} = ${formatSqlString(value)}`);
            } else if (key === 'group_id' && typeof value === 'number') {
                setClauses.push(`${key} = ${value}`);
            } else if (value === null) {
                 setClauses.push(`${key} = NULL`);
            }
        }
    }

    if (setClauses.length === 0) {
        console.warn('[personApi] updatePerson: No valid fields to update after processing data. Fetching current person.');
        const currentPerson = await getPersonById(person_id);
        if (currentPerson) return currentPerson;
        throw new Error(`Person with id ${person_id} not found, and no valid fields to update.`);
    }

    const updateQuery = `UPDATE ${TABLE_NAME} SET ${setClauses.join(', ')} WHERE person_id = ${person_id}`;

    try {
        console.log('[personApi] updatePerson query:', updateQuery);
        const result = await postData({
            backend_point: getBackend().backend_point_query,
            query: updateQuery,
        });

        if (result.ok) {
            const affectedRows = typeof result.data === 'number' ? result.data : (Array.isArray(result.data) && result.data.length > 0 && typeof result.data[0] === 'number' ? result.data[0] : -1);

            if (affectedRows > 0) {
                const updatedPerson = await getPersonById(person_id);
                if (updatedPerson) {
                    console.log(`[personApi] updatePerson for id ${person_id} successful. Returning:`, updatedPerson);
                    return updatedPerson;
                }
                throw new Error(`CRITICAL: Person ${person_id} update reported success (${affectedRows} rows), but subsequent fetch failed.`);
            } else { // affectedRows is 0 or invalid
                const existingPerson = await getPersonById(person_id);
                if (existingPerson) return existingPerson; // No change or person exists but update didn't apply
                throw new Error(`Person with id ${person_id} not found or update failed (affected rows: ${affectedRows}).`);
            }
        } else {
            const errorMsg = (result as any).error || 'Unknown backend error during person update.';
            console.error(`[personApi] Update for person_id ${person_id} failed. Error: ${errorMsg}`, result);
            throw new Error(`Failed to update person ${person_id}: ${errorMsg}`);
        }
    } catch (err: any) {
        console.error(`[personApi] Error during updatePerson process for id ${person_id}:`, err.message || err, err);
        throw err instanceof Error ? err : new Error(String(err.message || `An unknown error occurred while updating person ${person_id}.`));
    }
};

/**
 * Deletes a person by their ID.
 * @param person_id - The ID of the person to delete.
 * @returns A promise that resolves when the person is deleted.
 */
export const _delete = async (person_id: number): Promise<void> => {
    console.log('[personApi] deletePerson called for person_id:', person_id);
    const deleteQuery = `DELETE FROM ${TABLE_NAME} WHERE person_id = ${person_id}`;

    try {
        const result = await postData({
            backend_point: getBackend().backend_point_query, // Or a specific backend_point_delete
            query: deleteQuery,
        });

        if (result.ok) {
            const affectedRows = typeof result.data === 'number' ? result.data : (Array.isArray(result.data) && result.data.length > 0 && typeof result.data[0] === 'number' ? result.data[0] : -1);
            if (affectedRows > 0) {
                console.log(`[personApi] Person with id ${person_id} deleted successfully.`);
            } else {
                console.warn(`[personApi] No person found with id ${person_id} to delete, or already deleted (affected rows: ${affectedRows}).`);
            }
        } else {
            const errorMsg = (result as any).error || 'Unknown backend error during person delete.';
            console.error(`[personApi] Delete for person_id ${person_id} failed. Error: ${errorMsg}`, result);
            throw new Error(`Failed to delete person ${person_id}: ${errorMsg}`);
        }
    } catch (err: any) {
        console.error(`[personApi] Error during deletePerson process for id ${person_id}:`, err.message || err, err);
        throw err instanceof Error ? err : new Error(String(err.message || `An unknown error occurred while deleting person ${person_id}.`));
    }
};

const personApi = {
    get,
    post,
    put,
    delete: _delete,
};

export default personApi;
