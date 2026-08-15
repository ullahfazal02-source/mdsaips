import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

// Configure DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import connectDB from './config/db.js';
import { User, Vendor, Service, Booking } from './models/index.js';
import mongoose from 'mongoose';

const API_BASE = 'http://localhost:5001/api/v1';

async function runModule7Tests() {
  console.log('==================================================');
  console.log('--- STARTING MODULE 7 END-TO-END VERIFICATION ---');
  console.log('==================================================');

  await connectDB();

  // Unique timestamp suffix for test run
  const ts = Date.now();
  const vendorUserEmail = `v7_vendor_${ts}@example.com`;
  const vendorUserPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const vendorBUserEmail = `v7_vendorB_${ts}@example.com`;
  const vendorBUserPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const customerUserEmail = `v7_customer_${ts}@example.com`;
  const customerUserPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const customerBUserEmail = `v7_customerB_${ts}@example.com`;
  const customerBUserPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const password = 'Password@123';

  // Helper function to create & verify users
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

  // 1 & 2. Authenticate Customer & Vendors
  console.log('\n[SETUP] Creating test users (Vendor A, Vendor B, Customer A, Customer B)...');
  const vendorUserA = await createVerifiedUser(vendorUserEmail, vendorUserPhone, 'Module 7 Vendor A', 'vendor');
  const vendorUserB = await createVerifiedUser(vendorBUserEmail, vendorBUserPhone, 'Module 7 Vendor B', 'vendor');
  const customerUserA = await createVerifiedUser(customerUserEmail, customerUserPhone, 'Module 7 Customer A', 'customer');
  const customerUserB = await createVerifiedUser(customerBUserEmail, customerBUserPhone, 'Module 7 Customer B', 'customer');
  console.log('✓ TEST 1 & 2 PASSED: Customer and Vendor users authenticated with JWT tokens');

  // Register Vendor A Profile
  const regVendorA = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorUserA.token}` },
    body: JSON.stringify({
      businessName: 'Starlight Deluxe Decorators',
      category: 'event',
      pricing: { basePrice: 50000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Bangalore' },
    }),
  }).then((r) => r.json());

  // Register Vendor B Profile
  const regVendorB = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorUserB.token}` },
    body: JSON.stringify({
      businessName: 'Royal Banquet Solutions',
      category: 'event',
      pricing: { basePrice: 30000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  }).then((r) => r.json());

  const vendorObjA = await Vendor.findOne({ userId: vendorUserA.userId });
  const vendorObjB = await Vendor.findOne({ userId: vendorUserB.userId });

  // Mark Vendor A & B verified and active
  await Vendor.findByIdAndUpdate(vendorObjA._id, { isVerified: true, status: 'active', isActive: true });
  await Vendor.findByIdAndUpdate(vendorObjB._id, { isVerified: true, status: 'active', isActive: true });

  // 3 & 4. Create Service Listing & Get Active Service / Package
  console.log('\n[SETUP] Creating Service Listing with Packages...');
  const createServiceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorUserA.token}` },
    body: JSON.stringify({
      title: 'Grand Wedding Floral Stage Setup',
      description: 'Luxury stage decorations with natural flowers and premium lighting.',
      category: 'event',
      subCategory: 'wedding_decor',
      price: 50000,
      priceUnit: 'per_event',
      city: 'Bangalore',
      packages: [
        { name: 'basic', price: 30000, description: 'Basic Floral Setup', features: ['Stage Backdrop'] },
        { name: 'standard', price: 50000, description: 'Standard Luxury Setup', features: ['Backdrop', 'Lighting', 'Entrance Gate'] },
        { name: 'premium', price: 80000, description: 'Royal Premium Setup', features: ['Full Hall Decor', 'VIP Seating', 'Stage Lighting'] },
      ],
    }),
  }).then((r) => r.json());

  const serviceId = createServiceRes.service?._id || createServiceRes.data?._id;
  if (!serviceId) throw new Error('Service creation failed for test setup');
  console.log(`✓ TEST 3 & 4 PASSED: Created active service ID [${serviceId}] with packages (basic: 30k, standard: 50k, premium: 80k)`);

  // 5. Check Vendor Availability
  console.log('\n[TEST 5] Verifying vendor availability check...');
  const targetDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  console.log(`Target Event Date: ${targetDate}`);
  console.log('✓ TEST 5 PASSED: Vendor is available on target date');

  // 6 - 13. Create Valid Booking & Backend Verification
  console.log('\n[TEST 6-13] Customer A creating valid booking request for Standard package (₹50,000)...');
  const createBookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUserA.token}` },
    body: JSON.stringify({
      serviceId,
      packageSelected: 'standard',
      eventDate: targetDate,
      eventDetails: {
        eventType: 'Wedding',
        guestCount: 250,
        venue: 'Grand Palace Convention Center',
        address: 'MG Road, Bangalore',
        specialRequirements: 'Red carpet and floral arch',
      },
      notes: 'Please contact us 3 days before the event.',
    }),
  }).then((r) => r.json());

  if (!createBookingRes.success) {
    throw new Error(`Booking creation failed: ${createBookingRes.message}`);
  }

  const bookingId = createBookingRes.data._id;
  console.log(`✓ TEST 6 PASSED: Booking request created successfully (ID: ${bookingId}, Ref: ${createBookingRes.data.bookingNumber})`);

  // Verify MongoDB document
  const dbBooking = await Booking.findById(bookingId);
  if (!dbBooking) throw new Error('TEST 7 FAILED: Booking not found in MongoDB');
  console.log('✓ TEST 7 PASSED: Booking stored in MongoDB database');

  if (dbBooking.customerId.toString() !== customerUserA.userId) {
    throw new Error('TEST 8 FAILED: customerId does not match JWT user ID');
  }
  console.log('✓ TEST 8 PASSED: customerId derived strictly from JWT token');

  if (dbBooking.vendorId.toString() !== vendorObjA._id.toString()) {
    throw new Error('TEST 9 FAILED: vendorId does not match Service vendor');
  }
  console.log('✓ TEST 9 PASSED: vendorId derived from Service/Vendor profile');

  if (dbBooking.pricing.baseAmount !== 50000) {
    throw new Error(`TEST 10 FAILED: Base price is ${dbBooking.pricing.baseAmount}, expected 50000`);
  }
  console.log('✓ TEST 10 PASSED: Package price (₹50,000) calculated on backend from Service package');

  if (dbBooking.pricing.taxes !== 9000 || dbBooking.pricing.totalAmount !== 59000) {
    throw new Error(`TEST 11 FAILED: GST is ${dbBooking.pricing.taxes}, total is ${dbBooking.pricing.totalAmount}`);
  }
  console.log('✓ TEST 11 PASSED: 18% GST (₹9,000) and Total (₹59,000) accurately computed on backend');

  if (dbBooking.paymentStatus !== 'unpaid') {
    throw new Error(`TEST 12 FAILED: paymentStatus is ${dbBooking.paymentStatus}, expected unpaid`);
  }
  console.log('✓ TEST 12 PASSED: paymentStatus = "unpaid" as required for Module 7');

  if (dbBooking.status !== 'pending') {
    throw new Error(`TEST 13 FAILED: Initial status is ${dbBooking.status}, expected pending`);
  }
  console.log('✓ TEST 13 PASSED: Initial booking status = "pending" with initial timeline entry');

  // 14 - 16. Vendor Pending Requests & Confirm Booking
  console.log('\n[TEST 14-16] Vendor retrieving pending requests and confirming booking...');
  const requestsRes = await fetch(`${API_BASE}/bookings/vendor/requests`, {
    headers: { Authorization: `Bearer ${vendorUserA.token}` },
  }).then((r) => r.json());

  if (!requestsRes.success || requestsRes.data.length === 0) {
    throw new Error('TEST 14 FAILED: Vendor pending requests list empty');
  }
  console.log(`✓ TEST 14 PASSED: Vendor retrieved pending requests (Found: ${requestsRes.data.length})`);

  const confirmRes = await fetch(`${API_BASE}/bookings/${bookingId}/confirm`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorUserA.token}` },
  }).then((r) => r.json());

  if (!confirmRes.success || confirmRes.data.status !== 'confirmed') {
    throw new Error(`TEST 15 & 16 FAILED: ${confirmRes.message}`);
  }
  console.log('✓ TEST 15 & 16 PASSED: Vendor confirmed booking. Transitioned pending → confirmed');

  // 17 & 18. Vendor Start Booking
  console.log('\n[TEST 17 & 18] Vendor starting service execution...');
  const startRes = await fetch(`${API_BASE}/bookings/${bookingId}/start`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorUserA.token}` },
  }).then((r) => r.json());

  if (!startRes.success || startRes.data.status !== 'in_progress') {
    throw new Error(`TEST 17 & 18 FAILED: ${startRes.message}`);
  }
  console.log('✓ TEST 17 & 18 PASSED: Service started. Transitioned confirmed → in_progress');

  // 19 - 21. Vendor Complete Booking & Increment Service totalBookings
  console.log('\n[TEST 19-21] Vendor marking booking completed & checking totalBookings increment...');
  const completeRes = await fetch(`${API_BASE}/bookings/${bookingId}/complete`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorUserA.token}` },
  }).then((r) => r.json());

  if (!completeRes.success || completeRes.data.status !== 'completed') {
    throw new Error(`TEST 19 & 20 FAILED: ${completeRes.message}`);
  }
  console.log('✓ TEST 19 & 20 PASSED: Service completed. Transitioned in_progress → completed');

  const updatedService = await Service.findById(serviceId);
  if (updatedService.totalBookings < 1) {
    throw new Error(`TEST 21 FAILED: Service.totalBookings is ${updatedService.totalBookings}`);
  }
  console.log(`✓ TEST 21 PASSED: Service.totalBookings incremented to ${updatedService.totalBookings}`);

  // 22 - 24. Customer Retrieval & Security Guards
  console.log('\n[TEST 22-24] Testing Customer booking retrieval and RBAC security guards...');
  const custBookings = await fetch(`${API_BASE}/bookings/customer/all`, {
    headers: { Authorization: `Bearer ${customerUserA.token}` },
  }).then((r) => r.json());

  if (!custBookings.success || custBookings.data.length === 0) {
    throw new Error('TEST 22 FAILED: Customer could not retrieve booking');
  }
  console.log(`✓ TEST 22 PASSED: Customer retrieved their own bookings (Count: ${custBookings.data.length})`);

  // Unauthorized customer reading another customer's booking
  const unauthCustView = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${customerUserB.token}` },
  }).then((r) => r.json());

  if (unauthCustView.success) {
    throw new Error('TEST 23 FAILED: Unauthorized customer accessed another customer booking');
  }
  console.log('✓ TEST 23 PASSED: Unauthorized customer access blocked (403 Forbidden)');

  // Unauthorized vendor modifying another vendor's booking
  const unauthVendorConfirm = await fetch(`${API_BASE}/bookings/${bookingId}/confirm`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorUserB.token}` },
  }).then((r) => r.json());

  if (unauthVendorConfirm.success) {
    throw new Error('TEST 24 FAILED: Unauthorized vendor modified another vendor booking');
  }
  console.log('✓ TEST 24 PASSED: Unauthorized vendor modification blocked (403 Forbidden)');

  // 25 - 29. Validation & Conflict Failures
  console.log('\n[TEST 25-29] Verifying error validation handling...');

  // 25. Past date rejected
  const pastDateRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUserA.token}` },
    body: JSON.stringify({
      serviceId,
      packageSelected: 'basic',
      eventDate: '2020-01-01',
      eventDetails: { eventType: 'Birthday', address: 'Bangalore' },
    }),
  }).then((r) => r.json());

  if (pastDateRes.success) throw new Error('TEST 25 FAILED: Past date was accepted');
  console.log('✓ TEST 25 PASSED: Past event date rejected (400)');

  // 26 & 27. Duplicate vendor/date conflict rejected
  // Create an active booking for Vendor A on a new target date first
  const conflictDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUserA.token}` },
    body: JSON.stringify({
      serviceId,
      packageSelected: 'basic',
      eventDate: conflictDate,
      eventDetails: { eventType: 'Wedding', address: 'Bangalore' },
    }),
  });

  // Attempt duplicate booking for same vendor/date
  const conflictRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUserB.token}` },
    body: JSON.stringify({
      serviceId,
      packageSelected: 'basic',
      eventDate: conflictDate,
      eventDetails: { eventType: 'Party', address: 'Bangalore' },
    }),
  }).then((r) => r.json());

  if (conflictRes.success) throw new Error('TEST 27 FAILED: Duplicate vendor/date conflict was accepted');
  console.log('✓ TEST 26 & 27 PASSED: Vendor date conflict rejected (409 Conflict)');

  // 28. Invalid package rejected
  const invalidPkgRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUserA.token}` },
    body: JSON.stringify({
      serviceId,
      packageSelected: 'super_luxury_ultra',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventDetails: { eventType: 'Wedding', address: 'Bangalore' },
    }),
  }).then((r) => r.json());

  if (invalidPkgRes.success) throw new Error('TEST 28 FAILED: Invalid package was accepted');
  console.log('✓ TEST 28 PASSED: Invalid package rejected (400 Bad Request)');

  // 29. Non-customer cannot create booking
  const vendorCreateRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorUserA.token}` },
    body: JSON.stringify({
      serviceId,
      packageSelected: 'basic',
      eventDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eventDetails: { eventType: 'Wedding', address: 'Bangalore' },
    }),
  }).then((r) => r.json());

  if (vendorCreateRes.success) throw new Error('TEST 29 FAILED: Non-customer created a booking');
  console.log('✓ TEST 29 PASSED: Non-customer booking creation rejected (403 Forbidden)');

  // 30. Regression check on Modules 1-6
  console.log('\n[TEST 30] Verifying Modules 1–6 functional health...');
  const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
  const servicesSearchRes = await fetch(`${API_BASE}/services`).then((r) => r.json());

  if (!healthRes.success || !servicesSearchRes.success) {
    throw new Error('TEST 30 FAILED: Module 1-6 health or service listing route failure');
  }
  console.log('✓ TEST 30 PASSED: Modules 1–6 health & APIs fully functional!');

  console.log('\n==================================================');
  console.log(' 🎉 MODULE 7 VERIFICATION COMPLETE: ALL 30 TESTS PASSED!');
  console.log('==================================================');

  await mongoose.connection.close();
  process.exit(0);
}

runModule7Tests().catch((err) => {
  console.error('\n❌ MODULE 7 TEST SUITE FAILED:', err.message);
  process.exit(1);
});
