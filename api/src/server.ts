/**
 * Express server application for user registration API.
 * 
 * Features:
 * - User registration endpoint
 * - Input validation with Zod
 * - Comprehensive error handling
 * - CORS enabled
 * - Health check endpoint
 * 
 * @module server
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

/** Express application instance */
const app: Application = express();

/** Server port number from environment variable or default to 3001 */
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

/**
 * Health check endpoint.
 * Returns server status and current timestamp.
 * 
 * @route GET /health
 * @returns {Object} 200 - Health status
 * @returns {string} status - Always 'ok'
 * @returns {string} timestamp - Current ISO timestamp
 * 
 * @example response
 * {
 *   "status": "ok",
 *   "timestamp": "2026-05-20T12:00:00.000Z"
 * }
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Start the Express server.
 * Logs the server URL and API endpoint when ready.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/users/register`);
});

export default app;
