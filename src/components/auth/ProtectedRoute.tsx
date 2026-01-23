import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { tokens } = useAppSelector(state => state.auth);

  // Redirect to sign-in if no access token
  if (!tokens?.accessToken) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};
