/**
 * Backend Server Entry Point
 * 
 * Loads environment variables, connects to MongoDB, registers Mongoose models,
 * starts Express HTTP listener, and sets up uncaught exception handlers.
 */

import dotenv from 'dotenv';
// Load environment variables before importing application modules
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import initBookingExpiryCron from './jobs/bookingExpiryCron.js';

// Pre-load all 12 Mongoose Models into Mongoose registry
import './models/index.js';

const PORT = process.env.PORT || 5001;

// Initialize Server Lifecycle
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas / Local Instance
    await connectDB();
    initBookingExpiryCron();
  } catch (err) {
    logger.error(`Database connection failure: ${err.message}. Aborting startup.`);
    process.exit(1);
  }

  // Start Express HTTP Listener
  const server = app.listen(PORT, () => {
    logger.info(`MDSAIPS Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
    logger.info(`Swagger API Docs available at http://localhost:${PORT}/api-docs`);
    logger.info(`All 12 Database Architecture Models Registered Successfully`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection! Shutting down server gracefully...', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception! Shutting down server immediately...', err);
    process.exit(1);
  });
};

startServer();
