import { Routes, Route } from "react-router-dom";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

function App() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
