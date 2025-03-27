import { tenantId, apiKey } from '../globals_VITE';

export interface Role {
    name: string;
}

interface CreateRoleResponse {
    roleId: string; // Assuming Userfront returns a roleId
    name: string;
    // Add other properties that might be returned after creation
}

export async function createRole(
    roleName: string
): Promise<CreateRoleResponse> {
    try {
        const newRoleData: Role = {
            name: roleName,
        };

        const response = await fetch(
            `https://api.userfront.com/v0/tenants/${tenantId}/roles`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRoleData),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Userfront error:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CreateRoleResponse = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}
