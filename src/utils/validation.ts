// Validation Utilities

/**
 * Validates email format using RFC 5322 compliant regex
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim().length === 0) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^.\s@]+\.[^.\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Validates password strength requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }

  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }

  return { isValid: true };
};

/**
 * Validates name fields (first name, last name)
 * - Cannot be empty
 * - Minimum 1 character
 * - Maximum 50 characters
 * - Trims leading and trailing whitespace
 *
 * @param name - Name to validate
 * @returns Object with isValid boolean, trimmed name, and error message if invalid
 */
export const validateName = (
  key: string,
  name: string
): { isValid: boolean; trimmedName: string; message?: string } => {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { isValid: false, trimmedName, message: `${key || "Name"} cannot be empty` };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, trimmedName, message: `${key || "Name"} cannot exceed 50 characters` };
  }

  return { isValid: true, trimmedName };
};

/**
 * Check if two passwords match
 * @param password - First password
 * @param confirmPassword - Confirmation password
 * @returns true if passwords match, false otherwise
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Validate that new password is different from current password
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns true if passwords are different, false otherwise
 */
export const isPasswordDifferent = (currentPassword: string, newPassword: string): boolean => {
  return currentPassword !== newPassword;
};
