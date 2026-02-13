import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/api/authApi";
import checkmarkIcon from "@/assets/checkmark-icon.svg";
import { useAppDispatch } from "@/store/hooks";
import { updateUser, setTokens } from "@/store/slices/authSlice";
import { Oval } from "react-loader-spinner";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
        const response = await verifyEmail(token);

        // Update localStorage with verified user data and new tokens
        if (response.user && response.tokens) {
          const userDetail = localStorage.getItem("userDetail");

          if (userDetail) {
            try {
              const parsedUserDetail = JSON.parse(userDetail);

              // Update the user data with emailVerify: true and new tokens
              const updatedUserDetail = {
                ...parsedUserDetail,
                auth: {
                  ...parsedUserDetail.auth,
                  user: {
                    ...parsedUserDetail.auth.user,
                    id: response.user.id,
                    businessEmail: response.user.businessEmail,
                    emailVerify: response.user.emailVerify,
                  },
                  tokens: {
                    accessToken: response.tokens.accessToken,
                    refreshToken: response.tokens.refreshToken,
                  },
                },
              };

              // Save updated data to localStorage
              localStorage.setItem("userDetail", JSON.stringify(updatedUserDetail));

              // Update Redux store
              dispatch(
                updateUser({
                  id: response.user.id,
                  businessEmail: response.user.businessEmail,
                  emailVerify: response.user.emailVerify,
                })
              );

              dispatch(
                setTokens({
                  accessToken: response.tokens.accessToken,
                  refreshToken: response.tokens.refreshToken,
                })
              );
            } catch (error) {
              console.error("Failed to update localStorage:", error);
            }
          }
        }

        // Success - redirect to success page
        navigate("/success", {
          state: {
            messageImg: checkmarkIcon,
            title: "Your email has been verified!",
            subtitle: "Welcome aboard! Start your success journey with Worker Solutions®",
            buttonText: "Take the Assessment",
            buttonPath: "/assessment",
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
  }, [token, navigate, dispatch]);

  // Show error state if verification fails
  if (!isVerifying && errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-22">
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

  // Show simple loader while verifying
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Oval
        height={80}
        width={80}
        color="#06b6d4"
        wrapperClass="flex items-center justify-center"
        visible={true}
        ariaLabel="oval-loading"
        secondaryColor="#0891b2"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  );
};

export default VerifyEmailPage;
