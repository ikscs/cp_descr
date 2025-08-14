// fetchUsers.ts

export interface User {
    userId: number; // string Or number, depending on your Userfront setup
    username: string;
    name: string;
    email: string;
    authorization: any;
    roles?: string
}
  
  interface UserResponse {
    meta: any;
    results: User[];
  }
  
  export async function fetchUsers(
    tenantId: string,
    apiKey: string
  ): Promise<User[]> {
    // try {
      const response = await fetch(
        `https://api.userfront.com/v0/tenants/${tenantId}/users`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: UserResponse = await response.json();
      return data.results;
    // } catch (err) {
    //   throw err;
    // }
  }