import axios, { AxiosError } from "axios";
import type {
  RegistrationData,
  SignInData,
  SignupResponse,
  UserAccount,
  EmailCheckResponse,
  ApiError,
  Industry,
} from "../../types/auth";
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";
import {
  isRefreshing as sharedIsRefreshing,
  setIsRefreshing,
  setRefreshFailed,
  isRefreshFailed,
  failedQueue as sharedFailedQueue,
  processQueue,
  dispatchLogoutAndRedirect,
  doRefreshToken,
} from "@/services/api/tokenRefresh";

export { getAuthToken, getErrorMessage };

const STORAGE_KEY = "userDetail";

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access token from localStorage when present
apiClient.interceptors.request.use(config => {
  try {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

// Helper function to extract error message — re-exported from apiUtils

/**
 * Refresh access token using refresh token
 * UPDATED: Ensures new tokens are stored immediately after successful refresh
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await apiClient.post<{
      status: boolean;
      message: string;
      data: {
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      };
    }>("/auth/refresh-token", { refreshToken });

    const newTokens = response.data.data.tokens;

    if (!newTokens?.accessToken || !newTokens?.refreshToken) {
      throw new Error("Invalid token response from server");
    }

    // CRITICAL: Update localStorage IMMEDIATELY after successful refresh
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const updatedState = {
        ...parsed,
        auth: {
          ...(parsed.auth || {}),
          tokens: {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
          },
          isAuthenticated: true,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (storageError) {
      console.error("Failed to update tokens in localStorage:", storageError);
      // Still return tokens even if storage update fails
    }

    // Update axios default header for subsequent requests
    apiClient.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;

    return newTokens;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem(STORAGE_KEY);
    throw new Error(getErrorMessage(error));
  }
};

// ── Response interceptor: 401 → refresh token → retry ───────────────────────
// Uses the shared lock from tokenRefresh.ts so that concurrent 401s from BOTH
// the authApi (apiClient) and assessmentApi (api) instances only trigger one
// /auth/refresh-token call, with the rest queued.
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry on auth pages or if already retried
    const isAuthPage =
      window.location.pathname.includes("/sign-in") ||
      window.location.pathname.includes("/sign-up") ||
      window.location.pathname.includes("/forgot-password");

    if (isAuthPage || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a previous refresh already failed in this page session, skip straight
    // to redirect — do NOT attempt another /auth/refresh-token call.
    if (isRefreshFailed()) {
      return dispatchLogoutAndRedirect();
    }

    // If the /auth/refresh-token endpoint itself returned 401, the refresh token
    // is expired or invalid. Clear the session and redirect immediately — there
    // is no further token to fall back to, and retrying would cause an infinite loop.
    const requestUrl = (originalRequest as { url?: string }).url ?? "";
    if (requestUrl.includes("/auth/refresh-token")) {
      setRefreshFailed(true);
      localStorage.removeItem(STORAGE_KEY);
      return dispatchLogoutAndRedirect();
    }

    const storedState = localStorage.getItem(STORAGE_KEY);
    if (!storedState) {
      return Promise.reject(error);
    }

    let parsedState;
    try {
      parsedState = JSON.parse(storedState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return dispatchLogoutAndRedirect();
    }

    const refreshToken = parsedState?.auth?.tokens?.refreshToken;

    if (!refreshToken) {
      localStorage.removeItem(STORAGE_KEY);
      return dispatchLogoutAndRedirect();
    }

    // ── Queue if another instance is already refreshing ──────────────────
    if (sharedIsRefreshing) {
      return new Promise<string>((resolve, reject) => {
        sharedFailedQueue.push({ resolve, reject });
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch(() => dispatchLogoutAndRedirect());
    }

    originalRequest._retry = true;
    setIsRefreshing(true);

    try {
      // Use doRefreshToken (plain axios client, no interceptors) to avoid
      // recursive interception and the deadlock it can cause.
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await doRefreshToken(refreshToken);

      // Persist new tokens to localStorage
      try {
        const rawAfterRefresh = localStorage.getItem(STORAGE_KEY);
        const parsedAfterRefresh = rawAfterRefresh ? JSON.parse(rawAfterRefresh) : {};
        const updatedState = {
          ...parsedAfterRefresh,
          auth: {
            ...(parsedAfterRefresh.auth || {}),
            tokens: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
            isAuthenticated: true,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      } catch (storageError) {
        console.error("[authApi] Failed to persist refreshed tokens:", storageError);
      }

      // Update axios default header for all future requests on this instance
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      // Update original request header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // Sync Redux store if available
      if (typeof window !== "undefined" && (window as { store?: unknown }).store) {
        try {
          const { setTokens } = await import("@/store/slices/authSlice");
          (window as { store: { dispatch: (action: unknown) => void } }).store.dispatch(
            setTokens({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            })
          );
        } catch (reduxError) {
          console.error("[authApi] Failed to sync tokens to Redux:", reduxError);
        }
      }

      // Release queued requests
      processQueue(null, newAccessToken);

      // Retry original request with new token
      return apiClient(originalRequest);
    } catch (refreshError) {
      setRefreshFailed(true);
      processQueue(refreshError as Error, null);
      localStorage.removeItem(STORAGE_KEY);
      return dispatchLogoutAndRedirect();
    } finally {
      setIsRefreshing(false);
    }
  }
);

/**
 * Register a new user account with business information
 */
export const signup = async (data: RegistrationData): Promise<SignupResponse> => {
  try {
    const response = await apiClient.post<{
      status: boolean;
      message: string;
      data: {
        user: UserAccount;
        tokens: { accessToken: string; refreshToken: string };
      };
    }>("/users/create", {
      firstName: data.firstName,
      lastName: data.lastName,
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      industry: data.industry,
      zipCode: data.zipCode,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    return {
      user: response.data.data.user,
      tokens: response.data.data.tokens,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Sign in an existing user
 */
export const signin = async (
  data: SignInData
): Promise<{
  status: boolean | string;
  message: string;
  data?: {
    user: UserAccount;
    tokens: { accessToken: string; refreshToken: string };
  };
}> => {
  try {
    const response = await apiClient.post("/auth/login", {
      businessEmail: data.businessEmail,
      password: data.password,
      rememberMe: data.rememberMe,
    });

    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as ApiError | undefined)?.message ?? "Incorrect email or password")
      : getErrorMessage(error);

    return {
      status: "error",
      message,
    };
  }
};

/**
 * Sign out the current user
 */
export const signout = async (token?: string): Promise<void> => {
  try {
    // Get the latest token from localStorage if not provided
    if (!token) {
      const storedState = localStorage.getItem("userDetail");
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        token = parsedState?.auth?.tokens?.accessToken;
      }
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await apiClient.post("/auth/logout", {}, { headers });
  } catch (error) {
    // If logout fails due to invalid token, still clear local state
    console.error("Logout error:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Check if an email is available for registration
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<EmailCheckResponse>("/auth/check-email", {
      params: { email },
    });
    return response.data.available;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Request password reset / forgot password
 */
export const forgotPassword = async (email: string): Promise<{ message?: string }> => {
  try {
    const response = await apiClient.post<{ message?: string }>("/auth/forgot-password", {
      businessEmail: email,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Reset password using reset token
 */
export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<{ message?: string }> => {
  try {
    const response = await apiClient.post<{ message?: string }>("/auth/reset-password", {
      resetToken,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Verify email using verification token
 */
export const verifyEmail = async (
  token: string
): Promise<{
  message?: string;
  user?: {
    id: string;
    businessEmail: string;
    emailVerify: boolean;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}> => {
  try {
    const response = await apiClient.post<{
      message?: string;
      data?: {
        user: {
          id: string;
          businessEmail: string;
          emailVerify: boolean;
        };
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      };
    }>(
      "/verification/verify",
      {},
      {
        params: { token },
      }
    );

    // Return flattened response for easier consumption
    return {
      message: response.data.message,
      user: response.data.data?.user,
      tokens: response.data.data?.tokens,
    };
  } catch (_error) {
    throw new Error("Failed to verify email. Please try again.");
  }
};

/**
 * Set tokens utility (for other services)
 */
export const setTokens = (tokens: { accessToken: string; refreshToken: string }): void => {
  const storedState = localStorage.getItem("userDetail");
  if (storedState) {
    const parsedState = JSON.parse(storedState);
    const updatedState = {
      ...parsedState,
      auth: {
        ...parsedState.auth,
        tokens,
      },
    };
    localStorage.setItem("userDetail", JSON.stringify(updatedState));
  }
};

/**
 * Fetch list of available industries for registration form
 * @returns Promise resolving to array of Industry objects
 * @throws Error with user-friendly message on failure
 */
export const getIndustries = async (): Promise<{ data: { industries: Industry[] } }> => {
  try {
    const response = await apiClient.get<{ data: { industries: Industry[] } }>("/industry/lookup");

    // Validate non-empty response (per clarification #4)
    if (!response.data?.data?.industries || response.data.data.industries.length === 0) {
      throw new Error("No industries available. Please try again later.");
    }

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default apiClient;
