/**
 * MongoDB Atlas & Local Database Connection Module
 * 
 * Establishes Mongoose connection using process.env.MONGO_URI.
 * Monitors connection events and handles topology logs cleanly.
 */

import mongoose from 'mongoose';
import dns from 'dns';
import logger from '../utils/logger.js';

// Configure DNS resolvers to handle SRV record lookups reliably on Windows local environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // If custom DNS setting fails, proceed with default system resolver
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mdsaips_db';

  // Safe diagnostic log: confirms environment variable presence without exposing URI or credentials
  logger.info(`MONGO_URI configured: ${process.env.MONGO_URI ? 'YES (Present)' : 'NO (Using local fallback)'}`);

  try {
    // Mongoose connection setup
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);

    // Drop legacy index if present on payments collection
    try {
      await conn.connection.db.collection('payments').dropIndex('transactionId_1');
    } catch (idxErr) {
      // Legacy index already removed or non-existent
    }

    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

// Connection Event Listeners
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB event: Disconnected from database server.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB event: Reconnected to database server.');
});

export default connectDB;
