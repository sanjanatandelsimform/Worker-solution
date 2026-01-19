import { Button } from "@/components/base/buttons/button";
import checkmarkIcon from "@/assets/checkmark-icon.svg";

interface SuccessScreenProps {
  messageImg?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export const SuccessScreen = ({
  messageImg,
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: SuccessScreenProps) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      // Default behavior
      console.log(`${buttonText} clicked`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      {/* Card Container */}
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary p-25">
        {/* Content */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
            <h1 className="font-display text-[48px] font-bold leading-15 tracking-[-0.96px] text-black">
              BeneStat
            </h1>
          </div>

          {/* Checkmark Icon */}
          <div className="relative size-45 shrink-0">
            <img
              alt="Success checkmark"
              className="block max-w-45 w-full"
              src={messageImg || checkmarkIcon}
            />
          </div>

          {/* Container */}
          <div className="flex w-125 flex-col items-center gap-8">
            {/* Message Container */}
            <div className="flex w-full flex-col items-center gap-1">
              <p className="font-display text-center text-primary text-4xl font-medium leading-11">
                {title}
              </p>
              <p className="font-display text-center text-subtitle text-2xl font-normal leading-8 px-8">
                {subtitle}
              </p>
            </div>

            {/* Button */}
            <Button
              type="button"
              color="primary"
              size="lg"
              onClick={handleButtonClick}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
