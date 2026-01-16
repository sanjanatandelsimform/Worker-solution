import React from "react";
import {
  calculatePasswordStrength,
  getPasswordStrengthPercentage,
  getPasswordStrengthColor,
  type PasswordStrength,
} from "../../utils/passwordValidator";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, className = "" }) => {
  if (!password) return null;

  const strength: PasswordStrength = calculatePasswordStrength(password);
  const percentage = getPasswordStrengthPercentage(password);
  const colorClass = getPasswordStrengthColor(strength);

  const strengthLabels: Record<PasswordStrength, string> = {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-secondary">Password strength:</span>
        <span
          className={`font-medium ${
            strength === "weak"
              ? "text-red-600"
              : strength === "fair"
                ? "text-orange-600"
                : strength === "good"
                  ? "text-yellow-600"
                  : "text-green-600"
          }`}
        >
          {strengthLabels[strength]}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strengthLabels[strength]}`}
        />
      </div>
    </div>
  );
};
