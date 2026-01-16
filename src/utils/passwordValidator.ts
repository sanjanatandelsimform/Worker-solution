/**
 * Password strength levels
 */
export type PasswordStrength = "weak" | "fair" | "good" | "strong";

/**
 * Password strength criteria
 */
interface PasswordCriteria {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * Calculate password strength based on various criteria
 * @param password - Password string to validate
 * @returns Password strength level
 */
export const calculatePasswordStrength = (
  password: string,
): PasswordStrength => {
  if (!password) return "weak";

  const criteria: PasswordCriteria = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metCriteria = Object.values(criteria).filter(Boolean).length;

  if (metCriteria <= 2) return "weak";
  if (metCriteria === 3) return "fair";
  if (metCriteria === 4) return "good";
  return "strong";
};

/**
 * Get password strength as a percentage (0-100)
 * @param password - Password string to validate
 * @returns Strength percentage
 */
export const getPasswordStrengthPercentage = (password: string): number => {
  const strength = calculatePasswordStrength(password);

  const strengthMap: Record<PasswordStrength, number> = {
    weak: 25,
    fair: 50,
    good: 75,
    strong: 100,
  };

  return strengthMap[strength];
};

/**
 * Get color for password strength indicator
 * @param strength - Password strength level
 * @returns CSS color class
 */
export const getPasswordStrengthColor = (
  strength: PasswordStrength,
): string => {
  const colorMap: Record<PasswordStrength, string> = {
    weak: "bg-red-500",
    fair: "bg-orange-500",
    good: "bg-yellow-500",
    strong: "bg-green-500",
  };

  return colorMap[strength];
};

/**
 * Validate password requirements and return missing requirements
 * @param password - Password string to validate
 * @returns Array of missing requirement messages
 */
export const getPasswordRequirements = (password: string): string[] => {
  const requirements: string[] = [];

  if (password.length < 8) {
    requirements.push("At least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    requirements.push("One uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    requirements.push("One lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    requirements.push("One number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    requirements.push("One special character");
  }

  return requirements;
};
