import { useMemo } from "react";
import { CheckCircle, AlertOctagon } from "@untitledui/icons";
import checkmarkIcon from "@/assets/finch-checkmark.svg";
import alertIcon from "@/assets/alert-icon.svg";
import type { BaseModalWithIconProps } from "@/components/modals/BaseModalWithIcon";
import { CheckLineIcon } from "@/assets/icons/CheckLineIcon";

type ModalType =
  | "updateComplete"
  | "emailUpdated"
  | "retakeAssessment"
  | "accountDelete"
  | "resendSuccess"
  | "cooldown"
  | "logoutConfirmation"
  | "goalsComplete"
  | "goalsEmptyWarning"
  | "goalsApiError"
  | "emailVerified";

interface ModalConfig {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  additionalData?: Record<string, unknown>;
}

export const useModalConfig = (
  type: ModalType,
  config: ModalConfig
): Omit<BaseModalWithIconProps, "isOpen" | "onClose"> => {
  return useMemo(() => {
    const configs: Record<ModalType, Omit<BaseModalWithIconProps, "isOpen" | "onClose">> = {
      updateComplete: {
        size: "sm",
        title: "Update Complete",
        subtitle: "All set! Your changes have been saved.",
        icon: <CheckCircle className="size-6" />,
        //messageImg: checkmarkIcon,
        backgroundPattern: "success",
        buttons: [
          {
            text: "Back to Settings",
            onClick: config.onClose,
            color: "primary",
          },
        ],
      },
      emailUpdated: {
        size: "sm",
        title: "Your information has been updated",
        subtitle:
          "All set! Your email has been updated. We’ve sent a verification link to your new address. Please verify your email.",
        icon: <CheckCircle className="size-6" />,
        //messageImg: checkmarkIcon,
        backgroundPattern: "success",
        buttons: [
          {
            text: "Back to Settings",
            onClick: config.onConfirm || config.onClose,
            color: "primary",
          },
        ],
      },
      retakeAssessment: {
        size: "sm",
        title: "Are you sure?",
        subtitle:
          "Retaking the assessment will remove all data from your dashboard and you will need to retake the assessment form. This action can't be reversed.",
        subtitleOne: "If you're certain this is what you want, confirm below to proceed.",
        icon: <AlertOctagon className="size-6" />,
        messageImg: alertIcon,
        backgroundPattern: "unsuccess",
        buttons: [
          {
            text: "Cancel",
            onClick: config.onClose,
            color: "secondary",
            isDisabled: !!config.additionalData?.loading,
          },
          {
            text: config.additionalData?.loading ? "Retaking..." : "Yes, Retake assessment",
            onClick: config.onConfirm || config.onClose,
            color: "primary-destructive",
            isDisabled: !!config.additionalData?.loading,
          },
        ],
      },
      accountDelete: {
        size: "sm",
        title: "Confirm Account Deletion",
        subtitle:
          "Deleting your account will permanently erase your profile and all associated data. This action can't be reversed.",
        subtitleOne: "If you're certain this is what you want, confirm below to proceed.",
        icon: <AlertOctagon className="size-6" />,
        messageImg: alertIcon,
        backgroundPattern: "unsuccess",
        buttons: [
          {
            text: "Cancel",
            onClick: config.onClose,
            color: "tertiary",
          },
          {
            text: "Yes, Delete my account",
            onClick: config.onConfirm || config.onClose,
            color: "error",
          },
        ],
      },
      resendSuccess: {
        size: "sm",
        title: "Email sent",
        subtitle: `We've sent a verification link to your email, ${
          config.additionalData?.email as string
        }. Verify your email to continue.`,
        icon: <CheckLineIcon className="size-6" />,
        messageImg: checkmarkIcon,
        backgroundPattern: "success",
        buttons: [
          {
            text: "Return to dashboard",
            onClick: config.onConfirm || config.onClose,
            color: "primary",
          },
        ],
      },
      cooldown: {
        size: "sm",
        title: "Please wait",
        subtitle: `Email just sent. Please wait ${
          config.additionalData?.cooldown || 0
        } seconds before trying again.`,
        icon: <AlertOctagon className="size-6 text-yellow-500" />,
        backgroundPattern: "unsuccess",
        buttons: [
          {
            text: "Okay",
            onClick: config.onClose,
            color: "primary",
          },
        ],
      },
      logoutConfirmation: {
        size: "sm",
        title: "Are you sure you want to log out?",
        icon: <AlertOctagon className="size-6" />,
        messageImg: alertIcon,
        backgroundPattern: "unsuccess",
        buttons: [
          {
            text: "Cancel",
            onClick: config.onClose,
            color: "tertiary",
          },
          {
            text: "Yes",
            onClick: config.onConfirm || config.onClose,
            color: "primary-destructive",
            isDisabled: config.additionalData?.isDisabled as boolean,
          },
        ],
      },
      goalsComplete: {
        size: "sm",
        title: "You're done!",
        subtitle: "See your results and recommendations on your dashboard",
        //messageImg: checkmarkIcon,
        backgroundPattern: "success",
        buttons: [
          {
            text: "Go to Dashboard",
            onClick: config.onConfirm || config.onClose,
            color: "primary",
          },
        ],
      },
      goalsEmptyWarning: {
        size: "sm",
        title: "Uh-oh",
        subtitle:
          "You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?",
        messageImg: alertIcon,
        backgroundPattern: "unsuccess",
        buttons: [
          {
            text: "Cancel",
            onClick: config.onClose,
            color: "secondary",
          },
          {
            text: "Continue",
            onClick: config.onConfirm || config.onClose,
            color: "primary",
          },
        ],
      },
      goalsApiError: {
        size: "sm",
        title: "Submission Failed",
        subtitle:
          (config.additionalData?.errorMessage as string) ||
          "Something went wrong. Please try again.",
        messageImg: alertIcon,
        backgroundPattern: "unsuccess",
        buttons: [
          {
            text: "Cancel",
            onClick: config.onClose,
            color: "secondary",
          },
          {
            text: "Retry",
            onClick: config.onConfirm || config.onClose,
            color: "primary",
          },
        ],
      },
      emailVerified: {
        size: "sm",
        title: "Your email has been verified!",
        subtitle: "Welcome aboard! Start your success journey with BeneStats.",
        icon: <CheckCircle className="size-6" />,
        //messageImg: checkmarkIcon,
        backgroundPattern: "success",
        buttons: [
          {
            text: "Return to dashboard",
            onClick: config.onClose,
            color: "primary",
          },
        ],
      },
    };

    return configs[type];
  }, [type, config]);
};
