"use client";

import type { ReactNode } from "react";
import type {
  DialogProps as AriaDialogProps,
  ModalOverlayProps as AriaModalOverlayProps,
} from "react-aria-components";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { cx } from "@/utils/cx";

interface ModalProps extends AriaModalOverlayProps {
  children: ReactNode;
  className?: string;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

interface ModalContentProps extends AriaDialogProps {
  children: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-[400px]",
  md: "max-w-[544px]",
  lg: "max-w-[640px]",
  xl: "max-w-[768px]",
  full: "max-w-full mx-4",
};

export const Modal = ({ children, className, size = "md", ...props }: ModalProps) => {
  return (
    <AriaModalOverlay
      {...props}
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        "entering:animate-in entering:fade-in entering:duration-200",
        "exiting:animate-out exiting:fade-out exiting:duration-150",
        className
      )}
    >
      <AriaModal
        className={cx(
          "w-full rounded-xl bg-ws-base-white shadow-2xl outline-hidden",
          "entering:animate-in entering:zoom-in-95 entering:duration-200",
          "exiting:animate-out exiting:zoom-out-95 exiting:duration-150",
          sizeClasses[size]
        )}
      >
        {children}
      </AriaModal>
    </AriaModalOverlay>
  );
};

export const ModalContent = ({ children, className, ...props }: ModalContentProps) => {
  return (
    <AriaDialog {...props} className={cx("flex flex-col outline-hidden", className)}>
      {children}
    </AriaDialog>
  );
};

export const ModalHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cx("flex items-center justify-between border-0 p-6", className)}>
      {children}
    </div>
  );
};

export const ModalTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={cx("text-2xl font-semibold text-ws-text-primary mb-2", className)}>
      {children}
    </h2>
  );
};

export const ModalDescription = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <p className={cx("text-sm text-ws-text-tertiary", className)}>{children}</p>;
};

export const ModalBody = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cx("flex-1 overflow-y-auto px-6", className)}>{children}</div>;
};

export const ModalFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cx("flex items-center justify-end gap-3 border-0 p-6", className)}>
      {children}
    </div>
  );
};

Modal.displayName = "Modal";
ModalContent.displayName = "ModalContent";
ModalHeader.displayName = "ModalHeader";
ModalTitle.displayName = "ModalTitle";
ModalDescription.displayName = "ModalDescription";
ModalBody.displayName = "ModalBody";
ModalFooter.displayName = "ModalFooter";
