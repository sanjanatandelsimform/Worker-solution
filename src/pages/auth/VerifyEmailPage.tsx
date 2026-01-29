import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/api/authApi";
import { InProgressModal } from "@/components/modals/InProgressModal";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setErrorMessage(
          "Invalid or missing verification token. Please request a new verification email."
        );
        setIsVerifying(false);
        return;
      }

      try {
        await verifyEmail(token);
        // Success - redirect to success page
        navigate("/success", {
          state: {
            messageImg: checkmarkIcon,
            title: "Your email has been verified!",
            subtitle: "Your email has been verified. You can now sign in to your account.",
            buttonText: "Go to Sign In",
            buttonPath: "/sign-in",
          },
        });
      } catch (error) {
        console.error("Email verification error:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify email. The link may have expired. Please request a new verification email."
        );
        setIsVerifying(false);
      }
    };

    handleVerification();
  }, [token, navigate]);

  // Show error state if verification fails
  if (!isVerifying && errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-28">
          <div className="flex w-full max-w-md flex-col items-center gap-8">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
            </div>

            {/* Error Content */}
            <div className="flex w-full flex-col items-center gap-6 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">
                Verification Failed
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-tertiary">
                {errorMessage}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={() => navigate("/sign-in")}
                className="w-full rounded-lg bg-utility-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-utility-brand-700"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show in-progress modal while verifying
  return (
    <InProgressModal
      isOpen={isVerifying}
      onClose={() => {
        // Don't allow closing during verification
      }}
      onGoToDashboard={() => {
        // Disabled during verification
      }}
    />
  );
};

export default VerifyEmailPage;
