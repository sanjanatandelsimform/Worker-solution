import { Navigate, useLocation } from "react-router-dom";

const STORAGE_KEY = "userDetail";

/**
 * Paths that are always accessible without authentication.
 * These include auth pages, legal pages, and email verification.
 */
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/privacy-policy",
  "/terms-page",
];

/** Check if a valid auth token exists in localStorage */
function hasAuthToken(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.auth?.tokens?.accessToken;
  } catch {
    return false;
  }
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Global auth guard that wraps all routes.
 * Redirects to /sign-in when:
 * - No auth token exists in localStorage
 * - Current path is NOT in the public paths whitelist
 *
 * This ensures that on any page refresh without a valid token, the user
 * is always treated as unauthenticated and redirected to sign-in.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Always allow public paths (sign-in, sign-up, etc.)
  if (PUBLIC_PATHS.includes(currentPath)) {
    return <>{children}</>;
  }

  // If auth token exists in localStorage, allow through
  if (hasAuthToken()) {
    return <>{children}</>;
  }

  // No auth token and not a public path → redirect to sign-in
  return <Navigate to="/sign-in" replace />;
};
