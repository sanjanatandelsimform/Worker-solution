import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { updateUser, setTokens } from "@/store/slices/authSlice";
import checkmarkIcon from "@/assets/finch-checkmark.svg";
import { Oval } from "react-loader-spinner";
import type { UserAccount } from "@/types/auth";
import siteLogo from "@/assets/logo.svg";

const STORAGE_KEY = "userDetail";

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

        navigate("/success", {
          state: {
            messageImg: checkmarkIcon,
            title: "Your email has been verified!",
            subtitle: "Welcome aboard! Start your success journey with BeneStats®",
            buttonText: "Take the Assessment",
            buttonPath: "/assessment",
            user: response.user ?? undefined,
            tokens: response.tokens ?? undefined,
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

  if (!isVerifying && errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-ws-primary-100 bg-ws-white py-22">
          <div className="flex w-full max-w-md flex-col items-center gap-8">
            <div className="flex items-center justify-center px-2 py-1">
              <img src={siteLogo} alt="Logo" className="max-w-80" />
            </div>
            <div className="flex w-full flex-col items-center gap-6 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-ws-black">
                Verification Failed
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-ws-black-10">
                {errorMessage}
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={() => navigate("/sign-in")}
                className="w-full rounded-lg bg-utility-brand-600 px-4 py-3 text-base font-semibold text-ws-white hover:bg-utility-brand-700"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Oval
        height={80}
        width={80}
        color="#06b6d4"
        wrapperClass="flex items-center justify-center"
        visible
        ariaLabel="oval-loading"
        secondaryColor="#0891b2"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  );
};

export default VerifyEmailPage;
