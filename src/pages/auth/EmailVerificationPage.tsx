import React from "react";
import { Link } from "react-router-dom";

export const EmailVerificationPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* Email Icon */}
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Verify Your Email
          </h1>

          {/* Description */}
          <p className="mb-6 text-sm text-gray-600">
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account.
          </p>

          {/* Additional Instructions */}
          <div className="space-y-4 text-left">
            <p className="text-sm text-gray-600">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-600">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          {/* Resend Email Button (Placeholder) */}
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled
          >
            Resend Verification Email (Coming Soon)
          </button>

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
