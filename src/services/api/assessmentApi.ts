import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { mapMonthToApiValue } from "@/utils/monthUtils";
import type { ZipCodeLookupResponse } from "@/types/lookupTypes";

/**
 * Assessment API Service
 * Handles all API calls for assessment submission and feedback
 */

const API_TIMEOUT = 10000; // 10 seconds

// Helper to get auth token: prefer Redux store (so post-verify token is used immediately), then localStorage
const getAuthToken = (): string | null => {
  try {
    const win = typeof window !== "undefined" ? window : null;
    const store =
      win &&
      (
        win as {
          store?: { getState: () => { auth?: { tokens?: { accessToken?: string | null } } } };
        }
      ).store;
    const fromStore = store ? store.getState?.()?.auth?.tokens?.accessToken : null;
    if (fromStore) return fromStore;

    const userDetail = localStorage.getItem("userDetail");
    if (userDetail) {
      const parsed = JSON.parse(userDetail);
      return parsed?.auth?.tokens?.accessToken || null;
    }
    return localStorage.getItem("auth_token");
  } catch (error) {
    console.error("Failed to retrieve auth token:", error);
    return null;
  }
};

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1",
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("[AssessmentAPI] No auth token found in localStorage");
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * API Response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * API Error type
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface AssessmentData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sections: {
    workforce?: Record<string, unknown>;
    compensation?: Record<string, unknown>;
    benefits?: Record<string, unknown>;
    goals?: Record<string, unknown>;
  };
  status: "in_progress" | "completed";
  completionPercentage: number;
}

export type SectionType = "workforce" | "compensation" | "benefits" | "goals";

/**
 * State option as returned by the lookup API
 */
export interface StateOptionApi {
  stateAbbreviation: string;
  stateName: string;
  stateFips?: string;
}

/**
 * Response envelope for GET /lookup/states
 */
export interface StatesLookupResponse {
  data: {
    states: StateOptionApi[];
  };
}

/**
 * Fetch the list of US states from the lookup API.
 * Reuses the existing `api` axios instance with auth interceptors.
 */
export const getStates = async (): Promise<StatesLookupResponse> => {
  const response = await api.get("/lookup/states");
  return response.data;
};

/**
 * Submit Workforce assessment
 */
