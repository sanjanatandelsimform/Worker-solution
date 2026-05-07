import axios from "axios";
import type {
  User,
  ProfileUpdatePayload,
  EmailUpdatePayload,
  PasswordChangePayload,
  ProfileApiResponse,
  ProfileError,
} from "@/types/profileTypes";

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to extract error message
const getErrorMessage = (error: unknown): ProfileError => {
  if (axios.isAxiosError(error)) {
    interface ApiErrorResponse {
      message?: string;
      error?: string;
      attemptsRemaining?: number;
      lockoutDuration?: number;
    }
    const apiError = error.response?.data as ApiErrorResponse;
    return {
      message: apiError?.message || apiError?.error || error.message || "An error occurred",
      code: error.code,
      attemptsRemaining: apiError?.attemptsRemaining,
      lockoutDuration: apiError?.lockoutDuration,
    };
  }
  return {
    message: "An unexpected error occurred. Please try again.",
  };
};

// Get access token from localStorage
const getAccessToken = (): string | null => {
  const storedState = localStorage.getItem("userDetail");
  if (!storedState) return null;

  try {
    const parsed = JSON.parse(storedState);
    return parsed?.auth?.tokens?.accessToken || null;
  } catch {
    return null;
  }
};

// Exponential backoff helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple circuit breaker state
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 5;
const CIRCUIT_RESET_MS = 30_000; // 30 seconds
let circuitOpenUntil = 0;

/** Reset circuit breaker state — intended for use in tests only */
export const resetCircuitBreaker = () => {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
};

const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 1,
  attempt = 0
): Promise<T> => {
  // Circuit breaker: reject immediately if circuit is open
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && Date.now() < circuitOpenUntil) {
    throw new Error("Service temporarily unavailable. Please try again later.");
  }

  try {
    const result = await requestFn();
    consecutiveFailures = 0;
    return result;
  } catch (error) {
    consecutiveFailures++;
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      circuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
    }

    if (maxRetries > 0 && axios.isAxiosError(error)) {
      // Retry on network errors or timeouts
      if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || !error.response) {
        const backoffMs = Math.min(1000 * 2 ** attempt, 8000);
        await delay(backoffMs);
        return retryRequest(requestFn, maxRetries - 1, attempt + 1);
      }
    }
    throw error;
  }
};

/**
 * Update user profile (first name and last name)
 * @param payload - ProfileUpdatePayload containing firstName and lastName
 * @returns Promise resolving to updated User data
 */
export const updateProfile = async (payload: ProfileUpdatePayload): Promise<User> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return retryRequest(async () => {
    try {
      const response = await apiClient.patch<ProfileApiResponse>("/profile", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.data?.user) {
        return response.data.data.user;
      }
      throw new Error(response.data.message || "Profile update failed");
    } catch (error) {
      const profileError = getErrorMessage(error);
      throw new Error(profileError.message);
    }
  });
};

/**
 * Update user email address
 * @param payload - EmailUpdatePayload containing new email
 * @returns Promise resolving to ProfileApiResponse
 */
export const updateEmail = async (payload: EmailUpdatePayload): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return retryRequest(async () => {
    try {
      const response = await apiClient.patch<ProfileApiResponse>("/profile/email", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Return the actual response data, not undefined variable
      return response.data;
    } catch (error) {
      const profileError = getErrorMessage(error);

      // Handle 409 Conflict for duplicate email
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error("This email is already in use");
      }

      throw new Error(profileError.message);
    }
  });
};

/**
 * Change user password
 * @param payload - PasswordChangePayload containing current and new password
 * @returns Promise resolving to ProfileApiResponse
 */
export const updatePassword = async (
  payload: PasswordChangePayload
): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  // No retry for password changes (security-sensitive)
  try {
    const response = await apiClient.patch<ProfileApiResponse>("/profile/password", payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    const profileError = getErrorMessage(error);

    // Handle 401 Unauthorized (incorrect current password)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw {
        message: profileError.message || "Incorrect current password",
        attemptsRemaining: profileError.attemptsRemaining,
      };
    }

    // Handle 429 Too Many Requests (account locked)
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      throw {
        message: "Account locked due to too many failed attempts",
        lockoutDuration: profileError.lockoutDuration || 900, // 15 minutes default
      };
    }

    throw new Error(profileError.message);
  }
};

/**
 * Delete user account
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to ProfileApiResponse
 */
export const deleteAccount = async (userId: string): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return retryRequest(async () => {
    try {
      const response = await apiClient.delete<ProfileApiResponse>(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      const profileError = getErrorMessage(error);
      throw new Error(profileError.message);
    }
  });
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async (): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  try {
    const response = await apiClient.post<ProfileApiResponse>(
      "/verification/resend",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    const profileError = getErrorMessage(error);
    throw new Error(profileError.message);
  }
};

/**
 * Retake assessment — resets and initiates a new assessment
 * @returns Promise resolving to ProfileApiResponse
 */
export const retakeAssessment = async (): Promise<ProfileApiResponse> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return retryRequest(async () => {
    try {
      const response = await apiClient.delete<ProfileApiResponse>("/assessment", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      const profileError = getErrorMessage(error);
      throw new Error(profileError.message);
    }
  });
};

export default apiClient;
