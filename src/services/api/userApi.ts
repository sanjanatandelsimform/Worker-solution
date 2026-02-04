import apiClient from "@/services/api/authApi";
import type { User } from "@/types/userTypes";

/**
 * Fetch user data by ID
 * @param userId - The unique identifier of the user
 * @param token - The access token for authorization
 * @returns Promise resolving to User data
 */
export const getUserById = async (userId: string, token: string): Promise<User> => {
  try {
    const response = await apiClient.get<{ data: { user: User } }>(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.user;
  } catch (_error) {
    throw new Error("Failed to fetch user data");
  }
};
