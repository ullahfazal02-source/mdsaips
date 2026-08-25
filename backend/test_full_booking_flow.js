import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import app from './app.js';
import connectDB from './config/db.js';
import { User, Vendor, Service, Booking, Review, Wishlist } from './models/index.js';
import { checkAndExpireBookings } from './jobs/bookingExpiryCron.js';

const PORT = process.env.TEST_PORT || 5002;
const API_BASE = `http://localhost:${PORT}/api/v1`;

async function runMasterRegressionTest() {
  console.log('====================================================================');
  console.log('--- STARTING MASTER END-TO-END BOOKING & REGRESSION AUDIT TEST ---');
  console.log('====================================================================');

  await connectDB();
  const server = app.listen(PORT);

  const ts = Date.now();
  const password = 'Password@123';

  const customerEmail = `master_cust_${ts}@example.com`;
  const customerPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const vendorAEmail = `master_vA_${ts}@example.com`;
  const vendorAPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const vendorBEmail = `master_vB_${ts}@example.com`;
  const vendorBPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const adminEmail = `master_admin_${ts}@example.com`;
  const adminPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  async function createVerifiedUser(name, email, phone, role) {
    const publicRole = role === 'admin' ? 'customer' : role;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role: publicRole }),
    }).then((r) => r.json());

    if (!regRes.success) throw new Error(`User registration failed for ${email}: ${JSON.stringify(regRes)}`);

    await User.findByIdAndUpdate(regRes.userId || regRes.data?.user?._id, {
      role,
      isEmailVerified: true,
      isPhoneVerified: true,
      status: 'active',
    });

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());

    if (!loginRes.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(loginRes)}`);

    return { userId: regRes.userId, token: loginRes.token, user: loginRes.user };
  }

  // 1. Create Users
  console.log('\n[STEP 1] Creating Test Users (Customer, Vendor A, Vendor B, Admin)...');
  const customer = await createVerifiedUser('Master Customer', customerEmail, customerPhone, 'customer');
  const vendorA = await createVerifiedUser('Master Vendor A', vendorAEmail, vendorAPhone, 'vendor');
  const vendorB = await createVerifiedUser('Master Vendor B', vendorBEmail, vendorBPhone, 'vendor');
  const admin = await createVerifiedUser('Master Admin', adminEmail, adminPhone, 'admin');
  console.log('✓ STEP 1 PASSED: All 4 test users registered and authenticated with JWT tokens.');

  // 2. Vendor Profiles & Admin Approval
  console.log('\n[STEP 2] Creating Vendor Profiles & Admin Verification...');
  const regVendorA = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      businessName: 'Apex Grand Events & Constructions',
      category: 'event',
      pricing: { basePrice: 50000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  }).then((r) => r.json());

  const regVendorB = await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorB.token}` },
    body: JSON.stringify({
      businessName: 'Precision Home & Accommodation Solutions',
      category: 'home',
      pricing: { basePrice: 15000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Delhi' },
    }),
  }).then((r) => r.json());

  const vendorAObj = await Vendor.findOne({ userId: vendorA.userId });
  const vendorBObj = await Vendor.findOne({ userId: vendorB.userId });

  // Admin approves both vendors
  const verifyResA = await fetch(`${API_BASE}/admin/vendors/${vendorAObj._id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.token}` },
    body: JSON.stringify({ approved: true }),
  }).then((r) => r.json());

  const verifyResB = await fetch(`${API_BASE}/admin/vendors/${vendorBObj._id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.token}` },
    body: JSON.stringify({ approved: true }),
  }).then((r) => r.json());

  if (!verifyResA.success || !verifyResB.success) {
    throw new Error('Admin vendor approval failed');
  }
  console.log('✓ STEP 2 PASSED: Vendor profiles created and verified by Admin.');

  // 3. Create Services for all 4 Domains
  console.log('\n[STEP 3] Vendor A Creating Services for 4 Service Domains...');
  
  // Event Service
  const eventServiceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      title: 'Royal Wedding Photography & Staging',
      description: 'Complete luxury wedding photography and floral stage decoration packages.',
      category: 'event',
      subCategory: 'photography',
      price: 25000,
      priceUnit: 'per_event',
      city: 'Mumbai',
      packages: [
        { name: 'basic', price: 25000, description: 'Basic Coverage', features: ['4 Hours', '100 Photos'] },
        { name: 'premium', price: 50000, description: 'Full Coverage', features: ['Full Day', '300 Photos'] },
      ],
    }),
  }).then((r) => r.json());

  // Construction Service
  const constrServiceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      title: 'Luxury Villa Construction & Interior Renovation',
      description: 'End-to-end residential building construction and custom architectural design.',
      category: 'construction',
      subCategory: 'general_contractor',
      price: 500000,
      priceUnit: 'fixed',
      city: 'Mumbai',
    }),
  }).then((r) => r.json());

  // Home Service
  const homeServiceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorB.token}` },
    body: JSON.stringify({
      title: 'Deep House Cleaning & Sanitization Service',
      description: 'Professional deep house cleaning, pest control, and AC maintenance service.',
      category: 'home',
      subCategory: 'deep_cleaning',
      price: 4999,
      priceUnit: 'fixed',
      city: 'Delhi',
    }),
  }).then((r) => r.json());

  // Accommodation Service
  const accommServiceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorB.token}` },
    body: JSON.stringify({
      title: 'Lakeside Luxury Boutique Resort Suite',
      description: 'Private luxury suite stay with breakfast included and scenic view.',
      category: 'accommodation',
      subCategory: 'resorts',
      price: 8999,
      priceUnit: 'per_day',
      city: 'Delhi',
    }),
  }).then((r) => r.json());

  if (!eventServiceRes.success || !constrServiceRes.success || !homeServiceRes.success || !accommServiceRes.success) {
    throw new Error(`Service creation failed: ${JSON.stringify({ eventServiceRes, constrServiceRes, homeServiceRes, accommServiceRes })}`);
  }

  const eventService = eventServiceRes.data?.service || eventServiceRes.data || eventServiceRes.service;
  const constrService = constrServiceRes.data?.service || constrServiceRes.data || constrServiceRes.service;
  const homeService = homeServiceRes.data?.service || homeServiceRes.data || homeServiceRes.service;
  const accommService = accommServiceRes.data?.service || accommServiceRes.data || accommServiceRes.service;

  console.log('✓ STEP 3 PASSED: Services created for Event, Construction, Home, and Accommodation domains.');

  // 4. Customer Creates Bookings for All 4 Domains
  console.log('\n[STEP 4] Customer Submitting Bookings for All 4 Domains...');

  // Event Booking
  const eventBookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({
      serviceId: eventService._id,
      packageSelected: 'basic',
      eventDate: '2026-09-15',
      eventDetails: {
        eventType: 'Wedding Reception',
        guestCount: 250,
        venue: 'Grand Taj Ballroom',
        address: 'Colaba, Mumbai',
        specialRequirements: 'Drone footage required',
      },
      notes: 'Please arrive 1 hour before scheduled time.',
    }),
  }).then((r) => r.json());

  if (!eventBookingRes.success) {
    throw new Error(`Event Booking failed: ${JSON.stringify(eventBookingRes)}`);
  }
  const eventBooking = eventBookingRes.data?.booking || eventBookingRes.data || eventBookingRes.booking;

  // Verify Event Price Breakdown (25,000 + 18% GST = 29,500)
  if (eventBooking.pricing.baseAmount !== 25000 || eventBooking.pricing.totalAmount !== 29500) {
    throw new Error(`Price calculation mismatch: Expected base 25000, total 29500, got ${JSON.stringify(eventBooking.pricing)}`);
  }

  // Construction Booking
  const constrBookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({
      serviceId: constrService._id,
      eventDate: '2026-10-01',
      eventDetails: {
        projectType: 'Villa Renovation',
        propertyType: 'Residential',
        area: 2500,
        unit: 'sqft',
        projectLocation: 'Bandra West, Mumbai',
        estimatedBudget: 600000,
        preferredStartDate: '2026-10-01',
        projectDescription: 'Full renovation of 3 BHK apartment.',
      },
    }),
  }).then((r) => r.json());

  if (!constrBookingRes.success) throw new Error(`Construction Booking failed: ${JSON.stringify(constrBookingRes)}`);

  // Home Booking
  const homeBookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({
      serviceId: homeService._id,
      eventDate: '2026-09-01',
      eventDetails: {
        serviceType: 'Deep House Cleaning',
        problemDescription: 'Full deep clean before festival.',
        preferredDate: '2026-09-01',
        preferredTime: 'Morning',
        serviceAddress: 'Connaught Place, Delhi',
        urgency: 'Normal',
      },
    }),
  }).then((r) => r.json());

  if (!homeBookingRes.success) throw new Error(`Home Booking failed: ${JSON.stringify(homeBookingRes)}`);

  // Accommodation Booking
  const accommBookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({
      serviceId: accommService._id,
      eventDate: '2026-09-20',
      eventDetails: {
        checkInDate: '2026-09-20',
        checkOutDate: '2026-09-22',
        guests: 2,
        rooms: 1,
        guestDetails: 'John Doe, 9876543210',
        specialRequests: 'High floor with lake view.',
      },
    }),
  }).then((r) => r.json());

  if (!accommBookingRes.success) throw new Error(`Accommodation Booking failed: ${JSON.stringify(accommBookingRes)}`);

  console.log('✓ STEP 4 PASSED: Booking requests created for all 4 domains without validation error.');

  // 5. Vendor Booking Request Reception & Acceptance Flow
  console.log('\n[STEP 5] Vendor A Receiving & Accepting Booking Request...');
  const vendorRequestsRes = await fetch(`${API_BASE}/bookings/vendor/requests`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${vendorA.token}` },
  }).then((r) => r.json());

  if (!vendorRequestsRes.success || vendorRequestsRes.data.length === 0) {
    throw new Error('Vendor requests queue empty');
  }

  const confirmRes = await fetch(`${API_BASE}/bookings/${eventBooking._id}/confirm`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorA.token}` },
  }).then((r) => r.json());

  if (!confirmRes.success || confirmRes.data.status !== 'confirmed') {
    throw new Error(`Vendor confirm booking failed: ${JSON.stringify(confirmRes)}`);
  }
  console.log('✓ STEP 5 PASSED: Vendor received request and confirmed booking (Status -> confirmed).');

  // 6. Payment Flow (Razorpay Test Mode Order & Verification)
  console.log('\n[STEP 6] Customer Initiating & Verifying Payment via Razorpay TEST Mode...');
  const createOrderRes = await fetch(`${API_BASE}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({ bookingId: eventBooking._id }),
  }).then((r) => r.json());

  if (!createOrderRes.success || !createOrderRes.data?.orderId) {
    throw new Error(`Create payment order failed: ${JSON.stringify(createOrderRes)}`);
  }

  const verifyPayRes = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({
      bookingId: eventBooking._id,
      razorpay_order_id: createOrderRes.data.orderId,
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_signature: 'mock_signature_test_mode',
    }),
  }).then((r) => r.json());

  if (!verifyPayRes.success || (verifyPayRes.data?.status !== 'paid' && verifyPayRes.data?.paymentStatus !== 'paid')) {
    throw new Error(`Payment signature verification failed: ${JSON.stringify(verifyPayRes)}`);
  }
  console.log('✓ STEP 6 PASSED: Razorpay order created and payment verified (paymentStatus -> paid).');

  // 7. Booking Completion & Review Flow
  console.log('\n[STEP 7] Vendor Completes Booking & Customer Leaves Review...');
  const startRes = await fetch(`${API_BASE}/bookings/${eventBooking._id}/start`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorA.token}` },
  }).then((r) => r.json());

  const completeRes = await fetch(`${API_BASE}/bookings/${eventBooking._id}/complete`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorA.token}` },
  }).then((r) => r.json());

  if (!completeRes.success || completeRes.data.status !== 'completed') {
    throw new Error(`Complete booking failed: ${JSON.stringify(completeRes)}`);
  }

  const reviewRes = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
    body: JSON.stringify({
      bookingId: eventBooking._id,
      serviceId: eventService._id,
      rating: 5,
      comment: 'Exceptional wedding photography service! Highly recommended.',
    }),
  }).then((r) => r.json());

  if (!reviewRes.success) throw new Error(`Submit review failed: ${JSON.stringify(reviewRes)}`);

  console.log('✓ STEP 7 PASSED: Booking completed and verified customer review published.');

  // 8. Security Guard: Vendor Own-Service Booking Restriction
  console.log('\n[STEP 8] Testing Vendor Own-Service Booking Prohibition...');
  const ownBookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      serviceId: eventService._id,
      eventDate: '2026-09-25',
      eventDetails: { eventType: 'Self Booking Test' },
    }),
  }).then((r) => r.json());

  if (ownBookingRes.success) {
    throw new Error('SECURITY VIOLATION: Vendor was allowed to book their own service!');
  }
  console.log(`✓ STEP 8 PASSED: Vendor own-service booking blocked as expected: "${ownBookingRes.message}"`);

  // 9. Vendor-as-Buyer Capabilities (Vendor A books Vendor B's service)
  console.log('\n[STEP 9] Testing Vendor-as-Buyer Capabilities (Vendor A books Vendor B)...');
  const vendorAsBuyerRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      serviceId: homeService._id,
      eventDate: '2026-09-10',
      eventDetails: {
        serviceType: 'Office Deep Cleaning',
        serviceAddress: 'Vendor A Office, Mumbai',
      },
    }),
  }).then((r) => r.json());

  if (!vendorAsBuyerRes.success) {
    throw new Error(`Vendor-as-buyer booking failed: ${JSON.stringify(vendorAsBuyerRes)}`);
  }
  console.log('✓ STEP 9 PASSED: Vendor A successfully created a booking request for Vendor B\'s service.');

  // 10. 1-Hour Response Expiry Test
  console.log('\n[STEP 10] Testing 1-Hour Response Expiry Engine...');
  const expiredTestBooking = await Booking.create({
    bookingNumber: `BK-TEST-EXP-${Date.now().toString(36).toUpperCase()}`,
    customerId: customer.userId,
    vendorId: vendorBObj._id,
    serviceId: homeService._id,
    eventDate: new Date(Date.now() + 86400000),
    eventDetails: { serviceType: 'Expiry Test' },
    pricing: { baseAmount: 4999, taxes: 900, discount: 0, totalAmount: 5899 },
    status: 'pending',
    responseDeadline: new Date(Date.now() - 5 * 60 * 1000), // Passed 5 mins ago
    paymentStatus: 'unpaid',
    timeline: [{ status: 'pending', message: 'Test pending booking', timestamp: new Date() }],
  });

  await checkAndExpireBookings();

  const refreshedExpiredBooking = await Booking.findById(expiredTestBooking._id);
  if (refreshedExpiredBooking.status !== 'expired') {
    throw new Error(`1-hour response expiry failed: Expected status expired, got ${refreshedExpiredBooking.status}`);
  }
  console.log('✓ STEP 10 PASSED: Overdue pending booking auto-expired successfully.');

  console.log('\n====================================================================');
  console.log('--- MASTER END-TO-END REGRESSION AUDIT PASSED 100% SUCCESSFULLY ---');
  console.log('====================================================================');
  if (server) server.close();
  process.exit(0);
}

runMasterRegressionTest().catch((err) => {
  console.error('\n❌ MASTER REGRESSION TEST FAILED:', err);
  process.exit(1);
});
