import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { updateUser, setTokens } from "@/store/slices/authSlice";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { UserAccount } from "@/types/auth";
import siteLogo from "@/assets/logo.svg";
import checkmarkIcon from "@/assets/success-check.svg";

const STORAGE_KEY = "userDetail";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = searchParams.get("token");
  const emailParam = searchParams.get("emailChange");

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

        if (response.user && response.tokens) {
          const { user: apiUser, tokens: apiTokens } = response;
          let existing: { auth?: { user?: UserAccount }; registrationForm?: unknown } = {};
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) existing = JSON.parse(raw);
          } catch {
            // ignore
          }

          const isSameBrowser = !!existing?.auth?.user;

          if (isSameBrowser) {
            // Same browser: update existing auth
            dispatch(
              updateUser({
                id: apiUser.id,
                businessEmail: apiUser.businessEmail,
                emailVerify: apiUser.emailVerify,
              })
            );
            dispatch(setTokens(apiTokens));
          } else {
            // Cross-browser: create new auth session (tokens only; user will be synced by ProtectedRoute)
            const next = {
              ...existing,
              auth: {
                ...(existing.auth || {}),
                user: {
                  ...(existing.auth?.user || ({} as UserAccount)),
                  id: apiUser.id,
                  businessEmail: apiUser.businessEmail,
                  emailVerify: apiUser.emailVerify,
                },
                isAuthenticated: true,
                tokens: apiTokens,
              },
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            dispatch(setTokens(apiTokens));
            dispatch(
              updateUser({
                id: apiUser.id,
                businessEmail: apiUser.businessEmail,
                emailVerify: apiUser.emailVerify,
              })
            );
          }
        }

        // Navigate based on email parameter
        if (emailParam === "true") {
          // New flow: redirect to success page for email verification
          navigate("/success", {
            state: {
              messageImg: checkmarkIcon,
              title: "Email has been verified!",
              subtitle: "All set! Your email has been updated.",
              buttonText: "Log in",
              buttonPath: "/sign-in",
              shouldClearUser: true,
            },
          });
        } else {
          // Existing flow: redirect to dashboard
          navigate("/dashboard", {
            state: { emailVerified: true },
            replace: true,
          });
        }
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
  }, [token, emailParam, navigate, dispatch]);

  if (!isVerifying && errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-ws-border-primary bg-ws-base-white py-22">
          <div className="flex w-full max-w-md flex-col items-center gap-8">
            <div className="flex items-center justify-center px-2 py-1">
              <img src={siteLogo} alt="Logo" className="max-w-80" />
            </div>
            <div className="flex w-full flex-col items-center gap-6 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-ws-text-primary">
                Verification Failed
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-ws-text-tertiary">
                {errorMessage}
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={() => navigate("/sign-in")}
                className="w-full rounded-lg bg-utility-brand-600 px-4 py-3 text-base font-semibold text-ws-base-white hover:bg-utility-brand-700"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
};

export default VerifyEmailPage;
