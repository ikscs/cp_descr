import { User } from './fetchUsers'; // Import the User interface

interface CreateUserResponse {
    userId: number;
    username: string;
    email: string;
    authorization: any;
    // Add other properties that might be returned after creation
}

export async function createUser(
    tenantId: string,
    apiKey: string,
    newUserData: User // Expect a complete User object for creation
): Promise<CreateUserResponse> {
    try {
        // Create a new object without the authorization field
        const { authorization, ...userWithoutAuth } = newUserData;
        const response = await fetch(
            `https://api.userfront.com/v0/tenants/${tenantId}/users`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userWithoutAuth),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Userfront error:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CreateUserResponse = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}