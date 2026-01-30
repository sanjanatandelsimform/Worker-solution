import { X } from "@untitledui/icons";
import { Button } from "../base/buttons/button";

export interface CostCardProps {
  errorType?: "success" | "warning" | "danger" | "info" | "neutral";
  textColor?: string;
  alertIcon?: React.ComponentType<{ className?: string }>;
  errorMessage?: string;
  classess?: string;
  onClose?: () => void;
}
export default function ErrorMessage({
  errorType = "danger",
  textColor,
  alertIcon: AlertIcon,
  errorMessage,
  classess,
  onClose,
}: CostCardProps) {
  return (
    <div className={`${errorType} ${classess}`}>
      <div className={`${textColor} text-sm font-medium flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {AlertIcon && <AlertIcon className="size-4" />}
          {errorMessage}
        </div>
        <div>
          <Button
            color="tertiary"
            size="sm"
            onClick={onClose}
            iconLeading={<X data-icon className="closeIconColor" />}
          />
        </div>
      </div>
    </div>
  );
}
