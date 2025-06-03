import { supabase } from './supabaseClient'; // Adjust this import to your actual Supabase client or API utility

export interface Person {
    person_id: number;
    group_id: number;
    name: string;
    // Add any other relevant fields for a person
}

const TABLE_NAME = 'pcnt.person';

/**
 * Fetches all persons, optionally filtered by group_id.
 * @param groupId - Optional group_id to filter persons by.
 * @returns A promise that resolves to an array of persons.
 */
export const fetchPersons = async (groupId?: number): Promise<Person[]> => {
    let query = supabase.from(TABLE_NAME).select('*');

    if (groupId !== undefined) {
        query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching persons:', error);
        throw error;
    }
    return data || [];
};

/**
 * Fetches a single person by their ID.
 * @param person_id - The ID of the person to fetch.
 * @returns A promise that resolves to the person object or null if not found.
 */
export const getPersonById = async (person_id: number): Promise<Person | null> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('person_id', person_id)
        .single();

    if (error) {
        console.error(`Error fetching person with id ${person_id}:`, error);
        throw error;
    }
    return data;
};

/**
 * Creates a new person.
 * @param personData - The data for the new person (without person_id).
 * @returns A promise that resolves to the newly created person.
 */
export const createPerson = async (personData: Omit<Person, 'person_id'>): Promise<Person> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([personData])
        .select()
        .single();

    if (error) {
        console.error('Error creating person:', error);
        throw error;
    }
    return data;
};

/**
 * Updates an existing person.
 * @param person_id - The ID of the person to update.
 * @param updates - An object containing the fields to update.
 * @returns A promise that resolves to the updated person.
 */
export const updatePerson = async (person_id: number, updates: Partial<Omit<Person, 'person_id'>>): Promise<Person> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updates)
        .eq('person_id', person_id)
        .select()
        .single();

    if (error) {
        console.error(`Error updating person with id ${person_id}:`, error);
        throw error;
    }
    return data;
};

/**
 * Deletes a person by their ID.
 * @param person_id - The ID of the person to delete.
 * @returns A promise that resolves when the person is deleted.
 */
export const deletePerson = async (person_id: number): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('person_id', person_id);

    if (error) {
        console.error(`Error deleting person with id ${person_id}:`, error);
        throw error;
    }
};