import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { tokens } = useAppSelector(state => state.auth);

  // Redirect to dashboard if already authenticated
  if (tokens?.accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
