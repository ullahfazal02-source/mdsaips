import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import connectDB from './config/db.js';
import { User, Vendor, Service, Booking } from './models/index.js';
import mongoose from 'mongoose';

const API_BASE = 'http://localhost:5001/api/v1';

async function runModule7V2Tests() {
  console.log('==================================================');
  console.log('--- STARTING MODULE 7 ENHANCED SPECIFICATION TESTS ---');
  console.log('==================================================');

  await connectDB();

  const ts = Date.now();
  const vendorAEmail = `v7v2_vendorA_${ts}@example.com`;
  const vendorAPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const vendorBEmail = `v7v2_vendorB_${ts}@example.com`;
  const vendorBPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const customerEmail = `v7v2_customer_${ts}@example.com`;
  const customerPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const adminEmail = `admin@mdsaips.com`; // Admin account seeded
  const password = 'Password@123';

  // Helper function to register and verify user
  async function createVerifiedUser(email, phone, name, role) {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role: role === 'vendor' ? 'vendor' : 'customer' }),
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

  // Admin login helper
  async function getAdminToken() {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'Iqrar@N11' }),
    }).then((r) => r.json());

    if (!loginRes.token) {
      throw new Error(`Admin login failed: ${loginRes.message}`);
    }
    return loginRes.token;
  }

  console.log('\n[SETUP] Creating test users and logging in Admin...');
  const userVendorA = await createVerifiedUser(vendorAEmail, vendorAPhone, 'Vendor Alpha', 'vendor');
  const userVendorB = await createVerifiedUser(vendorBEmail, vendorBPhone, 'Vendor Beta', 'vendor');
  const userCustomer = await createVerifiedUser(customerEmail, customerPhone, 'Normal Customer', 'customer');
  const adminToken = await getAdminToken();
  console.log('✓ SETUP PASSED: Test users and Admin authenticated');

  // TEST 7 & 8: Vendor Verification Lifecycle (Unverified -> Admin Approved)
  console.log('\n[TEST 7] Registering Vendor A Profile (Verification initial state check)...');
  const regVendorA = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorA.token}` },
    body: JSON.stringify({
      businessName: 'Apex Multi-Services Ltd',
      category: 'event',
      pricing: { basePrice: 40000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Bangalore' },
    }),
  }).then((r) => r.json());

  const regVendorB = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorB.token}` },
    body: JSON.stringify({
      businessName: 'Beta Construction & Hospitality',
      category: 'construction',
      pricing: { basePrice: 100000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  }).then((r) => r.json());

  const vendorObjA = await Vendor.findOne({ userId: userVendorA.userId });
  const vendorObjB = await Vendor.findOne({ userId: userVendorB.userId });

  if (vendorObjA.isVerified !== false) {
    throw new Error('TEST 7 FAILED: Vendor A isVerified should initially be false');
  }
  console.log('✓ TEST 7 PASSED: Vendor registration creates profile with isVerified = false (pending admin review)');

  console.log('\n[TEST 8] Admin approving Vendor A & B verification...');
  const verifyResA = await fetch(`${API_BASE}/admin/vendors/${vendorObjA._id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ approved: true, reason: 'Documents verified and approved' }),
  }).then((r) => r.json());

  const verifyResB = await fetch(`${API_BASE}/admin/vendors/${vendorObjB._id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ approved: true, reason: 'Documents verified and approved' }),
  }).then((r) => r.json());

  const updatedVendorA = await Vendor.findById(vendorObjA._id);
  if (!updatedVendorA.isVerified) {
    throw new Error('TEST 8 FAILED: Admin approval did not set isVerified = true');
  }
  console.log('✓ TEST 8 PASSED: Admin approved vendor profile -> isVerified = true');

  // SETUP SERVICES FOR ALL 4 DOMAINS
  console.log('\n[SETUP] Creating multi-domain service listings (Event, Construction, Home, Accommodation)...');
  
  // 1. Event Service (Vendor A)
  const serviceEventRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorA.token}` },
    body: JSON.stringify({
      title: 'Grand Wedding Event Management',
      description: 'Complete luxury stage and wedding decorations with natural flowers.',
      category: 'event',
      price: 50000,
      city: 'Bangalore',
      packages: [{ name: 'basic', price: 50000, description: 'Basic Event Setup' }],
    }),
  }).then((r) => r.json());

  // 2. Construction Service (Vendor B)
  const serviceConstructionRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorB.token}` },
    body: JSON.stringify({
      title: 'Villa Structural Renovation & Civil Design',
      description: 'Turnkey structural civil engineering and architectural interior remodeling.',
      category: 'construction',
      price: 150000,
      city: 'Mumbai',
      packages: [{ name: 'standard', price: 150000, description: 'Complete Renovation Package' }],
    }),
  }).then((r) => r.json());

  // 3. Home Service (Vendor A)
  const serviceHomeRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorA.token}` },
    body: JSON.stringify({
      title: 'Whole House Deep Cleaning & Sanitization',
      description: 'Professional residential deep cleaning and pest control services.',
      category: 'home',
      price: 8000,
      city: 'Bangalore',
      packages: [{ name: 'basic', price: 8000, description: 'Full House Cleaning' }],
    }),
  }).then((r) => r.json());

  // 4. Accommodation Service (Vendor B)
  const serviceAccommodationRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorB.token}` },
    body: JSON.stringify({
      title: 'Luxury Beach Resort Villa Stay',
      description: '5-star ocean view villa accommodation with complimentary breakfast.',
      category: 'accommodation',
      price: 12000,
      city: 'Goa',
      packages: [{ name: 'premium', price: 12000, description: '2 Days / 1 Night Deluxe Villa' }],
    }),
  }).then((r) => r.json());

  const eventServiceId = serviceEventRes.service._id;
  const constructionServiceId = serviceConstructionRes.service._id;
  const homeServiceId = serviceHomeRes.service._id;
  const accommodationServiceId = serviceAccommodationRes.service._id;

  const targetDateEvent = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const targetDateConstruction = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const targetDateHome = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const targetDateAccIn = new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const targetDateAccOut = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // TEST 1: Normal customer books EVENT service
  console.log('\n[TEST 1] Customer booking Event Service...');
  const test1Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userCustomer.token}` },
    body: JSON.stringify({
      serviceId: eventServiceId,
      packageSelected: 'basic',
      eventDate: targetDateEvent,
      eventDetails: {
        eventType: 'Wedding',
        guestCount: 300,
        venue: 'Grand Palace',
        address: 'MG Road Bangalore',
      },
    }),
  }).then((r) => r.json());

  if (!test1Res.success) throw new Error(`TEST 1 FAILED: ${test1Res.message}`);
  console.log('✓ TEST 1 PASSED: Normal customer successfully booked Event Service');

  // TEST 2: Normal customer books CONSTRUCTION service
  console.log('\n[TEST 2] Customer booking Construction Service...');
  const test2Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userCustomer.token}` },
    body: JSON.stringify({
      serviceId: constructionServiceId,
      packageSelected: 'standard',
      eventDetails: {
        projectType: 'Villa Renovation',
        propertyType: 'Residential',
        area: 2500,
        unit: 'sqft',
        projectLocation: 'Bandra West Mumbai',
        estimatedBudget: 150000,
        preferredStartDate: targetDateConstruction,
        projectDescription: 'Full interior fit-out',
      },
    }),
  }).then((r) => r.json());

  if (!test2Res.success) throw new Error(`TEST 2 FAILED: ${test2Res.message}`);
  if (test2Res.data.eventDetails.projectType !== 'Villa Renovation') {
    throw new Error('TEST 2 FAILED: Domain-specific construction details not stored correctly');
  }
  console.log('✓ TEST 2 PASSED: Normal customer successfully booked Construction Service with dynamic details');

  // TEST 3: Normal customer books HOME service
  console.log('\n[TEST 3] Customer booking Home Service...');
  const test3Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userCustomer.token}` },
    body: JSON.stringify({
      serviceId: homeServiceId,
      packageSelected: 'basic',
      eventDetails: {
        serviceType: 'Deep Cleaning',
        problemDescription: 'Post-renovation dust cleaning',
        preferredDate: targetDateHome,
        preferredTime: 'Morning',
        serviceAddress: 'Indiranagar Bangalore',
        urgency: 'Normal',
      },
    }),
  }).then((r) => r.json());

  if (!test3Res.success) throw new Error(`TEST 3 FAILED: ${test3Res.message}`);
  if (test3Res.data.eventDetails.serviceType !== 'Deep Cleaning') {
    throw new Error('TEST 3 FAILED: Domain-specific home details not stored correctly');
  }
  console.log('✓ TEST 3 PASSED: Normal customer successfully booked Home Service with dynamic details');

  // TEST 4: Normal customer books ACCOMMODATION service
  console.log('\n[TEST 4] Customer booking Accommodation Service...');
  const test4Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userCustomer.token}` },
    body: JSON.stringify({
      serviceId: accommodationServiceId,
      packageSelected: 'premium',
      eventDetails: {
        checkInDate: targetDateAccIn,
        checkOutDate: targetDateAccOut,
        guests: 4,
        rooms: 2,
        guestDetails: 'Primary: John Doe',
        specialRequests: 'Sea view room',
      },
    }),
  }).then((r) => r.json());

  if (!test4Res.success) throw new Error(`TEST 4 FAILED: ${test4Res.message}`);
  if (test4Res.data.eventDetails.rooms !== 2) {
    throw new Error('TEST 4 FAILED: Domain-specific accommodation details not stored correctly');
  }
  console.log('✓ TEST 4 PASSED: Normal customer successfully booked Accommodation Service with dynamic details');

  // TEST 5: Vendor A books Vendor B's service (Vendor-as-Customer)
  console.log('\n[TEST 5] Vendor A booking Vendor B\'s Construction Service (Vendor-as-Customer)...');
  const test5Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorA.token}` },
    body: JSON.stringify({
      serviceId: constructionServiceId,
      packageSelected: 'standard',
      eventDetails: {
        projectType: 'Office Fit-out',
        propertyType: 'Commercial',
        projectLocation: 'MG Road Bangalore',
        preferredStartDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    }),
  }).then((r) => r.json());

  if (!test5Res.success) throw new Error(`TEST 5 FAILED: Vendor A should be allowed to book Vendor B's service: ${test5Res.message}`);
  console.log('✓ TEST 5 PASSED: Vendor A successfully booked Vendor B\'s service (Vendor-as-Customer allowed)');

  // TEST 6: Vendor A attempts to book Vendor A's OWN service
  console.log('\n[TEST 6] Vendor A attempting to book Vendor A\'s OWN Event Service...');
  const test6Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userVendorA.token}` },
    body: JSON.stringify({
      serviceId: eventServiceId,
      packageSelected: 'basic',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventDetails: {
        eventType: 'Wedding',
        address: 'Bangalore',
      },
    }),
  }).then((r) => r.json());

  if (test6Res.success) {
    throw new Error('TEST 6 FAILED: Vendor A was incorrectly allowed to book their own service');
  }
  if (test6Res.message !== 'You cannot book your own service.') {
    throw new Error(`TEST 6 FAILED: Unexpected error message: ${test6Res.message}`);
  }
  console.log('✓ TEST 6 PASSED: Vendor A prohibited from booking own service (400 "You cannot book your own service.")');

  console.log('\n==================================================');
  console.log(' 🎉 ALL 8 SPECIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');

  await mongoose.connection.close();
  process.exit(0);
}

runModule7V2Tests().catch((err) => {
  console.error('\n❌ MODULE 7 ENHANCED TEST SUITE FAILED:', err.message);
  process.exit(1);
});
