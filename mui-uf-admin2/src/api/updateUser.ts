import { User } from './fetchUsers'; // Import the User interface

interface UpdateUserResponse {
  userId: string;
  username: string;
  email: string;
  authorization: any;
  // Add other properties that might be returned after update
}

export async function updateUser(
  tenantId: string,
  apiKey: string,
  userId: number,
  updatedUserData: Partial<User> // Use Partial to allow partial updates
): Promise<UpdateUserResponse> {
  try {
    const updatedUserData1 = {
      username: updatedUserData.username,
      email: updatedUserData.email,
    };
    
    const response = await fetch(
      `https://api.userfront.com/v0/tenants/${tenantId}/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData1),
      }
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Userfront error:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UpdateUserResponse = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}