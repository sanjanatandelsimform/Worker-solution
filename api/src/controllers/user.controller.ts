import { Request, Response, NextFunction } from 'express';
import { UserRegistration, UserResponse, ApiResponse } from '../types/user.types';
import { userRegistrationSchema } from '../utils/validation';
import { ZodError } from 'zod';

/**
 * In-memory user storage.
 * In production, replace this with a proper database (PostgreSQL, MongoDB, etc.).
 */
const users: UserResponse[] = [];

/**
 * Handles user registration requests.
 * 
 * Validates the request body, checks for duplicate emails,
 * and creates a new user account if all validations pass.
 * 
 * @param {Request} req - Express request object
 * @param {Request.body} req.body - User registration data
 * @param {string} req.body.name - User's full name (required)
 * @param {string} req.body.email - User's email address (required, must be unique)
 * @param {string} req.body.password - User's password (required, min 8 characters)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * 
 * @returns {Promise<void>} Sends JSON response:
 * - 201: User created successfully with UserResponse data
 * - 400: Validation failed with field-specific errors
 * - 409: Email already registered
 * - 500: Internal server error (handled by error middleware)
 * 
 * @example
 * // Success response (201)
 * {
 *   success: true,
 *   data: {
 *     id: 'user_1716206400000_abc123',
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     createdAt: '2026-05-20T12:00:00.000Z'
 *   }
 * }
 * 
 * @example
 * // Validation error response (400)
 * {
 *   success: false,
 *   error: {
 *     message: 'Validation failed',
 *     errors: {
 *       email: ['Invalid email format'],
 *       password: ['Password must be at least 8 characters']
 *     }
 *   }
 * }
 * 
 * @example
 * // Duplicate email response (409)
 * {
 *   success: false,
 *   error: { message: 'User with this email already exists' }
 * }
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = userRegistrationSchema.parse(req.body);

    // Check if user already exists
    const existingUser = users.find((user) => user.email === validatedData.email);
    if (existingUser) {
      console.warn('⚠️  Duplicate registration attempt:', validatedData.email);
      res.status(409).json({
        success: false,
        error: {
          message: 'User with this email already exists',
        },
      } as ApiResponse<never>);
      return;
    }

    // Create new user (excluding password from response)
    const newUser: UserResponse = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: validatedData.name,
      email: validatedData.email,
      createdAt: new Date(),
    };

    // Save user to mock database
    users.push(newUser);

    // Log successful registration
    console.log('✅ User registered successfully:', newUser.email);

    // Return success response
    res.status(201).json({
      success: true,
      data: newUser,
    } as ApiResponse<UserResponse>);
  } catch (error) {
    if (error instanceof ZodError) {
      // Validation error - 400 Bad Request
      const validationErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        if (!validationErrors[field]) {
          validationErrors[field] = [];
        }
        validationErrors[field].push(err.message);
      });

      console.warn('⚠️  Validation failed:', validationErrors);

      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          errors: validationErrors,
        },
      } as ApiResponse<never>);
      return;
    }

    // Pass other errors to error handler middleware - 500 Internal Server Error
    next(error);
  }
};
