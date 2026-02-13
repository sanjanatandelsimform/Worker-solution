import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
} from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";

export interface SuccessModalWithLogoButton {
  text: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "tertiary" | "primary-destructive";
  isDisabled?: boolean;
}

export interface SuccessModalWithLogoProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  messageImg: string;
  title?: string;
  subtitle?: string;
  button: SuccessModalWithLogoButton;
  showCloseButton?: boolean;
  showLogo?: boolean;
}

export const SuccessModalWithLogo = ({
  isOpen,
  onClose,
  size = "md",
  messageImg,
  title,
  subtitle,
  button,
  showCloseButton = true,
  showLogo = true,
}: SuccessModalWithLogoProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size={size}>
      <ModalContent className="bg-primary rounded-lg" aria-label={title || "Success notification"}>
        {/* Modal Header with Logo, Icon, and Close Button */}
        <ModalHeader className="relative flex flex-col items-center gap-6 border-0">
          {/* Logo */}

          {/* Close Button */}
          {showCloseButton && (
            <Button
              color="tertiary"
              size="sm"
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-3 top-3 flex size-11 items-center justify-center overflow-clip p-2 rounded-lg"
            >
              <X className="size-6 text-quaternary" />
            </Button>
          )}
          <div className="pt-18 flex flex-col items-center gap-6">
            {showLogo && (
              <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
                <h1 className="font-display text-[48px] font-bold leading-15 text-primary">
                  BeneStat
                </h1>
              </div>
            )}
            {/* Large Icon/Image */}
            <div className="relative size-44 shrink-0">
              <img alt={title || "Modal icon"} className="block w-full" src={messageImg} />
            </div>

            {/* Text Container */}
            {(title || subtitle) && (
              <div className="flex w-full flex-col items-center gap-1 px-8 pt-0">
                {title && (
                  <ModalTitle className="font-display text-center text-primary text-4xl font-medium leading-11">
                    {title}
                  </ModalTitle>
                )}
                {subtitle && (
                  <p className="font-display text-center text-subtitle text-2xl font-normal leading-8 px-8">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </ModalHeader>

        {/* Modal Footer with Button */}
        <ModalFooter className="flex items-center justify-center border-0 pt-4">
          <Button
            type="button"
            color={button.color || "primary"}
            size="lg"
            onClick={button.onClick}
            className="w-auto mb-10"
            isDisabled={button.isDisabled}
          >
            {button.text}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SuccessModalWithLogo;
