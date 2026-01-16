import React from "react";
import { useNavigate } from "react-router-dom";
import { BusinessInfoForm } from "../../components/auth/BusinessInfoForm";
import { useAuth } from "../../hooks/useAuth";

export const BusinessInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSuccess = async () => {
    // Fetch and set the updated user after completing profile
    try {
      const { getCurrentUser } = await import("../../services/api/authApi");
      const user = await getCurrentUser();
      if (user) {
        setUser(user);
      }
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to fetch user after profile completion:", error);
      // Still redirect to dashboard
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tell us more about your business to get started
          </p>
        </div>

        {/* Business Info Form */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <BusinessInfoForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};
