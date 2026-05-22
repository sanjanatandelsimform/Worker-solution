import { Request, Response, NextFunction } from 'express';

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
 * 
 * @example
 * // Error response format
 * {
 *   success: false,
 *   error: {
 *     message: 'Internal server error'
 *   }
 * }
 * 
 * Server logs include:
 * - Error message and stack trace
 * - HTTP method and path
 * - Timestamp
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error details for debugging
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  // Send consistent error response
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
    },
  });
};
