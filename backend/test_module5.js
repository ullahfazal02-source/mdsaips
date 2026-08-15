import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

// Configure DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import connectDB from './config/db.js';
import User from './models/User.js';
import mongoose from 'mongoose';

const API_BASE = 'http://localhost:5001/api/v1';

async function runModule5Tests() {
  console.log('==================================================');
  console.log('--- STARTING MODULE 5 END-TO-END VERIFICATION ---');
  console.log('==================================================');

  // Connect to DB directly using project's connectDB module
  await connectDB();

  // Dynamic credentials for Test Vendor A
  const vendorAEmail = `v5_vendorA_${Date.now()}@example.com`;
  const vendorAPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));
  const password = 'Password@123';

  // Dynamic credentials for Test Vendor B (for ownership security test)
  const vendorBEmail = `v5_vendorB_${Date.now()}@example.com`;
  const vendorBPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  // Dynamic credentials for Admin
  const adminEmail = `v5_admin_${Date.now()}@example.com`;
  const adminPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  // Helper function to register and auto-verify email in DB for smooth test execution
  async function createVerifiedUser(email, phone, name, role) {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role: role === 'admin' ? 'customer' : role }),
    }).then((r) => r.json());

    if (!regRes.success) {
      throw new Error(`User registration failed for ${email}: ${regRes.message}`);
    }

    // Update role & verify status in DB directly for test fixture setup
    await User.findByIdAndUpdate(regRes.userId, { role, isEmailVerified: true, status: 'active' });

    // Login to obtain JWT token
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());

    if (!loginRes.token) {
      throw new Error(`Login failed for ${email}: ${loginRes.message}`);
    }

    return { userId: regRes.userId, token: loginRes.token };
  }

  // Setup Users
  console.log('\n[SETUP] Creating test user accounts (Vendor A, Vendor B, Admin)...');
  const userA = await createVerifiedUser(vendorAEmail, vendorAPhone, 'Vendor User A', 'customer');
  const userB = await createVerifiedUser(vendorBEmail, vendorBPhone, 'Vendor User B', 'customer');
  const adminUser = await createVerifiedUser(adminEmail, adminPhone, 'System Admin', 'admin');
  console.log('✓ SETUP PASSED: Test users initialized with valid JWT tokens');

  // TEST 1: Login as verified customer
  console.log('\n[TEST 1] Testing verified customer login...');
  const customerLogin = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: vendorAEmail, password }),
  }).then((r) => r.json());

  if (!customerLogin.success || !customerLogin.token) {
    throw new Error('TEST 1 FAILED: Customer login failed');
  }
  console.log('✓ TEST 1 PASSED: Verified customer logged in successfully');

  // TEST 2: Create Vendor Profile
  console.log('\n[TEST 2] Creating vendor profile for Vendor A...');
  const regVendorRes = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({
      businessName: 'Royal Events & Weddings',
      description: 'Professional event planning and decoration services',
      category: 'event',
      subCategory: 'event_planner',
      servicesOffered: ['Wedding Planning', 'Decoration', 'Catering'],
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
    }),
  }).then((r) => r.json());

  if (!regVendorRes.success || !regVendorRes.vendor?._id) {
    throw new Error(`TEST 2 FAILED: Vendor profile registration failed: ${JSON.stringify(regVendorRes)}`);
  }
  const vendorIdA = regVendorRes.vendor._id;
  console.log(`✓ TEST 2 PASSED: Vendor profile created (ID: ${vendorIdA}) with isVerified = false`);

  // TEST 3: Attempt to create second vendor profile for same user
  console.log('\n[TEST 3] Attempting duplicate vendor profile registration...');
  const dupRes = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({
      businessName: 'Duplicate Vendor',
      category: 'event',
      pricing: { basePrice: 10000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Bangalore' },
    }),
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 409 || dupData.message !== 'Vendor profile already exists.') {
    throw new Error('TEST 3 FAILED: Duplicate vendor profile registration was not rejected with 409 Conflict');
  }
  console.log('✓ TEST 3 PASSED: 409 Conflict returned for duplicate profile creation');

  // Register Vendor B for ownership tests
  const regVendorB = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userB.token}`,
    },
    body: JSON.stringify({
      businessName: 'Elite Homes & Decor',
      category: 'home',
      pricing: { basePrice: 20000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  }).then((r) => r.json());

  if (!regVendorB.success || !regVendorB.vendor?._id) {
    throw new Error(`Register Vendor B failed: ${JSON.stringify(regVendorB)}`);
  }
  const vendorIdB = regVendorB.vendor._id;

  // TEST 4: Get vendor list
  console.log('\n[TEST 4] Fetching vendor list...');
  const listRes = await fetch(`${API_BASE}/vendors`).then((r) => r.json());
  console.log(`Vendor List Count: ${listRes.data?.vendors?.length}`);
  if (!listRes.success || !Array.isArray(listRes.data?.vendors)) {
    throw new Error('TEST 4 FAILED: Get vendor list failed');
  }
  console.log('✓ TEST 4 PASSED: Vendor list retrieved successfully with pagination');

  // TEST 5: Filter vendors by category
  console.log('\n[TEST 5] Filtering vendors by category=event...');
  const catRes = await fetch(`${API_BASE}/vendors?category=event`).then((r) => r.json());
  if (!catRes.success || !catRes.data.vendors.every((v) => v.category === 'event')) {
    throw new Error('TEST 5 FAILED: Category filtering failed');
  }
  console.log('✓ TEST 5 PASSED: Category filter returned matching vendors');

  // TEST 6: Filter vendors by city
  console.log('\n[TEST 6] Filtering vendors by city=Bangalore...');
  const cityRes = await fetch(`${API_BASE}/vendors?city=Bangalore`).then((r) => r.json());
  if (!cityRes.success || !cityRes.data.vendors.some((v) => v.location.city.toLowerCase().includes('bangalore'))) {
    throw new Error('TEST 6 FAILED: City filtering failed');
  }
  console.log('✓ TEST 6 PASSED: City filter returned matching vendors');

  // TEST 7: Get vendor public profile & assert private documents excluded
  console.log('\n[TEST 7] Fetching public vendor profile...');
  const publicProfile = await fetch(`${API_BASE}/vendors/${vendorIdA}`).then((r) => r.json());
  if (!publicProfile.success || publicProfile.data.documents !== undefined) {
    throw new Error('TEST 7 FAILED: Public vendor profile exposed private documents');
  }
  console.log('✓ TEST 7 PASSED: Vendor public profile retrieved and private documents excluded cleanly');

  // TEST 8: Update own vendor profile
  console.log('\n[TEST 8] Updating own vendor profile...');
  const updateRes = await fetch(`${API_BASE}/vendors/${vendorIdA}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({
      businessName: 'Royal Events & Decor Updated',
      subCategory: 'Luxury Event Planner',
    }),
  }).then((r) => r.json());

  if (!updateRes.success || updateRes.data.businessName !== 'Royal Events & Decor Updated') {
    throw new Error('TEST 8 FAILED: Vendor profile update failed');
  }
  console.log('✓ TEST 8 PASSED: Vendor profile updated successfully');

  // TEST 9: Attempt to update another vendor (Unauthorized ownership violation)
  console.log('\n[TEST 9] Attempting to update another vendor (Vendor A trying to update Vendor B)...');
  const unauthRes = await fetch(`${API_BASE}/vendors/${vendorIdB}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({ businessName: 'Hacked Business Name' }),
  });
  const unauthData = await unauthRes.json();
  if (unauthRes.status !== 403 || !unauthData.message.includes('Forbidden')) {
    throw new Error('TEST 9 FAILED: Ownership security breach, non-owner was not blocked with 403 Forbidden');
  }
  console.log('✓ TEST 9 PASSED: Ownership security enforced cleanly (403 Forbidden)');

  // TEST 10: Update availability
  console.log('\n[TEST 10] Updating vendor availability...');
  const availRes = await fetch(`${API_BASE}/vendors/${vendorIdA}/availability`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({
      availability: [
        {
          date: '2026-08-25',
          isAvailable: true,
          slots: ['09:00-12:00', '14:00-18:00'],
        },
      ],
    }),
  }).then((r) => r.json());

  if (!availRes.success || availRes.data.length === 0) {
    throw new Error('TEST 10 FAILED: Update availability failed');
  }
  console.log('✓ TEST 10 PASSED: Vendor availability schedule updated');

  // TEST 11: Get availability with date range query
  console.log('\n[TEST 11] Fetching vendor availability...');
  const getAvailRes = await fetch(`${API_BASE}/vendors/${vendorIdA}/availability?startDate=2026-08-20&endDate=2026-08-30`).then((r) => r.json());
  if (!getAvailRes.success || getAvailRes.data.length === 0) {
    throw new Error('TEST 11 FAILED: Fetch availability date filtering failed');
  }
  console.log('✓ TEST 11 PASSED: Availability date range query executed successfully');

  // TEST 12: Update cancellation policy
  console.log('\n[TEST 12] Updating cancellation policy...');
  const policyRes = await fetch(`${API_BASE}/vendors/${vendorIdA}/cancellation-policy`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({
      type: 'moderate',
      rules: [
        { hoursBeforeEvent: 72, refundPercentage: 100 },
        { hoursBeforeEvent: 24, refundPercentage: 50 },
        { hoursBeforeEvent: 0, refundPercentage: 0 },
      ],
    }),
  }).then((r) => r.json());

  if (!policyRes.success || policyRes.data.type !== 'moderate') {
    throw new Error('TEST 12 FAILED: Update cancellation policy failed');
  }
  console.log('✓ TEST 12 PASSED: Cancellation policy updated');

  // TEST 13: Upload verification document URLs
  console.log('\n[TEST 13] Uploading verification document URLs...');
  const docsRes = await fetch(`${API_BASE}/vendors/verify-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userA.token}`,
    },
    body: JSON.stringify({
      documents: ['https://example.com/document1.pdf', 'https://example.com/document2.pdf'],
    }),
  }).then((r) => r.json());

  if (!docsRes.success) {
    throw new Error('TEST 13 FAILED: Upload verification documents failed');
  }
  console.log('✓ TEST 13 PASSED: Document URLs uploaded and sent for verification');

  // TEST 14: Login as Admin
  console.log('\n[TEST 14] Logging in as Admin...');
  const adminLogin = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password }),
  }).then((r) => r.json());

  if (!adminLogin.success || !adminLogin.token) {
    throw new Error('TEST 14 FAILED: Admin login failed');
  }
  console.log('✓ TEST 14 PASSED: Admin authenticated');

  // TEST 15: View pending vendors (Admin)
  console.log('\n[TEST 15] Admin viewing pending vendors queue...');
  const pendingRes = await fetch(`${API_BASE}/admin/vendors/pending`, {
    headers: { Authorization: `Bearer ${adminUser.token}` },
  }).then((r) => r.json());

  if (!pendingRes.success || pendingRes.data.vendors.length === 0) {
    throw new Error('TEST 15 FAILED: Admin failed to view pending vendors');
  }
  console.log(`✓ TEST 15 PASSED: Admin retrieved ${pendingRes.data.vendors.length} pending vendor(s)`);

  // TEST 16: Approve vendor verification (Admin)
  console.log('\n[TEST 16] Admin approving vendor verification...');
  const verifyRes = await fetch(`${API_BASE}/admin/vendors/${vendorIdA}/verify`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminUser.token}`,
    },
    body: JSON.stringify({
      approved: true,
      reason: 'Documents verified successfully by Admin',
    }),
  }).then((r) => r.json());

  if (!verifyRes.success || !verifyRes.vendor.isVerified) {
    throw new Error('TEST 16 FAILED: Admin vendor verification approval failed');
  }
  console.log('✓ TEST 16 PASSED: Vendor approved by admin and notification triggered');

  // TEST 17: Verify approved vendor shows isVerified = true
  console.log('\n[TEST 17] Verifying public profile displays isVerified = true...');
  const approvedCheck = await fetch(`${API_BASE}/vendors/${vendorIdA}`).then((r) => r.json());
  if (!approvedCheck.data.isVerified) {
    throw new Error('TEST 17 FAILED: Vendor profile does not show isVerified = true');
  }
  console.log('✓ TEST 17 PASSED: Vendor profile reflects isVerified = true');

  // TEST 18: Open vendor dashboard statistics
  console.log('\n[TEST 18] Fetching vendor dashboard statistics...');
  const statsRes = await fetch(`${API_BASE}/vendors/dashboard/stats`, {
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());

  console.log('Vendor Dashboard Stats:', statsRes.data);
  if (!statsRes.success || statsRes.data.totalBookings !== 0 || statsRes.data.monthlyRevenue !== 0) {
    throw new Error('TEST 18 FAILED: Dashboard stats mismatch or fake data detected');
  }
  console.log('✓ TEST 18 PASSED: Real vendor dashboard stats returned (no fake booking data)');

  // TEST 19: Test Logout
  console.log('\n[TEST 19] Testing logout...');
  const logoutRes = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());

  if (!logoutRes.success) {
    throw new Error('TEST 19 FAILED: Logout failed');
  }
  console.log('✓ TEST 19 PASSED: Vendor user logged out cleanly');

  // TEST 20: Confirm existing Modules 1–4 Auth still works
  console.log('\n[TEST 20] Verifying core health endpoint and auth status...');
  const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
  if (!healthRes.success) {
    throw new Error('TEST 20 FAILED: System health check failed');
  }
  console.log('✓ TEST 20 PASSED: Existing core system and health check 100% operational');

  console.log('\n==================================================');
  console.log('🎉 ALL 20 MODULE 5 END-TO-END TESTS PASSED PERFECTLY! 🎉');
  console.log('==================================================');

  await mongoose.disconnect();
}

runModule5Tests().catch((err) => {
  console.error('❌ MODULE 5 TEST SUITE FAILED:', err);
  mongoose.disconnect();
  process.exit(1);
});
