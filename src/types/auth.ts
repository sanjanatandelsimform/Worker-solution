// Authentication Types for Business Onboarding Module

export type Industry =
  | "Manufacturing"
  | "Retail"
  | "Healthcare"
  | "Technology"
  | "Finance"
  | "Construction"
  | "Education"
  | "Hospitality"
  | "Transportation"
  | "Other";

export type AuthMethod = "email" | "google";

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phoneNumber: string;
  industry: Industry;
  zipCode: string;
  authMethod: AuthMethod;
  emailVerified: boolean;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  industry: Industry;
  zipCode: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface SignInData {
  email: string;
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

export interface EmailCheckResponse {
  available: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
