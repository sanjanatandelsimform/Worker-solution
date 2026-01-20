import { Routes, Route } from "react-router-dom";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";

function App() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
