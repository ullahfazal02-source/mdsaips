/**
 * Express Application Configuration
 * 
 * Sets up middleware pipeline, security headers, rate limiters, logging,
 * Swagger documentation, CORS policies, and API route mappings.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from './config/swagger.js';
import apiRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

// Security HTTP headers
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origin requests cleanly
      }
    },
    credentials: true,
  })
);

// HTTP Request Logger (Morgan stream hooked to Winston)
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Rate Limiting to prevent brute-force and DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 5000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' || req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

// Body Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Swagger API Documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Primary API Router
app.use('/api/v1', apiRouter);

// Root route welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to MDSAIPS API Backend Gateway',
    documentation: '/api-docs',
    healthCheck: '/api/v1/health',
  });
});

// 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
