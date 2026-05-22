import { Router } from 'express';
import { registerUser } from '../controllers/user.controller';

/**
 * Express router for user-related endpoints.
 * 
 * Base path: /api/users
 */
const router: Router = Router();

/**
 * POST /api/users/register
 * 
 * Register a new user account.
 * 
 * @route POST /api/users/register
 * @group Users - User management operations
 * @param {UserRegistration} request.body.required - User registration data
 * @returns {ApiResponse<UserResponse>} 201 - User created successfully
 * @returns {ApiResponse} 400 - Validation error
 * @returns {ApiResponse} 409 - Email already registered
 * @returns {ApiResponse} 500 - Server error
 * 
 * @example request - Valid registration request
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * @example response - 201 - Success response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_1716206400000_abc123",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "createdAt": "2026-05-20T12:00:00.000Z"
 *   }
 * }
 */
router.post('/register', registerUser);

export default router;
