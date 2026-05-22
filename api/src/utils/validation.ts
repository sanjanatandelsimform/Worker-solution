import { z } from 'zod';

/**
 * Zod validation schema for user registration requests.
 * 
 * Validates:
 * - name: Required string (cannot be empty)
 * - email: Required valid email format
 * - password: Required string with minimum 8 characters
 * 
 * @throws {ZodError} When validation fails, containing detailed field-specific errors
 * 
 * @example
 * // Valid input
 * const input = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
 * const validated = userRegistrationSchema.parse(input);
 * 
 * @example
 * // Invalid input (throws ZodError)
 * const invalid = { name: '', email: 'invalid', password: 'short' };
 * userRegistrationSchema.parse(invalid); // Throws with field-specific errors
 */
export const userRegistrationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required'),
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

/**
 * TypeScript type inferred from the Zod schema.
 * Represents a validated user registration input.
 * 
 * @typedef {Object} UserRegistrationInput
 * @property {string} name - Full name of the user
 * @property {string} email - Valid email address
 * @property {string} password - Password with minimum 8 characters
 */
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
