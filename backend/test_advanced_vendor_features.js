import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {}

dotenv.config({ path: './backend/.env' });
dotenv.config();
import './models/index.js';

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
const JWT_SECRET = process.env.JWT_SECRET || 'mdsaips_super_secret_jwt_key_2026_secure';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runAdvancedVendorTestSuite = async () => {
  console.log('====================================================');
  console.log('MDSAIPS VENDOR ADVANCED FEATURES AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  const ts = Date.now().toString().slice(-6);
  const customerEmail = `cust_adv_${ts}@test.com`;
  const vendorEmail = `vend_adv_${ts}@test.com`;
  const vendorBEmail = `vend_b_adv_${ts}@test.com`;
  const adminEmail = `admin_adv_${ts}@test.com`;
  const defaultPassword = 'Password123!';

  let customerToken, customerId;
  let vendorToken, vendorUserId, vendorProfileId;
  let vendorBToken, vendorBUserId, vendorBProfileId;
  let adminToken;
  let serviceId, offerId, bookingId;

  try {
    // ----------------------------------------------------
    // SETUP: CONNECT DB & CREATE TEST USERS DIRECTLY
    // ----------------------------------------------------
    console.log('--- SETUP: CREATE VERIFIED TEST ACCOUNTS & TOKENS ---');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mdsaips_db';
    await mongoose.connect(mongoUri);

    const User = mongoose.model('User');
    const Vendor = mongoose.model('Vendor');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Customer
    const custUser = await User.create({
      name: 'Test Customer',
      email: customerEmail,
      phone: `9876${ts}`,
      password: hashedPassword,
      role: 'customer',
      isEmailVerified: true,
      status: 'active',
    });
    customerId = custUser._id.toString();
    customerToken = jwt.sign({ userId: customerId, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    // Vendor A User
    const vendUser = await User.create({
      name: 'Vendor A User',
      email: vendorEmail,
      phone: `9875${ts}`,
      password: hashedPassword,
      role: 'vendor',
      isEmailVerified: true,
      status: 'active',
    });
    vendorUserId = vendUser._id.toString();
    vendorToken = jwt.sign({ userId: vendorUserId, role: 'vendor' }, JWT_SECRET, { expiresIn: '1h' });

    // Vendor B User
    const vendBUser = await User.create({
      name: 'Vendor B User',
      email: vendorBEmail,
      phone: `9874${ts}`,
      password: hashedPassword,
      role: 'vendor',
      isEmailVerified: true,
      status: 'active',
    });
    vendorBUserId = vendBUser._id.toString();
    vendorBToken = jwt.sign({ userId: vendorBUserId, role: 'vendor' }, JWT_SECRET, { expiresIn: '1h' });

    // Admin User
    const adminUser = await User.create({
      name: 'Test Admin',
      email: adminEmail,
      phone: `9873${ts}`,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      status: 'active',
    });
    adminToken = jwt.sign({ userId: adminUser._id.toString(), role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    // Create Vendor Profile A
    const vendorA = await Vendor.create({
      userId: vendorUserId,
      user: vendorUserId,
      businessName: `Advanced Decorators ${ts}`,
      category: 'home',
      pricing: { basePrice: 5000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001', coordinates: { lat: 12.9716, lng: 77.5946 } },
      isVerified: true,
      isActive: true,
    });
    vendorProfileId = vendorA._id.toString();

    // Create Vendor Profile B
    const vendorB = await Vendor.create({
      userId: vendorBUserId,
      user: vendorBUserId,
      businessName: `Unrelated Vendor ${ts}`,
      category: 'event',
      pricing: { basePrice: 10000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      isVerified: true,
      isActive: true,
    });
    vendorBProfileId = vendorB._id.toString();

    assert(!!customerToken && !!vendorToken && !!adminToken, 'Direct JWT token generation successful');

    // Create Service for Vendor A
    const createServiceRes = await request('POST', '/services', {
      title: `Plumbing & Repair Service ${ts}`,
      description: 'Professional plumbing repair and installation services.',
      category: 'home',
      subCategory: 'plumbing',
      price: 2000,
      priceUnit: 'fixed',
      city: 'Bangalore',
      packages: [
        { name: 'basic', price: 1500, features: ['Inspection'] },
        { name: 'standard', price: 3000, features: ['Inspection', 'Minor Repairs'] },
      ],
    }, vendorToken);
    serviceId = createServiceRes.body.service?._id || createServiceRes.body.data?._id || createServiceRes.body._id;
    assert(!!serviceId, 'Service created successfully by verified vendor', `Service ID: ${serviceId}`);

    // ----------------------------------------------------
    // TEST A: HOLIDAY / VACATION MODE
    // ----------------------------------------------------
    console.log('\n--- TEST A: HOLIDAY / VACATION MODE ---');
    const vacOnRes = await request('PATCH', '/vendors/vacation-mode', { vacationMode: true }, vendorToken);
    if (vacOnRes.status !== 200) console.log('DEBUG vacOnRes:', vacOnRes.status, vacOnRes.body);
    assert(vacOnRes.status === 200 && vacOnRes.body.data?.vacationMode === true, 'Vacation mode turned ON');

    // Attempt booking while vendor is on vacation -> MUST BE BLOCKED (400)
    const blockBookingRes = await request('POST', '/bookings', {
      serviceId,
      packageSelected: 'basic',
      eventDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      eventDetails: { problemDescription: 'Leaking pipe', serviceAddress: 'Koramangala, Bangalore' },
    }, customerToken);
    if (blockBookingRes.status !== 400) console.log('DEBUG blockBookingRes:', blockBookingRes.status, blockBookingRes.body);
    assert(blockBookingRes.status === 400 && blockBookingRes.body.message.includes('vacation'), 'Backend blocks new booking during Vacation Mode');

    // Turn Vacation Mode OFF
    const vacOffRes = await request('PATCH', '/vendors/vacation-mode', { vacationMode: false }, vendorToken);
    assert(vacOffRes.status === 200 && vacOffRes.body.data?.vacationMode === false, 'Vacation mode turned OFF');

    // ----------------------------------------------------
    // TEST B: SERVICE AREA MAP & GEOGRAPHIC COVERAGE
    // ----------------------------------------------------
    console.log('\n--- TEST B: SERVICE AREA MAP & GEOGRAPHIC VALIDATION ---');
    // Set Radius Service Area (Bangalore center, 15km radius)
    const setAreaRes = await request('PUT', '/vendors/service-area', {
      serviceArea: {
        type: 'Radius',
        radiusZone: {
          center: { lat: 12.9716, lng: 77.5946 },
          radiusKm: 15,
        },
        cities: ['Bangalore'],
      },
    }, vendorToken);
    assert(setAreaRes.status === 200, 'Service area configured on vendor');

    // Coverage check inside radius (2km away)
    const checkInsideRes = await request('POST', `/services/${serviceId}/check-coverage`, {
      lat: 12.9800,
      lng: 77.6000,
      city: 'Bangalore',
    });
    assert(checkInsideRes.body.data?.isAvailable === true, 'Customer location inside radius returns Available ✓');

    // Coverage check outside radius (50km away)
    const checkOutsideRes = await request('POST', `/services/${serviceId}/check-coverage`, {
      lat: 13.5000,
      lng: 78.2000,
      city: 'Kolar',
    });
    assert(checkOutsideRes.body.data?.isAvailable === false, 'Customer location outside radius returns Not Available');

    // ----------------------------------------------------
    // TEST C: PROMOTIONAL OFFERS & DISCOUNTS
    // ----------------------------------------------------
    console.log('\n--- TEST C: PROMOTIONAL OFFERS & DISCOUNTS ---');
    const createOfferRes = await request('POST', '/offers', {
      title: '20% OFF SUMMER PROMO',
      description: 'Special 20% discount on all plumbing services',
      offerType: 'percentage',
      discountValue: 20,
      startDate: new Date(Date.now() - 3600000).toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      applicableServices: [serviceId],
      minBookingAmount: 1000,
      code: `SUMMER20_${ts}`,
    }, vendorToken);
    offerId = createOfferRes.body.data?.offer?._id;
    assert(!!offerId, 'Promotional offer created successfully');

    const fetchOffersRes = await request('GET', `/offers/service/${serviceId}`);
    assert(fetchOffersRes.body.data?.offers?.length > 0, 'Public service offers retrieved');

    // ----------------------------------------------------
    // TEST D: BOOKING CREATION WITH OFFER & 1-HOUR TIMER
    // ----------------------------------------------------
    console.log('\n--- TEST D: BOOKING CREATION & 1-HOUR RESPONSE TIMER ---');
    const createBookingRes = await request('POST', '/bookings', {
      serviceId,
      packageSelected: 'basic', // base price 1500
      offerId,
      eventDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      customerLat: 12.9716,
      customerLng: 77.5946,
      eventDetails: { problemDescription: 'Tap leak', serviceAddress: 'Indiranagar, Bangalore', lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
    }, customerToken);

    if (createBookingRes.status !== 201) console.log('DEBUG createBookingRes TEST D:', createBookingRes.status, createBookingRes.body);

    assert(createBookingRes.status === 201, 'Booking created with offer and service area check');
    bookingId = createBookingRes.body.data?._id;
    const booking = createBookingRes.body.data;

    // Verify 20% discount on 1500 = 300 discount. Base = 1500, Tax = 270, Total = 1470
    assert(booking?.pricing?.discount === 300, 'Authoritative 20% discount calculated on backend (300 INR)');
    assert(booking?.pricing?.totalAmount === 1470, 'Authoritative total calculated correctly (1500 - 300 + 270 = 1470)');

    // Verify 1-hour deadline
    const deadline = new Date(booking.responseDeadline);
    const created = new Date(booking.createdAt);
    const diffMins = Math.round((deadline - created) / 60000);
    assert(diffMins === 60, 'responseDeadline is set to exactly createdAt + 1 hour');

    // ----------------------------------------------------
    // TEST E: BOOKING-BASED CUSTOMER ↔ VENDOR CHAT SECURITY
    // ----------------------------------------------------
    console.log('\n--- TEST E: CHAT WITH CUSTOMER SECURITY ---');
    // Customer sends chat message
    const sendChatRes = await request('POST', `/chats/booking/${bookingId}/messages`, {
      message: 'Hello Vendor, can you bring extra tools?',
    }, customerToken);
    assert(sendChatRes.status === 201, 'Customer can send chat message to assigned vendor');

    // Vendor A reads chat
    const getChatVendRes = await request('GET', `/chats/booking/${bookingId}`, null, vendorToken);
    assert(getChatVendRes.body.data?.messages?.length > 0, 'Assigned vendor can view booking conversation');

    // Unrelated Vendor B attempts to read chat -> MUST BE FORBIDDEN (403)
    const blockChatVendBRes = await request('GET', `/chats/booking/${bookingId}`, null, vendorBToken);
    assert(blockChatVendBRes.status === 403, 'Unrelated Vendor B is forbidden from accessing private conversation');

    // ----------------------------------------------------
    // TEST F: SERVICE FAQS BUILDER & DISPLAY
    // ----------------------------------------------------
    console.log('\n--- TEST F: SERVICE FAQ BUILDER ---');
    const updateFaqRes = await request('PUT', `/services/${serviceId}/faqs`, {
      faqs: [
        { question: 'Do you provide spare parts?', answer: 'Yes, spare parts are charged separately at MRP.', displayOrder: 1 },
        { question: 'What is the response time?', answer: 'We arrive within 2 hours of confirmation.', displayOrder: 2 },
      ],
    }, vendorToken);
    assert(updateFaqRes.status === 200 && updateFaqRes.body.data?.faqs?.length === 2, 'Service FAQs created/updated successfully');

    // ----------------------------------------------------
    // TEST G: VENDOR TIER BADGE & ANALYTICS
    // ----------------------------------------------------
    console.log('\n--- TEST G: VENDOR TIER & ANALYTICS ---');
    // Track profile view
    await request('POST', '/analytics/track', { vendorId: vendorProfileId, eventType: 'profile_view' });
    await request('POST', '/analytics/track', { vendorId: vendorProfileId, serviceId, eventType: 'service_view' });

    const getAnalyticsRes = await request('GET', '/analytics/my-analytics?timeframe=30days', null, vendorToken);
    assert(getAnalyticsRes.status === 200, 'Vendor analytics fetched successfully');
    assert(getAnalyticsRes.body.data?.metrics?.currentTier?.label !== undefined, 'Dynamic Vendor Tier badge calculated');

    // ----------------------------------------------------
    // TEST H: VENDOR ACCEPTS BOOKING BEFORE DEADLINE
    // ----------------------------------------------------
    console.log('\n--- TEST H: VENDOR ACCEPTS BOOKING ---');
    const acceptRes = await request('PUT', `/bookings/${bookingId}/confirm`, {}, vendorToken);
    assert(acceptRes.status === 200 && acceptRes.body.data?.status === 'confirmed', 'Vendor confirms booking request within 1 hour');

  } catch (error) {
    console.error('CRITICAL UNHANDLED ERROR IN TEST SUITE:', error);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`ADVANCED VENDOR FEATURES TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed === 0 ? 0 : 1);
  }
};

runAdvancedVendorTestSuite();
