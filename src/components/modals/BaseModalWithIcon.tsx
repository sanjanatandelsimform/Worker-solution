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
  color?: "primary" | "secondary" | "tertiary" | "primary-destructive";
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
  icon,
  buttons,
  showCloseButton = true,
  paddingBottom = "h-5",
  backgroundPattern = "success",
}: BaseModalWithIconProps) => {
  const backgroundClass =
    backgroundPattern === "success" ? "background-pattern" : "background-pattern-unsuccess";

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size={size}>
      <ModalContent className={backgroundClass}>
        {/* Modal Header with Featured Icon and Close Button */}
        <ModalHeader className="relative flex flex-col items-start gap-4 border-0 pb-0 pt-6 px-6">
          {/* Featured Icon */}
          {icon && (
            <img
              alt="Success checkmark"
              className="block max-w-12 w-full"
              src={messageImg || featuredIcon}
            />
          )}
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

          {/* Text and Supporting Text */}
          <div className="flex w-full flex-col gap-2">
            <ModalTitle className="font-display text-[36px] font-medium leading-11 tracking-[-0.72px] text-primary">
              {title}
            </ModalTitle>
            {subtitle && (
              <>
                <p className="font-body text-sm font-normal leading-5 text-tertiary">{subtitle}</p>
                <p className="font-body text-sm font-normal leading-5 text-tertiary">
                  {subtitleOne}
                </p>
              </>
            )}
          </div>

          {/* Padding Bottom */}
          <div className={`${paddingBottom} w-full shrink-0`} />
        </ModalHeader>

        {/* Modal Footer with Buttons */}
        <ModalFooter className="flex items-start gap-3 border-0 pb-6 px-6 pt-0">
          {buttons.map(button => (
            <Button
              key={button.text}
              type="button"
              color={button.color || "primary"}
              size="md"
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
