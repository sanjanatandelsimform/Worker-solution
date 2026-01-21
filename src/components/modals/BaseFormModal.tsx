import type { ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";

export interface BaseFormModalButton {
  text: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "tertiary" | "primary-destructive";
  type?: "button" | "submit";
  isDisabled?: boolean;
  className?: string;
}

export interface BaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  title: string;
  description?: string;
  children: ReactNode;
  buttons: BaseFormModalButton[];
  showCloseButton?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

export const BaseFormModal = ({
  isOpen,
  onClose,
  size = "lg",
  title,
  description,
  children,
  buttons,
  showCloseButton = true,
  onSubmit,
}: BaseFormModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size={size}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full relative">
            <div className="flex flex-col gap-1">
              <ModalTitle>{title}</ModalTitle>
              {description && <ModalDescription>{description}</ModalDescription>}
            </div>
            {showCloseButton && (
              <div className="absolute -right-2 -top-2">
                <Button
                  iconTrailing={<X data-icon className="text-quaternary size-6" />}
                  onClick={onClose}
                  color="tertiary"
                />
              </div>
            )}
          </div>
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-4">{children}</div>
          </ModalBody>

          <ModalFooter>
            {buttons.map(button => (
              <Button
                key={button.text}
                type={button.type || "button"}
                color={button.color || "primary"}
                size="md"
                onClick={button.onClick}
                className={button.className || (buttons.length === 1 ? "w-full" : "")}
                isDisabled={button.isDisabled}
              >
                {button.text}
              </Button>
            ))}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default BaseFormModal;
