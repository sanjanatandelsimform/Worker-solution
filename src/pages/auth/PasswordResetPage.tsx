import React from "react";
import { Link } from "react-router-dom";

export const PasswordResetPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* Lock Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Reset Password
          </h1>

          {/* Description */}
          <p className="mb-6 text-sm text-gray-600">
            Password reset functionality will be implemented in a future update.
            Please contact support if you need to reset your password.
          </p>

          {/* Placeholder Message */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">Coming Soon</p>
            <p className="mt-1">
              This feature is under development and will be available shortly.
            </p>
          </div>

          {/* Back to Sign In Link */}
          <p className="mt-6 text-sm text-gray-600">
            <Link to="/sign-in" className="text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
