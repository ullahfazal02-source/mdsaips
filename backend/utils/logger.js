/**
 * Winston Logging Module Configuration
 * 
 * Provides structured logging with multiple log levels (info, warn, error).
 * Configures console transport for development and file transports for production logs.
 */

import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory path in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../logs');

// Create logs directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format for file outputs
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Custom log format for readable console output
const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    ({ level, message, timestamp, stack }) => `${timestamp} [${level}]: ${stack || message}`
  )
);

// Create Winston Logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: fileLogFormat,
  defaultMeta: { service: 'mdsaips-backend' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
    // Console transport for quick dev feedback
    new winston.transports.Console({
      format: consoleLogFormat,
    }),
  ],
});

export default logger;
