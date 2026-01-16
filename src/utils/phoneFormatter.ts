/**
 * Format phone number to 10 digits (remove all non-numeric characters)
 * @param phoneNumber - Raw phone number string
 * @returns Formatted 10-digit phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Return first 10 digits
  return digitsOnly.slice(0, 10);
};

/**
 * Format phone number for display (e.g., "(123) 456-7890")
 * @param phoneNumber - 10-digit phone number
 * @returns Formatted phone number for display
 */
export const displayPhoneNumber = (phoneNumber: string): string => {
  const formatted = formatPhoneNumber(phoneNumber);

  if (formatted.length === 10) {
    return `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6, 10)}`;
  }

  return phoneNumber;
};
