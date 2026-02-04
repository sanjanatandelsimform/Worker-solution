import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
  /** Path to redirect to if user is authenticated (default: /dashboard) */
  redirectTo?: string;
}

export const PublicRoute = ({ children, redirectTo = "/dashboard" }: PublicRouteProps) => {
  const { tokens } = useAppSelector(state => state.auth);

  if (tokens?.accessToken) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
