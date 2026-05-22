/**
 * Represents the user registration request payload.
 * Contains all required fields for creating a new user account.
 */
export interface UserRegistration {
  /** Full name of the user */
  name: string;
  /** User's email address (must be unique) */
  email: string;
  /** User's password (minimum 8 characters) */
  password: string;
}

/**
 * Represents a user entity in the response.
 * Contains user data without sensitive information like passwords.
 */
export interface UserResponse {
  /** Unique identifier for the user */
  id: string;
  /** Full name of the user */
  name: string;
  /** User's email address */
  email: string;
  /** Timestamp when the user account was created */
  createdAt: Date;
}

/**
 * Represents an error response structure.
 * Can include field-specific validation errors.
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Optional field-specific validation errors (field name -> array of error messages) */
  errors?: Record<string, string[]>;
}

/**
 * Generic API response wrapper.
 * Provides consistent response format for all endpoints.
 * 
 * @template T - The type of data returned on success
 * 
 * @example
 * // Success response
 * const response: ApiResponse<UserResponse> = {
 *   success: true,
 *   data: { id: '123', name: 'John', email: 'john@example.com', createdAt: new Date() }
 * };
 * 
 * @example
 * // Error response
 * const response: ApiResponse<never> = {
 *   success: false,
 *   error: { message: 'Validation failed', errors: { email: ['Invalid format'] } }
 * };
 */
export interface ApiResponse<T> {
  /** Indicates whether the request was successful */
  success: boolean;
  /** Response data (present when success is true) */
  data?: T;
  /** Error information (present when success is false) */
  error?: ApiError;
}
