import axios, { AxiosError } from "axios";
import type {
  RegistrationData,
  SignInData,
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

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
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
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await apiClient.post<{
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    }>("/auth/refresh-token", {
      refreshToken,
    });
    return response.data.tokens;
  } catch (error) {
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

// Response interceptor for 401 handling with token refresh
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

    // Get stored tokens
    const storedState = localStorage.getItem("userDetail");
    if (!storedState) {
      if (typeof window !== "undefined") {
        // window.location.href = "/sign-in";
      }
      return Promise.reject(error);
    }

    const parsedState = JSON.parse(storedState);
    const refreshToken = parsedState?.auth?.tokens?.refreshToken;

    if (!refreshToken) {
      localStorage.removeItem("userDetail");
      if (typeof window !== "undefined") {
        // window.location.href = "/sign-in";
      }
      return Promise.reject(error);
    }

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
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshAccessToken(refreshToken);

      // Update stored tokens
      const updatedState = {
        ...parsedState,
        auth: {
          ...parsedState.auth,
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        },
      };
      localStorage.setItem("userDetail", JSON.stringify(updatedState));

      // Dispatch Redux action to update tokens in store
      if (typeof window !== "undefined" && (window as { store?: unknown }).store) {
        const { setTokens } = await import("@/store/slices/authSlice");
        (window as { store: { dispatch: (action: unknown) => void } }).store.dispatch(
          setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          })
        );
      }

      // Update Authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      isRefreshing = false;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      isRefreshing = false;
      localStorage.removeItem("userDetail");
      if (typeof window !== "undefined") {
        // window.location.href = "/sign-in";
      }
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Register a new user account with business information
 */
export const signup = async (data: RegistrationData): Promise<UserAccount> => {
  try {
    const response = await apiClient.post<UserAccount>("/users/create", {
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
    return response.data;
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
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<UserAccount | null> => {
  try {
    const response = await apiClient.get<{ user: UserAccount | null }>("/auth/me");
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
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
