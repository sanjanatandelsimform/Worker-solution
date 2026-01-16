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
      <>
        {/* Sign In Form */}
        <div className="w-full">
          <SignInForm />
        </div>
      </>
      
  );
};
