import dotenv from 'dotenv';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import mongoose from 'mongoose';

dotenv.config();

// Configure DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

/**
 * MDSAIPS Database Seed System
 * Idempotently seeds the core Development Admin Account.
 */
async function seedAdmin() {
  console.log('==================================================');
  console.log('--- MDSAIPS DATABASE SEED SYSTEM ---');
  console.log('==================================================');

  await connectDB();

  const adminEmail = 'admin@mdsaips.com';
  const rawPassword = 'Iqrar@N11';
  const adminName = 'MDSAIPS Admin';

  try {
    // Check if Admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`ℹ️ Admin account already exists: [${adminEmail}]`);
      console.log(`   User ID: ${existingAdmin._id}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      console.log('✓ SEED SKIPPED: No duplicate admin created.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Create Admin User
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      phone: '+919999999999',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    console.log('✅ SEED SUCCESS: Admin account created successfully!');
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   User ID: ${adminUser._id}`);
    console.log(`   Email Verified: ${adminUser.isEmailVerified}`);
    console.log(`   Status: ${adminUser.status}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ SEED FAILED:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