export const submitWorkforce = async (responses: Record<string, unknown>): Promise<ApiResponse> => {
  try {
    const transformWorkforceResponses = (
      input: Record<string, unknown>
    ): Record<string, unknown> => {
      const out = { ...input };
      if (out.employeeCommuteMethod !== undefined) {
        out.commuteMethod = out.employeeCommuteMethod;
        delete out.employeeCommuteMethod;
      }
      if (out.averageCommuteTime !== undefined) {
        out.commuteTime = out.averageCommuteTime;
        delete out.averageCommuteTime;
      }

      return out;
    };

    const transformed = transformWorkforceResponses(responses);

    const response = await api.post("/assessment/workforce", {
      responses: transformed,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Submit Compensation assessment
 */
export const submitCompensation = async (
  responses: Record<string, unknown>
): Promise<ApiResponse> => {
  // Normalize compensation-specific fields (minimal transformation for backward compatibility)
  const transformCompensationResponses = (input: Record<string, unknown>) => {
    const out = { ...input };

    // Normalize offersAnnualRaises (accepts multiple incoming key names/values)
    const booleanFromString = (v: unknown): boolean | undefined => {
      if (typeof v === "boolean") return v;
      if (v === null || v === undefined) return undefined;
      const s = String(v).trim().toLowerCase();
      if (["yes", "true", "y", "1"].includes(s)) return true;
      if (["no", "false", "n", "0", "unsure"].includes(s)) return false;
      return undefined;
    };

    const offersCandidates = [
      "offersAnnualRaises",
      "offersRaises",
      "offers_annual_raises",
      "offers_raise",
    ];
    for (const c of offersCandidates) {
      if (input[c] !== undefined) {
        const b = booleanFromString(input[c]);
        if (typeof b === "boolean") {
          out.offersAnnualRaises = b;
          break;
        }
      }
    }

    // Map various possible month keys into the expected annualRaiseMonth
    const monthCandidates = [
      "annualRaiseMonth",
      "raiseMonth",
      "raise_month",
      "annual_raise_month",
      "annualRaise",
    ];
    for (const m of monthCandidates) {
      if (input[m] !== undefined && input[m] !== null && input[m] !== "") {
        out.annualRaiseMonth = input[m];
        break;
      }
    }

    // Normalize month value to backend enum using utility function
    if (
      out.annualRaiseMonth !== undefined &&
      out.annualRaiseMonth !== null &&
      out.annualRaiseMonth !== ""
    ) {
      out.annualRaiseMonth = mapMonthToApiValue(out.annualRaiseMonth as string);
    }

    if (input.handlesPayrollInHouse !== undefined && out.handlesHRPayrollInHouse === undefined) {
      out.handlesHRPayrollInHouse = input.handlesPayrollInHouse;
    }

    return out;
  };

  try {
    const transformed = transformCompensationResponses(responses);

    if (transformed.offersAnnualRaises && !transformed.annualRaiseMonth) {
      console.warn(
        "[submitCompensation] Validation: offersAnnualRaises=true but annualRaiseMonth missing. Aborting request."
      );
      return {
        success: false,
        error: "Annual raise month is required when annual raises are offered",
        message: "Validation Error: annualRaiseMonth is required when offersAnnualRaises is true",
      };
    }
    const response = await api.post("/assessment/compensation", {
      responses: transformed,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Submit Benefits assessment
 */
export const submitBenefits = async (responses: Record<string, unknown>): Promise<ApiResponse> => {
  try {
    // Log payload before API call to verify types

    if (responses.lowestHealthPlanPremium !== undefined) {
      console.log("[submitBenefits] lowestHealthPlanPremium:", {
        value: responses.lowestHealthPlanPremium,
        type: typeof responses.lowestHealthPlanPremium,
        isNumber: typeof responses.lowestHealthPlanPremium === "number",
      });
    }

    const response = await api.post("/assessment/benefits", {
      responses,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Submit Goals assessment
 */
export const submitGoals = async (responses: Record<string, unknown>): Promise<ApiResponse> => {
  try {
    const response = await api.post("/assessment/goals", {
      responses,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Submit feedback (optional after assessment completion)
 */
export const submitFeedback = async (rating: number, comments?: string): Promise<ApiResponse> => {
  try {
    const response = await api.post("/assessment/feedback", {
      rating,
      comments,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get assessment status (check which sections are completed)
 */
export const getAssessmentStatus = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get("/assessment/status");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Handle API errors uniformly
 */
const handleApiError = <T = unknown>(error: unknown): ApiResponse<T> => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      errors?: Record<string, string>; // Backend validation errors
    }>;

    if (axiosError.response) {
      // Extract field-level validation errors from backend
      const fieldErrors: Record<string, string> = {};

      if (axiosError.response.data?.errors) {
        // Parse dynamic error keys like "responses.topWorkLocations.0.zipCode"
        Object.entries(axiosError.response.data.errors).forEach(([key, message]) => {
          // Remove "responses." prefix and convert to user-friendly key
          const cleanKey = key.replace(/^responses\./, "");
          fieldErrors[cleanKey] = message;
        });
      }

      return {
        success: false,
        error:
          axiosError.response.data?.message ||
          axiosError.response.data?.error ||
          "Server error occurred",
        message: axiosError.response.data?.message || "Validation Error",
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      };
    } else if (axiosError.request) {
      return {
        success: false,
        error: "No response from server. Please check your connection.",
        message: "Network error",
      };
    } else if (axiosError.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Request timed out after 10 seconds. Please try again.",
        message: "Timeout error",
      };
    }
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "An unknown error occurred",
    message: "Request failed",
  };
};

/**
 * Get Assessment Data
 * Retrieves previously submitted assessment data for all sections
 */
export const getAssessment = async (): Promise<ApiResponse<AssessmentData>> => {
  try {
    const response = await api.get<{ data: AssessmentData }>("/assessment");
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError<AssessmentData>(error);
  }
};

/**
 * Lookup zip codes by prefix.
 *
 * Calls `GET /lookup/zip-codes?search={query}&limit=5` and returns the typed response.
 * On any error the function returns a safe empty-result object instead of
 * throwing, so callers can always destructure `data.zipCodes`.
 *
 * @param query - Partial zip code (2-5 digits)
 * @returns Typed lookup response (or empty result on error)
 */
export const lookupZipCodes = async (query: string): Promise<ZipCodeLookupResponse> => {
  try {
    const response = await api.get<ZipCodeLookupResponse>("/lookup/zip-codes", {
      params: { search: query, limit: 5 },
    });
    return response.data;
  } catch {
    return {
      success: false,
      data: {
        zipCodes: [],
        pagination: { page: 1, limit: 5, totalRecords: 0, totalPages: 0 },
      },
      message: "Failed to fetch zip codes",
    };
  }
};

/**
 * Response interceptor: handle 401 -> refresh token -> retry original request
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (err?: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token || undefined)));
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (isRefreshing) {
          return new Promise<unknown>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (originalRequest.headers && typeof token === "string") {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          });
        }

        isRefreshing = true;

        const stored = localStorage.getItem("userDetail");
        const parsed: {
          auth?: { tokens?: { refreshToken?: string; accessToken?: string } };
        } | null = stored ? JSON.parse(stored) : null;
        const refreshToken = parsed?.auth?.tokens?.refreshToken;

        if (!refreshToken) {
          localStorage.removeItem("userDetail");
          return Promise.reject(error);
        }

        const refreshClient = axios.create({
          baseURL: import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1",
          timeout: API_TIMEOUT,
          headers: { "Content-Type": "application/json" },
        });

        const refreshResp = await refreshClient.post<{
          status: boolean;
          message: string;
          data: {
            tokens: { accessToken: string; refreshToken: string };
          };
        }>("/auth/refresh-token", { refreshToken });

        const tokens = refreshResp.data?.data?.tokens;

        if (!tokens?.accessToken || !tokens?.refreshToken) {
          localStorage.removeItem("userDetail");
          processQueue(new Error("Invalid refresh response"), null);
          return Promise.reject(error);
        }

        // CRITICAL: Re-read localStorage to avoid overwriting concurrent changes,
        // then write the new tokens
        try {
          const freshStored = localStorage.getItem("userDetail");
          const freshParsed = freshStored ? JSON.parse(freshStored) : {};
          freshParsed.auth = freshParsed.auth || {};
          freshParsed.auth.tokens = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
          freshParsed.auth.isAuthenticated = true;
          localStorage.setItem("userDetail", JSON.stringify(freshParsed));
        } catch (storageError) {
          console.error("[assessmentApi] Failed to persist refreshed tokens:", storageError);
        }

        // Update axios default header for future requests on this instance
        api.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;

        // Update original request header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        // Sync Redux store if available
        if (typeof window !== "undefined" && (window as { store?: unknown }).store) {
          try {
            const { setTokens } = await import("@/store/slices/authSlice");
            (window as { store: { dispatch: (action: unknown) => void } }).store.dispatch(
              setTokens({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
              })
            );
          } catch (reduxError) {
            console.error("[assessmentApi] Failed to sync tokens to Redux:", reduxError);
          }
        }

        processQueue(null, tokens.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api };
