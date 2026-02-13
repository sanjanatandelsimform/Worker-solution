import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { clearUser, setUser } from "@/store/slices/authSlice";
import { Button } from "@/components/base/buttons/button";
import insightHero from "@/assets/checkmark-icon.svg";
import type { UserAccount } from "@/types/auth";

export interface SuccessCardProps {
  successImageSrc?: string;
  title?: string;
  descriptionText?: string;
  buttonLabel?: string;
  classess?: string;
}

export const SuccessPage: React.FC<SuccessCardProps> = ({
  successImageSrc,
  title,
  descriptionText,
  buttonLabel,
  classess,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const state = (location.state || {}) as {
    messageImg?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonPath?: string;
    shouldClearUser?: boolean;
    user?: UserAccount;
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  };

  // Clear user state and storage if coming from logout
  useEffect(() => {
    if (state.shouldClearUser) {
      dispatch(clearUser());
      // dispatch(clearProfileData());
      localStorage.removeItem("userDetail");
      sessionStorage.removeItem("registrationFormData");
      sessionStorage.removeItem("registrationFormActive");
      localStorage.clear();
    }
    // Only run once on mount
    // eslint-disable-next-line
  }, []);

  // Get user from location.state
  const user = state.user;
  const tokens = state.tokens;

  // Handler for button click - stores user data and navigates
  const handleButtonClick = () => {
    // Store user data in Redux when button is clicked (if user exists)
    if (user && tokens) {
      dispatch(
        setUser({
          user: {
            id: user.id,
            businessEmail: user.businessEmail || "",
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.businessName,
            phoneNumber: user.businessPhone || user.phoneNumber,
            industry: user.industry,
            zipCode: typeof user.zipCode === "string" ? parseInt(user.zipCode) : user.zipCode,
            authMethod: user.googleId ? "google" : "email",
            emailVerify: user.emailVerify ?? false,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          tokens,
        })
      );
    }
    navigate(state.buttonPath || "/sign-in");
  };

  return (
    <div className={`flex min-h-screen items-center justify-center bg-secondary ${classess}`}>
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-22">
        <div className="flex w-full max-w-lg flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
            </div>
            <div>
              <img
                src={successImageSrc || state.messageImg || insightHero}
                alt="Success"
                className="w-full"
              />
            </div>

            {/* Title and Description */}
            <div className="prose flex flex-col w-full items-center justify-center text-center">
              <h2 className="w-full text-primary">
                {title || state.title || "Thanks for signing up!"}
              </h2>
              <p className="max-w-sm text-2xl font-normal leading-8 text-subtitle">
                {descriptionText ||
                  state.subtitle ||
                  "Welcome aboard! Start your success journey with BeneStat"}
              </p>
            </div>
            <Button color="primary" size="lg" className="mt-4" onClick={handleButtonClick}>
              {buttonLabel || state.buttonText || "Let's Get Started"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
