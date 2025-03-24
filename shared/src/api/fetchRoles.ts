import { tenantId, apiKey } from '../globals_VITE';

interface Role {
    name: string;
}

interface RolesResponse {
    roles: Role[];
}

export async function fetchRoles(): Promise<string[]> {
    try {
        const response = await fetch(
            `https://api.userfront.com/v0/tenants/${tenantId}/roles`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Userfront error:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RolesResponse = await response.json();
        return data.roles.map(role => role.name); // Extract role names
    } catch (err) {
        throw err;
    }
}