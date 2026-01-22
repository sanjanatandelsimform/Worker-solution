import { Routes, Route, Navigate } from "react-router-dom";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

function App() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/sign-in"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />

          {/* Protected routes - require authentication */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
