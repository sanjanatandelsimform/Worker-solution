import type { ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
} from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";
import { LandingProgress } from "@/assets/icons/LoadingProgress";

export interface BaseModalWithIconButton {
  text: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "tertiary" | "warning" | "error";
  isDisabled?: boolean;
}

export interface BaseModalWithIconProps {
  isOpen: boolean;
  onClose?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  title: string;
  subtitle?: string;
  contentTitle?: string;
  contentDescription?: string;
  contentNote?: string;
  icon?: ReactNode;
  buttons?: BaseModalWithIconButton[];
  showCloseButton?: boolean;
  paddingBottom?: string;
  backgroundPattern?: "success" | "unsuccess";
}

export const ProgressLoadingModal = ({
  isOpen,
  onClose,
  size = "sm",
  title,
  subtitle,
  contentTitle,
  contentDescription,
  contentNote,
  icon,
  buttons,
  showCloseButton = true,
  paddingBottom = "h-3",
  backgroundPattern = "success",
}: BaseModalWithIconProps) => {
  const backgroundClass = backgroundPattern === "success" ? " " : "background-pattern-unsuccess";

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size={size}>
      <ModalContent className={backgroundClass}>
        {/* Modal Header with Featured Icon and Close Button */}
        <ModalHeader className="relative flex flex-col items-start border-0 pb-0 pt-6 px-6">
          {/* Featured Icon */}
          {icon && (
            <div className="flex items-center gap-3 w-full">
              <div className="p-3 rounded-full bg-ws-navy-200 flex items-center justify-center">
                <LandingProgress />
              </div>
              {/* Text and Supporting Text */}
              <div className="flex w-full flex-col">
                <ModalTitle className="font-display text-2xl font-semibold leading-8 text-ws-text-primary mb-0">
                  {title}
                </ModalTitle>
                {subtitle && (
                  <p className="font-body text-sm font-normal leading-5 text-ws-text-tertiary">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Close Button */}
          {showCloseButton && (
            <Button
              color="link"
              size="sm"
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-3 top-3 flex size-11 items-center justify-center overflow-clip p-2 rounded-lg"
            >
              <X className="size-7 stroke-1 text-ws-gray-400" />
            </Button>
          )}

          {/* Padding Bottom */}
          <div className={`${paddingBottom} w-full shrink-0`} />
        </ModalHeader>
        <ModalContent className="border-0 px-6 pt-2 pb-0">
          <div className="bg-ws-light-teal-25 border border-ws-border-primary rounded-xl p-4">
            <h3 className="text-lg font-medium text-ws-navy-950 mb-2">{contentTitle}</h3>
            <p className="text-base font-normal text-ws-navy-900">{contentDescription}</p>
            <p className="text-sm font-normal text-ws-text-tertiary mt-4">
              {/* <span className="text-ws-text-primary">Source:</span> */}
              {contentNote}
            </p>
          </div>
        </ModalContent>

        {/* Modal Footer with Buttons */}
        <ModalFooter className="flex items-start gap-3 border-0 pb-6 px-6 pt-0">
          {buttons?.map(button => (
            <Button
              key={button.text}
              type="button"
              color={button.color || "primary"}
              size="xl"
              onClick={button.onClick}
              className={buttons.length === 1 ? "w-full" : "flex-1"}
              isDisabled={button.isDisabled}
            >
              {button.text}
            </Button>
          ))}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProgressLoadingModal;
