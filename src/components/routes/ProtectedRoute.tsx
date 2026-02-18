import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { syncUserState } from "@/store/slices/authSlice";
import { Oval } from "react-loader-spinner";

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
 * - Only redirects when accessToken is invalid AND refresh fails
 * - Token validation: axios interceptor handles 401 + refresh; ProtectedRoute trusts
 *   stored tokens until syncUserState/getCurrentUser explicitly fails
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

  const hasTokensInRedux = !!tokens?.accessToken;
  const hasTokensInStorage = !!getStoredTokens();
  const hasTokens = hasTokensInRedux || hasTokensInStorage;

  useEffect(() => {
    if (!hasTokens || user) return;
    dispatch(syncUserState());
  }, [hasTokens, user, dispatch]);

  if (!hasTokens) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (hasTokens && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Oval
          height={48}
          width={48}
          color="#06b6d4"
          wrapperClass="flex items-center justify-center"
          visible
          ariaLabel="loading"
          secondaryColor="#0891b2"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
    );
  }

  if (requireEmailVerified && user && !user.emailVerify) {
    return <Navigate to={emailNotVerifiedRedirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
