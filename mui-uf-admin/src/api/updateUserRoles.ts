import { User } from './fetchUsers';

export interface AuthorizationUpdate {
    roles: string[];
}

export async function updateUserRoles(
    tenantId: string,
    apiKey: string,
    userId: number,
    updateData: AuthorizationUpdate // Явное использование интерфейса
): Promise<User> {
    try {
        const response = await fetch(
            `https://api.userfront.com/v0/tenants/${tenantId}/users/${userId}/roles`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData), // Используем updateData
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedUser: User = await response.json();
        return updatedUser;
    } catch (err) {
        throw err;
    }
}

