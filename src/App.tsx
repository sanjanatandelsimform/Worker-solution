import { Routes, Route, Router } from "react-router-dom";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import DesignReference from "./pages/designReference/DesignReference";
import { SuccessPage } from "./pages/auth/successPages/SuccessPage";
import TermsPage from "./pages/termsPolicy/TermsPage";
import PrivacyPage from "./pages/termsPolicy/PrivacyPage";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";

function App() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/design-reference" element={<DesignReference />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/terms-page" element={<TermsPage />} />
          <Route path="/privacy-page" element={<PrivacyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
        </Routes>
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
