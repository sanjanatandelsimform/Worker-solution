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
import featuredIcon from "@/assets/featured-icon.svg";

export interface BaseModalWithIconButton {
  text: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "tertiary" | "error" | "warning";
  isDisabled?: boolean;
}

export interface BaseModalWithIconProps {
  isOpen: boolean;
  messageImg?: string;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  title: string;
  subtitle?: string;
  subtitleOne?: string;
  contentTitle?: string;
  contentDescription?: string | ReactNode;
  contentNote?: string;
  icon?: ReactNode;
  buttons: BaseModalWithIconButton[];
  showCloseButton?: boolean;
  paddingBottom?: string;
  backgroundPattern?: "success" | "unsuccess";
}

export const BaseModalWithIcon = ({
  isOpen,
  messageImg,
  onClose,
  size = "sm",
  title,
  subtitle,
  subtitleOne,
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

  console.log(messageImg, "messageImg");
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size={size}>
      <ModalContent className={backgroundClass}>
        {/* Modal Header with Featured Icon and Close Button */}
        <ModalHeader className="relative flex flex-col items-start border-0 pb-0 pt-6 px-6">
          {/* Featured Icon */}
          {icon ? (
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${backgroundPattern === "success" ? "bg-ws-success-100" : "bg-ws-error-100"}`}
            >
              {icon}
            </div>
          ) : (
            <img
              alt="Success checkmark"
              className="block max-w-12 w-full"
              src={messageImg || featuredIcon}
            />
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

          {/* Text and Supporting Text */}
          <div className="flex w-full flex-col gap-2">
            <ModalTitle className="font-display text-2xl font-semibold leading-8 text-ws-text-primary mb-0 mt-4">
              {title}
            </ModalTitle>
            {subtitle && (
              <>
                <p className="font-body text-sm font-normal leading-5 text-ws-text-tertiary">
                  {subtitle}
                </p>
                <p className="font-body text-sm font-normal leading-5 text-ws-text-tertiary mt-2">
                  {subtitleOne}
                </p>
              </>
            )}
            {contentTitle && (
              <h3 className="text-lg font-medium text-ws-navy-950 mb-2">{contentTitle}</h3>
            )}
            {contentDescription && (
              <p className="text-base font-normal text-ws-navy-900">{contentDescription}</p>
            )}
            {contentNote && (
              <p className="text-sm font-normal text-ws-text-tertiary mt-4">
                <span className="text-ws-text-primary">Source:</span> {contentNote}
              </p>
            )}
          </div>

          {/* Padding Bottom */}
          <div className={`${paddingBottom} w-full shrink-0`} />
        </ModalHeader>

        {/* Modal Footer with Buttons */}
        <ModalFooter className="flex items-start gap-3 border-0 pb-6 px-6 pt-0 mt-4">
          {buttons.map(button => (
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

export default BaseModalWithIcon;
