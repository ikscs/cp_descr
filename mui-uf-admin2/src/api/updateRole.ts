// src/api/updateRole.ts

import { tenantId, apiKey } from '../globals_VITE';

export interface Role {
    name: string;
}

interface UpdateRoleResponse {
    roleId: string; // Assuming Userfront returns a roleId
    name: string;
    // Add other properties that might be returned after update
}

export async function updateRole(
    roleId: string,
    updatedRoleData: Partial<Role>
): Promise<UpdateRoleResponse> {
    try {
        const response = await fetch(
            `https://api.userfront.com/v0/tenants/${tenantId}/roles/${roleId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedRoleData),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Userfront error:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UpdateRoleResponse = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}
