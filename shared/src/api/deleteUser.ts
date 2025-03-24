export async function deleteUser(
    tenantId: string,
    apiKey: string,
    userId: number
): Promise<void> {
    try {
        const response = await fetch(
            `https://api.userfront.com/v0/tenants/${tenantId}/users/${userId}`,
            {
                method: 'DELETE',
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

        // If the deletion is successful, the response might not contain any data
        // So, we don't try to parse it as JSON.
        return; // No data to return on successful deletion
    } catch (err) {
        throw err;
    }
}