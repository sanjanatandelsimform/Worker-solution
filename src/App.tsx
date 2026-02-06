import { Routes, Route, Navigate } from "react-router-dom";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { UnrestrictedRoute } from "./components/routes/UnrestrictedRoute";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { SuccessPage } from "./pages/successPage/SuccessPage";
import PrivacyPage from "./pages/termsPolicy/PrivacyPage";
import TermsPage from "./pages/termsPolicy/TermsPage";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import AssessmentWorkforcePage from "./pages/assessmentWorkforce/AssessmentWorkforce";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";

function App() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes - only accessible when NOT authenticated */}
          <Route
            path="/sign-up"
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
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordForm />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordForm />
              </PublicRoute>
            }
          />

          {/* Unrestricted routes - accessible to everyone */}
          <Route
            path="/success"
            element={
              <UnrestrictedRoute>
                <SuccessPage />
              </UnrestrictedRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <UnrestrictedRoute>
                <VerifyEmailPage />
              </UnrestrictedRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <UnrestrictedRoute>
                <PrivacyPage />
              </UnrestrictedRoute>
            }
          />
          <Route
            path="/terms-page"
            element={
              <UnrestrictedRoute>
                <TermsPage />
              </UnrestrictedRoute>
            }
          />

          {/* Protected routes - only accessible when authenticated */}
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
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AssessmentWorkforcePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
