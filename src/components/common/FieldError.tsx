import { InputInfo } from "@/assets/icons/inputInfo";
import { JSX } from "react";

interface FieldErrorProps {
  /** Error message to display. Component renders nothing if falsy. */
  message: string | undefined;
}

export function FieldError({ message }: FieldErrorProps): JSX.Element | null {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2">
      <InputInfo className="text-ws-error-600" />
      <span className="text-sm text-ws-error-600">{message}</span>
    </div>
  );
}
