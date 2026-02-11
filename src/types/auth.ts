// Authentication Types for Business Onboarding Module

export interface Industry {
  id: number;
  industry_name: string;
  industry_code: string;
}

export type AuthMethod = "email" | "google";

export interface UserAccount {
  id: string;
  // email: string;
  businessEmail?: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phoneNumber: string;
  businessPhone?: string;
  industry: string;
  zipCode: number;
  authMethod?: "email" | "google";
  emailVerify: boolean;
  googleId?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: string | null;
  refreshToken?: string | null;
  count?: number;
  // profileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  industry: string;
  zipCode: number;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface SignInData {
  businessEmail: string;
  password: string;
  rememberMe: boolean;
}

export interface BusinessInfoData {
  businessName: string;
  phoneNumber: string;
  industry: Industry;
  zipCode: string;
}

export interface AuthSession {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserAccount;
}

export interface SignInResponse {
  user: UserAccount;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface EmailCheckResponse {
  available: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
