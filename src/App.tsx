import { Routes, Route } from "react-router-dom";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { SignInPage } from "./pages/auth/SignInPage";
import { EmailVerificationPage } from "./pages/auth/EmailVerificationPage";
import { PasswordResetPage } from "./pages/auth/PasswordResetPage";
import { BusinessInfoPage } from "./pages/auth/BusinessInfoPage";
import DemoComponents from "./pages/DemoComponents";
import SignInForm from "./components/auth/SignInForm";
import RegistrationForm from "./components/auth/RegistrationForm";
import { LogoutVerificationPage } from "./pages/auth/LogoutVerificationPage";
import DashboardDemo from "./pages/DashboardDemo";

// Placeholder pages - will be implemented in subsequent phases
const HomePage = () => <div className="p-8">Home Page</div>;
const DashboardPage = () => <div className="p-8">Dashboard Page</div>;

function App() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/sign-in" element={<SignInForm />} />
          <Route path="/demo-components" element={<DemoComponents />} />
          <Route
            path="/onboarding/business-info"
            element={<BusinessInfoPage />}
          />
          <Route
            path="/email-verification"
            element={<EmailVerificationPage />}
          />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route
            path="/logout-verification"
            element={<LogoutVerificationPage />}
          />
          <Route path="/dashboard" element={<DashboardDemo />} />
          <Route path="/dashboard-demo" element={<DashboardDemo />} />
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
