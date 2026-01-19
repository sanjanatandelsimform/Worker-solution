import axios, { AxiosError } from "axios";
import type {
  RegistrationData,
  SignInData,
  BusinessInfoData,
  AuthResponse,
  UserAccount,
  EmailCheckResponse,
  ApiError,
} from "../../types/auth";

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000, // 10-second timeout
  withCredentials: true, // Include HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in page on unauthorized
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  },
);

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

// Authentication API Functions

/**
 * Register a new user account with business information
 */
export const signup = async (data: RegistrationData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/signup", {
      firstName: data.firstName,
      lastName: data.lastName,
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      industry: data.industry,
      zipCode: data.zipCode,
      password: data.password,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Sign in an existing user
 */
export const signin = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/signin", {
      businessEmail: data.businessEmail,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Sign out the current user
 */
export const signout = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/signout");
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<UserAccount | null> => {
  try {
    const response = await apiClient.get<{ user: UserAccount | null }>(
      "/auth/me",
    );
    return response.data.user;
  } catch (error) {
    // Don't throw on 401 - just return null (user not authenticated)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Check if an email is available for registration
 */
export const checkEmailAvailability = async (
  email: string,
): Promise<boolean> => {
  try {
    const response = await apiClient.post<EmailCheckResponse>(
      "/auth/check-email",
      { email },
    );
    return response.data.available;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Submit business information for Google SSO users
 */
export const submitBusinessInfo = async (
  data: BusinessInfoData,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/complete-profile",
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default apiClient;
