// Mock API for persons
import { Person } from '../../components/Persons/person.types';

let mockPersons: Person[] = [
  { person_id: 1, name: 'Alice Wonderland', email: 'alice@example.com', customer_id: 1 },
  { person_id: 2, name: 'Bob The Builder', email: 'bob@example.com', customer_id: 1 },
  { person_id: 3, name: 'Charlie Brown', customer_id: 2 },
  { person_id: 4, name: 'Diana Prince', email: 'diana@example.com', customer_id: 1 },
];

let nextId = 5;

const personApi = {
  get: async (customerId: number): Promise<Person[]> => {
    console.log(`Mock API: Fetching persons for customer_id: ${customerId}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return mockPersons.filter(p => p.customer_id === customerId);
  },
  post: async (personData: Omit<Person, 'person_id'>): Promise<Person> => {
    console.log('Mock API: Posting new person:', personData);
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPerson: Person = { ...personData, person_id: nextId++ };
    mockPersons.push(newPerson);
    return newPerson;
  },
  put: async (personId: number, person: Person): Promise<Person> => {
    console.log(`Mock API: Putting person with id ${personId}:`, person);
    await new Promise(resolve => setTimeout(resolve, 300));
    mockPersons = mockPersons.map(p => (p.person_id === personId ? person : p));
    return person;
  },
  delete: async (personId: number): Promise<void> => {
    console.log(`Mock API: Deleting person with id ${personId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    mockPersons = mockPersons.filter(p => p.person_id !== personId);
  },
};

export default personApi;