import { useState, useEffect } from 'react';
import { fetchUserById } from '../api/fetchUserById';
import { User as FullUserData } from '../api/fetchUsers'; // Assuming fetchUserById returns this type

// Define an interface for the Userfront user object structure
interface UserfrontUser {
  userId: number;
  userUuid: string;
  tenantId: string;
  email: string | null;
  username: string | null;
  name: string | null;
  image: string | null;
  data: Record<string, any> | null;
  // Add other properties if needed from the user object
}

interface UseDetermineChildTenantProps {
  user: UserfrontUser | null; // Use the defined interface for the user object
  apiKey: string | null; // API key
}

interface UseDetermineChildTenantResult {
  childTenantId: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to determine the child tenant ID for the current user.
 * Fetches full user data and analyzes the 'authorization' field.
 *
 * @param user - The user object from useUserfront().
 * @param apiKey - The Userfront API key.
 * @returns An object containing the determined childTenantId, loading state, and error state.
 */
export const useDetermineChildTenant = ({ user, apiKey }: UseDetermineChildTenantProps): UseDetermineChildTenantResult => {
  const [childTenantId, setChildTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const determineTenant = async () => {
      if (user && user.userId && user.tenantId && apiKey) {
        setIsLoading(true);
        setError(null);
        try {
          const fullUserData: FullUserData = await fetchUserById(user.tenantId, apiKey, user.userId);

          if (fullUserData.authorization) {
            const mainTenantId = user.tenantId;
            const potentialChildIds = Object.keys(fullUserData.authorization)
              .filter(id => id !== mainTenantId);

            if (potentialChildIds.length === 1) {
              setChildTenantId(potentialChildIds[0]);
            } else if (potentialChildIds.length > 1) {
              console.warn("⚠️ Admin belongs to multiple child tenants. Selecting the first one for now:", potentialChildIds[0]);
              setChildTenantId(potentialChildIds[0]); // Select first for now
            } else {
              console.warn("ℹ️ Admin does not seem to belong to any child tenant.");
              setChildTenantId(null);
            }
          } else {
             console.warn("ℹ️ Authorization data not found in fetched user data.");
             setChildTenantId(null);
          }
        } catch (err) {
          console.error("❌ Failed to fetch full user data or determine child tenant ID:", err);
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
          setChildTenantId(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset if user or apiKey is not available
        setChildTenantId(null);
        setIsLoading(false);
        setError(null);
      }
    };

    determineTenant();
  }, [user, apiKey]); // Re-run if user or apiKey changes

  return { childTenantId, isLoading, error };
};