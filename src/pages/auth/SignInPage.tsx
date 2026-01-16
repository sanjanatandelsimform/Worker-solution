import React from "react";
import { useNavigate } from "react-router-dom";
import { SignInForm } from "../../components/auth/SignInForm";
import { GoogleSSOButton } from "../../components/auth/GoogleSSOButton";
import { useAuth } from "../../hooks/useAuth";

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSuccess = async () => {
    // Fetch and set the current user after successful sign-in
    try {
      const { getCurrentUser } = await import("../../services/api/authApi");
      const user = await getCurrentUser();
      if (user) {
        setUser(user);
      }
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to fetch user after sign-in:", error);
      // Still redirect to dashboard - the app will handle auth state
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Sign In Form */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* Google SSO Button */}
          <GoogleSSOButton text="Sign in with Google" />

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Email/Password Sign In Form */}
          <SignInForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};
