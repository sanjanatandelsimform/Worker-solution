// Session Management Utilities

export type ModalType =
  | "profile"
  | "email"
  | "password"
  | "changePassword"
  | "updateEmail"
  | "deleteAccount"
  | "retakeAssessment";

interface ModalContext {
  modalType: ModalType;
  formData?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * Check if user session is still valid
 * @returns true if session is valid, false otherwise
 */
export const isSessionValid = (): boolean => {
  const userDetail = localStorage.getItem("userDetail");
  if (!userDetail) {
    return false;
  }

  try {
    const userData = JSON.parse(userDetail);
    const tokens = userData?.tokens;

    if (!tokens?.accessToken) {
      return false;
    }

    // Check if token is expired (basic check)
    // In production, you should decode JWT and check exp claim
    return true;
  } catch {
    return false;
  }
};

/**
 * Save modal context to sessionStorage before redirect
 * @param context - The modal context to save
 */
export const saveModalContext = (context: ModalContext): void => {
  try {
    sessionStorage.setItem("modalContext", JSON.stringify(context));
  } catch (error) {
    console.error("Failed to save modal context:", error);
  }
};

/**
 * Restore modal context from sessionStorage
 * @returns The saved modal context or null
 */
export const restoreModalContext = (): ModalContext | null => {
  try {
    const context = sessionStorage.getItem("modalContext");
    if (context) {
      sessionStorage.removeItem("modalContext"); // Clear after reading
      return JSON.parse(context);
    }
    return null;
  } catch (error) {
    console.error("Failed to restore modal context:", error);
    return null;
  }
};

/**
 * Clear sensitive data from modal context
 * @param formData - The form data to sanitize
 * @returns Sanitized form data without passwords
 */
export const sanitizeFormData = (formData: Record<string, string>): Record<string, string> => {
  const sanitized = { ...formData };
  delete sanitized.currentPassword;
  delete sanitized.newPassword;
  delete sanitized.confirmPassword;
  delete sanitized.password;
  return sanitized;
};
