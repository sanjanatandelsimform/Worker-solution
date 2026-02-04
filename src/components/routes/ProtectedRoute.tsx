import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Path to redirect to if user is not authenticated (default: /sign-in) */
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, redirectTo = "/sign-in" }: ProtectedRouteProps) => {
  const { tokens } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (!tokens?.accessToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
