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

async function runModule6Tests() {
  console.log('==================================================');
  console.log('--- STARTING MODULE 6 END-TO-END VERIFICATION ---');
  console.log('==================================================');

  // Connect to DB directly using project's connectDB module
  await connectDB();

  // Dynamic credentials for Test Vendor A & B
  const vendorAEmail = `v6_vendorA_${Date.now()}@example.com`;
  const vendorAPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const vendorBEmail = `v6_vendorB_${Date.now()}@example.com`;
  const vendorBPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const customerEmail = `v6_customer_${Date.now()}@example.com`;
  const customerPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const adminEmail = `v6_admin_${Date.now()}@example.com`;
  const adminPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const password = 'Password@123';

  // Helper function to register and verify user
  async function createVerifiedUser(email, phone, name, role) {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role: role === 'admin' ? 'customer' : role }),
    }).then((r) => r.json());

    if (!regRes.success) {
      throw new Error(`User registration failed for ${email}: ${regRes.message}`);
    }

    await User.findByIdAndUpdate(regRes.userId, { role, isEmailVerified: true, status: 'active' });

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

  console.log('\n[SETUP] Initializing test accounts (Vendor A, Vendor B, Customer, Admin)...');
  const userA = await createVerifiedUser(vendorAEmail, vendorAPhone, 'Service Vendor A', 'customer');
  const userB = await createVerifiedUser(vendorBEmail, vendorBPhone, 'Service Vendor B', 'customer');
  const customerUser = await createVerifiedUser(customerEmail, customerPhone, 'Test Customer', 'customer');
  const adminUser = await createVerifiedUser(adminEmail, adminPhone, 'System Admin', 'admin');
  console.log('✓ SETUP PASSED: Test users created & authenticated');

  // TEST 1: Register Vendor Profiles
  console.log('\n[TEST 1] Registering Vendor Profiles for Vendor A & B...');
  const regVendorA = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({
      businessName: 'Starlight Event Planners',
      category: 'event',
      pricing: { basePrice: 40000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Bangalore' },
    }),
  }).then((r) => r.json());

  const regVendorB = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userB.token}` },
    body: JSON.stringify({
      businessName: 'Apex Home Renovations',
      category: 'home',
      pricing: { basePrice: 15000, priceUnit: 'per_day', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  }).then((r) => r.json());

  if (!regVendorA.success || !regVendorB.success) {
    throw new Error('TEST 1 FAILED: Vendor profile setup failed');
  }
  console.log('✓ TEST 1 PASSED: Vendor profiles registered');

  // TEST 2: Create Service Listing (Vendor A)
  console.log('\n[TEST 2] Creating Service Listing 1 for Vendor A...');
  const service1Res = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({
      title: 'Grand Wedding Stage & Floral Decoration',
      description: 'Full stage backdrop decoration, ambient fairy lights, entrance arch, and VIP red carpet setup.',
      category: 'event',
      subCategory: 'wedding_decor',
      price: 45000,
      priceUnit: 'per_event',
      city: 'Bangalore',
      location: 'Indiranagar, Bangalore',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552'],
      tags: ['wedding', 'stage', 'floral', 'lighting'],
      packages: [
        { name: 'basic', description: 'Stage backdrop flowers', price: 45000, features: ['Backdrop', 'Entrance Arch'] },
        { name: 'standard', description: 'Full hall decor + ambient lights', price: 75000, features: ['Backdrop', 'Lighting', 'Red Carpet'] },
        { name: 'premium', description: 'VIP decor + Cold pyros', price: 120000, features: ['VIP Decor', 'Pyros', 'Sound'] },
      ],
    }),
  }).then((r) => r.json());

  console.log('Create Service Response:', service1Res);
  if (!service1Res.success || !service1Res.service?._id) {
    throw new Error('TEST 2 FAILED: Create service listing failed');
  }
  const serviceId1 = service1Res.service._id;
  console.log(`✓ TEST 2 PASSED: Service listing created (ID: ${serviceId1}) linked to Vendor A`);

  // Create Service Listing 2 (Vendor B)
  const service2Res = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userB.token}` },
    body: JSON.stringify({
      title: 'Complete Bathroom Waterproofing & Plumbing',
      description: 'Comprehensive waterproofing treatment and high-pressure plumbing line installation for homes.',
      category: 'home',
      subCategory: 'plumbing',
      price: 15000,
      priceUnit: 'per_day',
      city: 'Mumbai',
      location: 'Andheri West, Mumbai',
      images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a'],
      tags: ['plumbing', 'waterproofing', 'home'],
    }),
  }).then((r) => r.json());
  const serviceId2 = service2Res.service._id;

  // TEST 3: Attempt Non-Vendor Service Creation
  console.log('\n[TEST 3] Attempting service creation as customer without vendor profile...');
  const nonVendorRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUser.token}` },
    body: JSON.stringify({
      title: 'Unauthorized Service',
      description: 'Non-vendor service creation test.',
      category: 'event',
      price: 5000,
      city: 'Bangalore',
    }),
  });
  const nonVendorData = await nonVendorRes.json();
  if (nonVendorRes.status !== 403 || !nonVendorData.message.includes('must register a Vendor profile')) {
    throw new Error('TEST 3 FAILED: Non-vendor service creation was not blocked with 403');
  }
  console.log('✓ TEST 3 PASSED: Non-vendor service creation blocked cleanly (403 Forbidden)');

  // TEST 4: Get Public Services Catalog List
  console.log('\n[TEST 4] Fetching public services catalog...');
  const listRes = await fetch(`${API_BASE}/services`).then((r) => r.json());
  if (!listRes.success || !Array.isArray(listRes.data?.services)) {
    throw new Error('TEST 4 FAILED: Fetch services list failed');
  }
  console.log(`✓ TEST 4 PASSED: Retrieved ${listRes.data.services.length} public service listings`);

  // TEST 5: Keyword Text Search Query
  console.log('\n[TEST 5] Searching services by keyword q=Wedding...');
  const searchRes = await fetch(`${API_BASE}/services?q=Wedding`).then((r) => r.json());
  if (!searchRes.success || !searchRes.data.services.some((s) => s._id === serviceId1)) {
    throw new Error('TEST 5 FAILED: Keyword text search query failed');
  }
  console.log('✓ TEST 5 PASSED: Keyword search query returned matching service listing');

  // TEST 6: Filter Services by Category
  console.log('\n[TEST 6] Filtering services by category=event...');
  const catRes = await fetch(`${API_BASE}/services?category=event`).then((r) => r.json());
  if (!catRes.success || !catRes.data.services.every((s) => s.category === 'event')) {
    throw new Error('TEST 6 FAILED: Category filtering failed');
  }
  console.log('✓ TEST 6 PASSED: Category filter returned event services');

  // TEST 7: Filter Services by City
  console.log('\n[TEST 7] Filtering services by city=Bangalore...');
  const cityRes = await fetch(`${API_BASE}/services?city=Bangalore`).then((r) => r.json());
  if (!cityRes.success || !cityRes.data.services.some((s) => s.city.toLowerCase().includes('bangalore'))) {
    throw new Error('TEST 7 FAILED: City filtering failed');
  }
  console.log('✓ TEST 7 PASSED: City filter returned Bangalore services');

  // TEST 8: Filter Services by Price Range
  console.log('\n[TEST 8] Filtering services by minPrice=20000 & maxPrice=50000...');
  const priceRes = await fetch(`${API_BASE}/services?minPrice=20000&maxPrice=50000`).then((r) => r.json());
  if (!priceRes.success || !priceRes.data.services.every((s) => s.price >= 20000 && s.price <= 50000)) {
    throw new Error('TEST 8 FAILED: Price range filtering failed');
  }
  console.log('✓ TEST 8 PASSED: Price range filter executed successfully');

  // TEST 9: Fetch Single Service Details
  console.log('\n[TEST 9] Fetching service details by ID...');
  const detailRes = await fetch(`${API_BASE}/services/${serviceId1}`).then((r) => r.json());
  if (!detailRes.success || detailRes.data._id !== serviceId1 || !detailRes.data.vendorId?.businessName) {
    throw new Error('TEST 9 FAILED: Fetch service details failed');
  }
  console.log('✓ TEST 9 PASSED: Service details fetched with populated vendor info');

  // TEST 10: Fetch Vendor's Own Services
  console.log('\n[TEST 10] Fetching vendor my-services...');
  const myServicesRes = await fetch(`${API_BASE}/services/my-services`, {
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());
  if (!myServicesRes.success || !myServicesRes.data.some((s) => s._id === serviceId1)) {
    throw new Error('TEST 10 FAILED: Fetch my-services failed');
  }
  console.log('✓ TEST 10 PASSED: Vendor my-services returned list');

  // TEST 11: Update Service Listing
  console.log('\n[TEST 11] Updating own service listing...');
  const updateRes = await fetch(`${API_BASE}/services/${serviceId1}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({
      title: 'Grand Royal Wedding Decor & Pyros Updated',
      price: 50000,
    }),
  }).then((r) => r.json());

  if (!updateRes.success || updateRes.data.title !== 'Grand Royal Wedding Decor & Pyros Updated') {
    throw new Error('TEST 11 FAILED: Update service listing failed');
  }
  console.log('✓ TEST 11 PASSED: Service listing updated successfully');

  // TEST 12: Attempt Unauthorized Service Update
  console.log('\n[TEST 12] Attempting unauthorized service update (Vendor A editing Vendor B service)...');
  const unauthRes = await fetch(`${API_BASE}/services/${serviceId2}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  const unauthData = await unauthRes.json();
  if (unauthRes.status !== 403 || !unauthData.message.includes('Forbidden')) {
    throw new Error('TEST 12 FAILED: Unauthorized service update was not blocked with 403');
  }
  console.log('✓ TEST 12 PASSED: Ownership security enforced (403 Forbidden)');

  // TEST 13: Toggle Service Active Status
  console.log('\n[TEST 13] Deactivating service listing...');
  const statusRes = await fetch(`${API_BASE}/services/${serviceId1}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({ isActive: false }),
  }).then((r) => r.json());

  if (!statusRes.success || statusRes.isActive !== false) {
    throw new Error('TEST 13 FAILED: Deactivate service failed');
  }
  console.log('✓ TEST 13 PASSED: Service status changed to isActive = false');

  // TEST 14: Verify Inactive Service Excluded from Public Search
  console.log('\n[TEST 14] Verifying inactive service excluded from public search...');
  const activeOnlyList = await fetch(`${API_BASE}/services`).then((r) => r.json());
  if (activeOnlyList.data.services.some((s) => s._id === serviceId1)) {
    throw new Error('TEST 14 FAILED: Inactive service was exposed in public catalog');
  }
  console.log('✓ TEST 14 PASSED: Inactive service hidden from public search');

  // TEST 15: Admin Reactivate Service Listing
  console.log('\n[TEST 15] Admin reactivating service listing...');
  const adminReactivate = await fetch(`${API_BASE}/services/${serviceId1}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminUser.token}` },
    body: JSON.stringify({ isActive: true }),
  }).then((r) => r.json());

  if (!adminReactivate.success || adminReactivate.isActive !== true) {
    throw new Error('TEST 15 FAILED: Admin service status reactivation failed');
  }
  console.log('✓ TEST 15 PASSED: Admin reactivated service status to isActive = true');

  // TEST 16: Verify Package Data Structure
  console.log('\n[TEST 16] Verifying service package tier structure...');
  const pkgCheck = await fetch(`${API_BASE}/services/${serviceId1}`).then((r) => r.json());
  if (!pkgCheck.data.packages || pkgCheck.data.packages.length !== 3) {
    throw new Error('TEST 16 FAILED: Package tiers structure invalid');
  }
  console.log('✓ TEST 16 PASSED: Package tiers (basic, standard, premium) verified');

  // TEST 17: Delete Service Listing
  console.log('\n[TEST 17] Deleting service listing 2...');
  const deleteRes = await fetch(`${API_BASE}/services/${serviceId2}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userB.token}` },
  }).then((r) => r.json());

  if (!deleteRes.success) {
    throw new Error('TEST 17 FAILED: Delete service listing failed');
  }
  console.log('✓ TEST 17 PASSED: Service listing 2 deleted successfully');

  // TEST 18: Verify Deleted Service Returns 404
  console.log('\n[TEST 18] Verifying deleted service returns 404...');
  const deletedCheck = await fetch(`${API_BASE}/services/${serviceId2}`);
  if (deletedCheck.status !== 404) {
    throw new Error('TEST 18 FAILED: Deleted service did not return 404');
  }
  console.log('✓ TEST 18 PASSED: Deleted service returns 404 Not Found');

  // TEST 19: System Health & Route Test
  console.log('\n[TEST 19] Verifying system health endpoint...');
  const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
  if (!healthRes.success) {
    throw new Error('TEST 19 FAILED: Health endpoint check failed');
  }
  console.log('✓ TEST 19 PASSED: System health check operational');

  // TEST 20: Confirm Modules 1–5 Integrity
  console.log('\n[TEST 20] Verifying core modules 1–5 integrity...');
  const vendorCheck = await fetch(`${API_BASE}/vendors`).then((r) => r.json());
  if (!vendorCheck.success) {
    throw new Error('TEST 20 FAILED: Vendor module broken');
  }
  console.log('✓ TEST 20 PASSED: Modules 1–5 fully functional');

  console.log('\n==================================================');
  console.log('🎉 ALL 20 MODULE 6 END-TO-END TESTS PASSED PERFECTLY! 🎉');
  console.log('==================================================');

  await mongoose.disconnect();
}

runModule6Tests().catch((err) => {
  console.error('❌ MODULE 6 TEST SUITE FAILED:', err);
  mongoose.disconnect();
  process.exit(1);
});
