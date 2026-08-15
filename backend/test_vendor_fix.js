import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import connectDB from './config/db.js';
import User from './models/User.js';
import Vendor from './models/Vendor.js';
import mongoose from 'mongoose';

const API_BASE = 'http://localhost:5001/api/v1';

async function runVendorRegistrationFixTests() {
  console.log('==================================================');
  console.log('--- STARTING VENDOR REGISTRATION FIX VERIFICATION ---');
  console.log('==================================================');

  await connectDB();

  const customerEmail = `reg_fix_customer_${Date.now()}@example.com`;
  const customerPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));
  const password = 'Password@123';

  // TEST 1: Register and login with a verified customer account
  console.log('\n[TEST 1] Registering and authenticating a verified customer account...');
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Royal Customer', email: customerEmail, phone: customerPhone, password, role: 'customer' }),
  }).then((r) => r.json());

  if (!regRes.success) {
    throw new Error(`Customer registration failed: ${regRes.message}`);
  }

  await User.findByIdAndUpdate(regRes.userId, { isEmailVerified: true, status: 'active' });

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password }),
  }).then((r) => r.json());

  if (!loginRes.token) {
    throw new Error(`Customer login failed: ${loginRes.message}`);
  }
  const token = loginRes.token;
  console.log('✓ TEST 1 PASSED: Verified customer authenticated');

  // TEST 2: Check Vendor Dashboard stats before registration -> Should return 404
  console.log('\n[TEST 2] Checking Vendor Dashboard stats before registration...');
  const preStatsRes = await fetch(`${API_BASE}/vendors/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const preStatsData = await preStatsRes.json();
  if (preStatsRes.status !== 404 || !preStatsData.message.includes('not found')) {
    throw new Error('TEST 2 FAILED: Expected 404 for missing vendor profile');
  }
  console.log('✓ TEST 2 PASSED: 404 returned correctly before registration ("Vendor profile not found for authenticated user.")');

  // TEST 3 & 4: Submit Vendor Registration
  console.log('\n[TEST 3 & 4] Submitting Vendor Profile Registration (Royal Events & Decor)...');
  const vendorPayload = {
    businessName: 'Royal Events & Decor',
    category: 'event',
    subCategory: 'decoration',
    servicesOffered: ['Wedding Decoration', 'Stage Decoration'],
    description: 'Professional wedding decoration services.',
    pricing: {
      basePrice: 50000,
      priceUnit: 'per_event',
      currency: 'INR',
    },
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
  };

  const regVendorRes = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(vendorPayload),
  });

  const regVendorData = await regVendorRes.json();
  console.log('Register Vendor Response:', regVendorData);

  if (regVendorRes.status !== 201 || !regVendorData.success || !regVendorData.data?.vendor?._id) {
    throw new Error(`TEST 3 & 4 FAILED: HTTP ${regVendorRes.status} - ${regVendorData.message}`);
  }
  const createdVendorId = regVendorData.data.vendor._id;
  console.log(`✓ TEST 3 & 4 PASSED: HTTP 201 Returned & Vendor created in MongoDB (ID: ${createdVendorId})`);

  // TEST 5: Verify Dashboard Stats endpoint now returns 200 OK with vendor profile
  console.log('\n[TEST 5] Checking Vendor Dashboard stats after registration...');
  const postStatsRes = await fetch(`${API_BASE}/vendors/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const postStatsData = await postStatsRes.json();

  if (postStatsRes.status !== 200 || !postStatsData.success || postStatsData.data?.businessName !== 'Royal Events & Decor') {
    throw new Error('TEST 5 FAILED: Dashboard stats endpoint did not return 200 OK with vendor stats');
  }
  console.log('✓ TEST 5 PASSED: Dashboard stats returned 200 OK with businessName "Royal Events & Decor"');

  // TEST 6: Refresh & Re-query to verify persistence
  console.log('\n[TEST 6] Re-querying vendor profile to verify persistence...');
  const mongoVendor = await Vendor.findById(createdVendorId);
  if (!mongoVendor || mongoVendor.businessName !== 'Royal Events & Decor') {
    throw new Error('TEST 6 FAILED: Vendor document not found in MongoDB');
  }
  console.log('✓ TEST 6 PASSED: Vendor profile verified in MongoDB');

  // TEST 7: Attempt registering again -> Expected: 409 Conflict
  console.log('\n[TEST 7] Attempting duplicate vendor registration...');
  const dupRes = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(vendorPayload),
  });
  const dupData = await dupRes.json();

  if (dupRes.status !== 409 || !dupData.message.includes('already exists')) {
    throw new Error('TEST 7 FAILED: Duplicate vendor registration was not blocked with 409 Conflict');
  }
  console.log('✓ TEST 7 PASSED: Duplicate registration blocked with 409 Conflict ("Vendor profile already exists.")');

  // TEST 8: Verify Service Creation with registered Vendor profile
  console.log('\n[TEST 8] Creating service listing with newly registered vendor profile...');
  const serviceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Royal Stage & Floral Decoration Package',
      description: 'Luxury floral backdrop and stage lighting for weddings.',
      category: 'event',
      subCategory: 'decoration',
      price: 50000,
      priceUnit: 'per_event',
      city: 'Bangalore',
    }),
  }).then((r) => r.json());

  if (!serviceRes.success || !serviceRes.service?._id) {
    throw new Error(`TEST 8 FAILED: Service creation failed for registered vendor: ${serviceRes.message}`);
  }
  console.log('✓ TEST 8 PASSED: Service listing successfully created for newly registered vendor profile!');

  console.log('\n==================================================');
  console.log('🎉 ALL VENDOR REGISTRATION FIX TESTS PASSED PERFECTLY! 🎉');
  console.log('==================================================');

  await mongoose.disconnect();
}

runVendorRegistrationFixTests().catch((err) => {
  console.error('❌ VENDOR REGISTRATION FIX TEST SUITE FAILED:', err);
  mongoose.disconnect();
  process.exit(1);
});
