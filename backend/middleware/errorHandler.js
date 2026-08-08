/**
 * Global Express Error Handling Middleware
 * 
 * Intercepts unhandled errors across controllers and middlewares,
 * logs full details using Winston, and sends clean structured JSON responses.
 */

import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  logger.error(`[${req.method}] ${req.originalUrl} - Error: ${err.message}`, {
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
