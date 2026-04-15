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

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const STORAGE_KEY = "userDetail";

/**
 * Get authentication token from localStorage.
 * Single source of truth used by all API services.
 * @returns Bearer token or null if not found
 */
export const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.auth?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
};

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

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred. Please try again.";
};

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

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const dispatchLogout = () => {
  if (
    typeof window !== "undefined" &&
    (window as { store?: { dispatch: (a: unknown) => void } }).store
  ) {
    import("@/store/slices/authSlice").then(({ logout: logoutAction }) => {
      (window as { store: { dispatch: (a: unknown) => void } }).store.dispatch(logoutAction());
    });
    window.location.href = "/sign-in";
  }
};

// UPDATED Response interceptor with improved token storage handling
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

    const storedState = localStorage.getItem(STORAGE_KEY);
    if (!storedState) {
      return Promise.reject(error);
    }

    let parsedState;
    try {
      parsedState = JSON.parse(storedState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      dispatchLogout();
      return Promise.reject(error);
    }

    const refreshToken = parsedState?.auth?.tokens?.refreshToken;

    if (!refreshToken) {
      localStorage.removeItem(STORAGE_KEY);
      dispatchLogout();
      return Promise.reject(error);
    }

    // Queue requests while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refreshAccessToken which handles storage update internally
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshAccessToken(refreshToken);

      // CRITICAL: Re-read and update localStorage to ensure tokens are persisted
      // refreshAccessToken already updates, but we do a defensive re-write here
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

      // Update axios default header for all future requests
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

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

      // Update original request header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // Process queued requests with new token
      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request with new token
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Clear tokens and logout on refresh failure
      processQueue(refreshError as Error, null);
      isRefreshing = false;
      localStorage.removeItem(STORAGE_KEY);
      dispatchLogout();
      return Promise.reject(refreshError);
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
