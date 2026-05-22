import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { syncUserState } from "@/store/slices/authSlice";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const STORAGE_KEY = "userDetail";

/** Read tokens from localStorage (fallback when Redux not yet synced) */
function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const accessToken = parsed?.auth?.tokens?.accessToken;
    const refreshToken = parsed?.auth?.tokens?.refreshToken;
    if (accessToken && refreshToken) return { accessToken, refreshToken };
    return null;
  } catch {
    return null;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerified?: boolean;
  emailNotVerifiedRedirectTo?: string;
}

/**
 * Production ProtectedRoute:
 * - Uses BOTH Redux and localStorage for token check (avoids hydration/timing races)
 * - Only syncs user state ONCE per session (not on every route change)
 * - Only redirects when tokens are truly invalid
 */
export const ProtectedRoute = ({
  children,
  redirectTo = "/sign-in",
  requireEmailVerified = false,
  emailNotVerifiedRedirectTo = "/dashboard",
}: ProtectedRouteProps) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { tokens, user } = useAppSelector(state => state.auth);

  // Track if we've already synced user in this session
  const hasSyncedRef = useRef(false);

  const hasTokensInRedux = !!tokens?.accessToken;
  const hasTokensInStorage = !!getStoredTokens();
  const hasTokens = hasTokensInRedux || hasTokensInStorage;

  useEffect(() => {
    if (hasTokens && !user && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      dispatch(syncUserState());
    }
  }, [hasTokens, user, dispatch]);

  if (!hasTokens) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (hasTokens && !user) {
    return <LoadingSpinner />;
  }

  if (requireEmailVerified && user && !user.emailVerify) {
    return <Navigate to={emailNotVerifiedRedirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
