import { type User } from './fetchUsers'; // Import the User interface

interface UpdateUserResponse {
  userId: string;
  username: string;
  email: string;
  authorization: any;
  // Add other properties that might be returned after update
}

export async function updateUserData(
  tenantId: string,
  apiKey: string,
  userId: number,
  customer_id: number,
): Promise<UpdateUserResponse> {
  try {
    const updatedUserData1 = {
      data: {
        customer: customer_id,
      },
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