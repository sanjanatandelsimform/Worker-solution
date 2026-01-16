import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegistrationForm } from "../../components/auth/RegistrationForm";
import { GoogleSSOButton } from "../../components/auth/GoogleSSOButton";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSuccess = () => {
    setShowSuccessModal(true);
    // Redirect to email verification after 2 seconds
    setTimeout(() => {
      navigate("/email-verification");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us to start assessing your workforce quality
          </p>
        </div>

        {/* Registration Form */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* Google SSO Button */}
          <GoogleSSOButton text="Sign up with Google" />

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Email/Password Registration Form */}
          <RegistrationForm onSuccess={handleSuccess} />
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2
                id="success-modal-title"
                className="mb-2 text-center text-xl font-bold text-gray-900"
              >
                Account Created Successfully!
              </h2>
              <p className="text-center text-sm text-gray-600">
                Please check your email to verify your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
