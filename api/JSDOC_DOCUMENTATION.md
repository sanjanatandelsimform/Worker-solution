# API Documentation - JSDoc & TypeScript Interfaces

Complete documentation of all TypeScript interfaces and JSDoc comments in the API.

---

## 📦 Type Definitions

### `UserRegistration`

Represents the user registration request payload.

```typescript
/**
 * Represents the user registration request payload.
 * Contains all required fields for creating a new user account.
 */
export interface UserRegistration {
  /** Full name of the user */
  name: string;
  /** User's email address (must be unique) */
  email: string;
  /** User's password (minimum 8 characters) */
  password: string;
}
```

**Usage:**
```typescript
const registrationData: UserRegistration = {
  name: "John Doe",
  email: "john@example.com",
  password: "password123"
};
```

---

### `UserResponse`

Represents a user entity in the response (excludes sensitive data).

```typescript
/**
 * Represents a user entity in the response.
 * Contains user data without sensitive information like passwords.
 */
export interface UserResponse {
  /** Unique identifier for the user */
  id: string;
  /** Full name of the user */
  name: string;
  /** User's email address */
  email: string;
  /** Timestamp when the user account was created */
  createdAt: Date;
}
```

**Example:**
```typescript
const user: UserResponse = {
  id: "user_1716206400000_abc123",
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date()
};
```

---

### `ApiError`

Represents an error response structure.

```typescript
/**
 * Represents an error response structure.
 * Can include field-specific validation errors.
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Optional field-specific validation errors (field name -> array of error messages) */
  errors?: Record<string, string[]>;
}
```

**Example - Validation Errors:**
```typescript
const error: ApiError = {
  message: "Validation failed",
  errors: {
    email: ["Invalid email format"],
    password: ["Password must be at least 8 characters"]
  }
};
```

**Example - Simple Error:**
```typescript
const error: ApiError = {
  message: "User with this email already exists"
};
```

---

### `ApiResponse<T>`

Generic API response wrapper providing consistent format.

```typescript
/**
 * Generic API response wrapper.
 * Provides consistent response format for all endpoints.
 * 
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  /** Indicates whether the request was successful */
  success: boolean;
  /** Response data (present when success is true) */
  data?: T;
  /** Error information (present when success is false) */
  error?: ApiError;
}
```

**Example - Success Response:**
```typescript
const response: ApiResponse<UserResponse> = {
  success: true,
  data: {
    id: "123",
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date()
  }
};
```

**Example - Error Response:**
```typescript
const response: ApiResponse<never> = {
  success: false,
  error: {
    message: "Validation failed",
    errors: {
      email: ["Invalid format"]
    }
  }
};
```

---

## 🔍 Validation Schema

### `userRegistrationSchema`

Zod validation schema for user registration requests.

```typescript
/**
 * Zod validation schema for user registration requests.
 * 
 * Validates:
 * - name: Required string (cannot be empty)
 * - email: Required valid email format
 * - password: Required string with minimum 8 characters
 * 
 * @throws {ZodError} When validation fails, containing detailed field-specific errors
 */
export const userRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

**Usage:**
```typescript
// Valid input
const input = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
const validated = userRegistrationSchema.parse(input);

// Invalid input (throws ZodError)
const invalid = { name: '', email: 'invalid', password: 'short' };
userRegistrationSchema.parse(invalid); // Throws with field-specific errors
```

### `UserRegistrationInput`

TypeScript type inferred from the Zod schema.

```typescript
/**
 * TypeScript type inferred from the Zod schema.
 * Represents a validated user registration input.
 */
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
```

---

## 🎯 API Endpoints

### POST `/api/users/register`

Register a new user account.

```typescript
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
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => { /* ... */ }
```

**Request Example:**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response Examples:**

**201 Success:**
```json
{
  "success": true,
  "data": {
    "id": "user_1716206400000_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-05-20T12:00:00.000Z"
  }
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

**409 Duplicate Email:**
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists"
  }
}
```

---

### GET `/health`

Health check endpoint.

```typescript
/**
 * Health check endpoint.
 * Returns server status and current timestamp.
 * 
 * @route GET /health
 * @returns {Object} 200 - Health status
 * @returns {string} status - Always 'ok'
 * @returns {string} timestamp - Current ISO timestamp
 */
```

**Request:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-20T12:00:00.000Z"
}
```

---

## 🛡️ Middleware

### `errorHandler`

Global error handling middleware.

```typescript
/**
 * Global error handling middleware for Express application.
 * 
 * Catches all unhandled errors that occur during request processing
 * and returns a consistent error response with proper logging.
 * 
 * @param {Error} err - The error object thrown by the application
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function (unused)
 * 
 * @returns {void} Sends a 500 JSON response with error details
 */
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```

**Server Logs:**
```
❌ Server Error: {
  message: "Database connection failed",
  stack: "Error: Database connection failed\n    at ...",
  method: "POST",
  path: "/api/users/register",
  timestamp: "2026-05-20T12:00:00.000Z"
}
```

---

## 📚 Using TypeScript Types in Your Code

### Import Types

```typescript
import { 
  UserRegistration, 
  UserResponse, 
  ApiResponse, 
  ApiError 
} from './types/user.types';
```

### Type-Safe Request Handler

```typescript
import { Request, Response } from 'express';
import { ApiResponse, UserResponse } from './types/user.types';

const myHandler = (req: Request, res: Response): void => {
  const response: ApiResponse<UserResponse> = {
    success: true,
    data: {
      id: '123',
      name: 'John',
      email: 'john@example.com',
      createdAt: new Date()
    }
  };
  
  res.json(response);
};
```

### Type-Safe Validation

```typescript
import { userRegistrationSchema, UserRegistrationInput } from './utils/validation';

try {
  const validated: UserRegistrationInput = userRegistrationSchema.parse(req.body);
  // validated is now type-safe with proper TypeScript types
  console.log(validated.name); // string
  console.log(validated.email); // string
  console.log(validated.password); // string
} catch (error) {
  // Handle validation error
}
```

---

## 🎓 Benefits of JSDoc + TypeScript

1. **IntelliSense Support**: IDE autocomplete and hover documentation
2. **Type Safety**: Compile-time type checking prevents runtime errors
3. **Self-Documenting**: Code is easier to understand and maintain
4. **API Documentation**: Can generate HTML docs with tools like TypeDoc
5. **Better DX**: Improved developer experience with inline documentation

---

## 📖 Generating HTML Documentation

Install TypeDoc:
```bash
npm install --save-dev typedoc
```

Add script to `package.json`:
```json
{
  "scripts": {
    "docs": "typedoc --out docs src"
  }
}
```

Generate documentation:
```bash
npm run docs
```

This will create HTML documentation in the `docs/` folder with all JSDoc comments and TypeScript types formatted nicely.
