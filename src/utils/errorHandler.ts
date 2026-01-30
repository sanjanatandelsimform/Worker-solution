import axios from "axios";

export type ErrorType = "success" | "warning" | "danger" | "info" | "neutral";

export interface ErrorState {
  message: string;
  type: ErrorType;
}

/**
 * Determines the error type based on error characteristics
 * @param error - The error object to analyze
 * @returns ErrorState with appropriate message and type
 */
export const getErrorState = (error: unknown): ErrorState => {
  // Default error state
  let message = "An unexpected error occurred. Please try again.";
  let type: ErrorType = "danger";

  // Handle Axios errors (API errors)
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    message = apiMessage || error.message || message;

    // Determine type based on HTTP status code
    if (status) {
      if (status >= 500) {
        // Server errors
        type = "danger";
        message = apiMessage || "Server error. Please try again later.";
      } else if (status === 404) {
        // Not found
        type = "warning";
        message = apiMessage || "Resource not found.";
      } else if (status === 401 || status === 403) {
        // Authentication/Authorization errors
        type = "warning";
        message = apiMessage || "Unauthorized access.";
      } else if (status === 400) {
        // Bad request / Validation errors
        type = "warning";
        message = apiMessage || "Invalid request. Please check your input.";
      } else if (status === 429) {
        // Rate limiting
        type = "info";
        message = apiMessage || "Too many requests. Please try again later.";
      } else if (status >= 400) {
        // Other client errors
        type = "warning";
      }
    }

    // Check for network errors
    if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
      type = "info";
      message = "Network error. Please check your connection and try again.";
    }

    if (error.code === "ETIMEDOUT") {
      type = "info";
      message = "Request timed out. Please try again.";
    }
  }
  // Handle standard JavaScript errors
  else if (error instanceof Error) {
    message = error.message;

    // Analyze error message content to determine type
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("not found") ||
      lowerMessage.includes("does not exist") ||
      lowerMessage.includes("doesn't exist")
    ) {
      type = "warning";
    } else if (
      lowerMessage.includes("network") ||
      lowerMessage.includes("timeout") ||
      lowerMessage.includes("connection")
    ) {
      type = "info";
    } else if (
      lowerMessage.includes("invalid") ||
      lowerMessage.includes("required") ||
      lowerMessage.includes("must be")
    ) {
      type = "warning";
    } else if (
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("forbidden") ||
      lowerMessage.includes("access denied")
    ) {
      type = "warning";
    } else if (lowerMessage.includes("server error") || lowerMessage.includes("internal error")) {
      type = "danger";
    }
  }

  return { message, type };
};

/**
 * Creates a success state for display
 * @param message - The success message
 * @returns ErrorState with success type
 */
export const getSuccessState = (message: string): ErrorState => {
  return { message, type: "success" };
};

/**
 * Creates an info state for display
 * @param message - The info message
 * @returns ErrorState with info type
 */
export const getInfoState = (message: string): ErrorState => {
  return { message, type: "info" };
};
