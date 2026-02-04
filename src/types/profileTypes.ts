// Profile Settings Module Types

export interface User {
  id: string;
  businessEmail: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  user: User;
}

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
}

export interface EmailUpdatePayload {
  email: string;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileState {
  loading: boolean;
  error: string | null;
  passwordAttempts: number;
  isAccountLocked: boolean;
  lockoutExpiry: number | null;
}

export interface ProfileApiResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: User;
    email?: string;
    emailVerify?: boolean;
    [key: string]: unknown;
  };
  attemptsRemaining?: number;
  lockoutDuration?: number;
}

export interface ProfileError {
  message: string;
  code?: string;
  attemptsRemaining?: number;
  lockoutDuration?: number;
}
