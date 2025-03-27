// src/api/deleteRole.ts

import { tenantId, apiKey } from '../globals_VITE';

export async function deleteRole(roleId: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api.userfront.com/v0/tenants/${tenantId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Userfront error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // No need to parse JSON for a successful DELETE request (usually)
  } catch (err) {
    throw err;
  }
}
