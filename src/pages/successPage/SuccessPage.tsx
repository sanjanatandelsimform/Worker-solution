import insightHero from "@/assets/checkmark-icon.svg";
import { Button } from "@/components/base/buttons/button";
import { useLocation, useNavigate } from "react-router-dom";

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
  const state = (location.state || {}) as {
    messageImg?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonPath?: string;
  };
  return (
    <div className={`flex min-h-screen items-center justify-center bg-secondary ${classess}`}>
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-28">
        <div className="flex w-full max-w-lg flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
            </div>
            <div>
              <img src={successImageSrc || insightHero} alt="Insight hero" className="w-full" />
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
            <Button
              color="primary"
              size="lg"
              className="mt-4"
              onClick={() => navigate(state.buttonPath || "/sign-in")}
            >
              {buttonLabel || state.buttonText || "Let’s Get Started"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
