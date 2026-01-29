import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { tokens } = useAppSelector(state => state.auth);
  const location = useLocation();

  // Only redirect to dashboard if logged in and not on /success
  if (tokens?.accessToken && location.pathname !== "/success") {
    return <Navigate to="/dashboard" replace />;
  }

  // Do NOT redirect to /sign-in if not authenticated and on /success
  return <>{children}</>;
};
