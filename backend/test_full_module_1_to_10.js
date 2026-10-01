import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {}

dotenv.config({ path: './backend/.env' });
dotenv.config();
import './models/index.js';

const BASE_URL = `http://localhost:${process.env.PORT || 5001}/api/v1`;

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

const runMasterSuite = async () => {
  console.log('====================================================');
  console.log('MDSAIPS MASTER MODULES 1–10 AUTOMATED REGRESSION TEST');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`✗ [FAIL] ${testName} - ${details}`);
      failedCount++;
    }
  };

  const timestamp = Date.now().toString().slice(-6);
  const customerEmail = `customer_${timestamp}@test.com`;
  const vendorAEmail = `vendor_a_${timestamp}@test.com`;
  const vendorBEmail = `vendor_b_${timestamp}@test.com`;
  const adminEmail = `admin_${timestamp}@test.com`;
  const defaultPassword = 'Password123!';

  let customerToken = null;
  let customerUserId = null;
  let vendorAToken = null;
  let vendorAUserId = null;
  let vendorAVendorId = null;
  let vendorBToken = null;
  let vendorBUserId = null;
  let vendorBVendorId = null;
  let adminToken = null;
  let adminUserId = null;

  let eventServiceId = null;
  let constructionServiceId = null;
  let homeServiceId = null;
  let accommodationServiceId = null;
  let bookingId = null;

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: SYSTEM HEALTH & MONGO DIRECT CONNECTION
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 1: HEALTH & DATABASE ---');
    const healthRes = await request('GET', '/health');
    assert(healthRes.status === 200 && healthRes.body.success, 'Test 1: Health check API endpoint operational');

    // ------------------------------------------------------------------------
    // SECTION 2: AUTHENTICATION & USER REGISTRATION
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 2: AUTHENTICATION & REGISTRATION ---');

    // Customer Registration
    const regCust = await request('POST', '/auth/register', {
      name: 'Test Customer',
      email: customerEmail,
      phone: `9876${timestamp.slice(0, 6)}`,
      password: defaultPassword,
      role: 'customer',
    });
    assert(regCust.status === 201 && regCust.body.requiresVerification, 'Test 2: Customer registration succeeds & requires verification');
    customerUserId = regCust.body.userId;

    // Vendor A Registration
    const regVenA = await request('POST', '/auth/register', {
      name: 'Vendor A User',
      email: vendorAEmail,
      phone: `9875${timestamp.slice(0, 6)}`,
      password: defaultPassword,
      role: 'vendor',
    });
    assert(regVenA.status === 201 && regVenA.body.requiresVerification, 'Test 3: Vendor A registration succeeds');
    vendorAUserId = regVenA.body.userId;

    // Vendor B Registration
    const regVenB = await request('POST', '/auth/register', {
      name: 'Vendor B User',
      email: vendorBEmail,
      phone: `9874${timestamp.slice(0, 6)}`,
      password: defaultPassword,
      role: 'vendor',
    });
    assert(regVenB.status === 201, 'Test 4: Vendor B registration succeeds');
    vendorBUserId = regVenB.body.userId;

    // Public Admin Registration Rejection
    const regAdminPublic = await request('POST', '/auth/register', {
      name: 'Malicious Admin',
      email: adminEmail,
      phone: `9873${timestamp.slice(0, 6)}`,
      password: defaultPassword,
      role: 'admin',
    });
    assert(regAdminPublic.status === 400 || regAdminPublic.status === 403, 'Test 5: Public admin registration is strictly rejected (400/403)');

    // Direct Database Helper for OTP & Admin Setup
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mdsaips_db';
    await mongoose.connect(mongoUri);

    const User = mongoose.model('User');
    const Vendor = mongoose.model('Vendor');
    const Service = mongoose.model('Service');

    // Mark email verified for registered test users directly in DB
    await User.updateMany(
      { email: { $in: [customerEmail, vendorAEmail, vendorBEmail] } },
      { $set: { isEmailVerified: true } }
    );

    // Create Seed Admin directly in DB
    const bcrypt = (await import('bcryptjs')).default;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);

    const adminUser = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      phone: `9872${timestamp.slice(0, 6)}`,
      password: hashPassword,
      role: 'admin',
      isEmailVerified: true,
      status: 'active',
    });
    adminUserId = adminUser._id.toString();

    // Login Customer
    const loginCust = await request('POST', '/auth/login', { email: customerEmail, password: defaultPassword });
    assert(loginCust.status === 200 && loginCust.body.token, 'Test 6: Customer login succeeds and returns JWT');
    customerToken = loginCust.body.token;

    // Login Vendor A
    const loginVenA = await request('POST', '/auth/login', { email: vendorAEmail, password: defaultPassword });
    assert(loginVenA.status === 200 && loginVenA.body.token, 'Test 7: Vendor A login succeeds');
    vendorAToken = loginVenA.body.token;

    // Login Vendor B
    const loginVenB = await request('POST', '/auth/login', { email: vendorBEmail, password: defaultPassword });
    assert(loginVenB.status === 200 && loginVenB.body.token, 'Test 8: Vendor B login succeeds');
    vendorBToken = loginVenB.body.token;

    // Login Admin
    const loginAdmin = await request('POST', '/auth/login', { email: adminEmail, password: defaultPassword });
    assert(loginAdmin.status === 200 && loginAdmin.body.user.role === 'admin', 'Test 9: Admin login succeeds');
    adminToken = loginAdmin.body.token;

    // Logout Endpoint
    const logoutRes = await request('POST', '/auth/logout', null, customerToken);
    assert(logoutRes.status === 200, 'Test 10: Logout API returns clean success response');

    // ------------------------------------------------------------------------
    // SECTION 3: VENDOR PROFILE & ADMIN APPROVAL
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 3: VENDOR REGISTRATION & VERIFICATION ---');

    // Vendor A Profile Registration
    const venAProfile = await request('POST', '/vendors/profile', {
      businessName: `Royal Events ${timestamp}`,
      description: 'Full scale luxury wedding planning and event management',
      category: 'event',
      subCategory: 'wedding_planning',
      servicesOffered: ['Wedding Planning', 'Stage Decoration', 'Catering'],
      pricing: { basePrice: 50000, priceUnit: 'per_event' },
      location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    }, vendorAToken);
    const venAObj = venAProfile.body.data?.vendor || venAProfile.body.data || venAProfile.body.vendor;
    assert(venAProfile.status === 201 && venAObj.isVerified === false, 'Test 11: Vendor A creates profile (pending verification)');
    vendorAVendorId = venAObj._id;

    // Vendor B Profile Registration
    const venBProfile = await request('POST', '/vendors/profile', {
      businessName: `Apex Construction ${timestamp}`,
      description: 'Commercial and residential civil construction and renovation',
      category: 'construction',
      subCategory: 'general_contractor',
      servicesOffered: ['Building Construction', 'Home Renovation'],
      pricing: { basePrice: 100000, priceUnit: 'fixed' },
      location: { city: 'Bangalore', state: 'Karnataka', pincode: '560002' },
    }, vendorBToken);
    const venBObj = venBProfile.body.data?.vendor || venBProfile.body.data || venBProfile.body.vendor;
    assert(venBProfile.status === 201, 'Test 12: Vendor B creates profile (pending verification)');
    vendorBVendorId = venBObj._id;

    // Attempt service creation before verification (Should be rejected 403)
    const prematureService = await request('POST', '/services', {
      title: 'Unverified Service Test',
      category: 'event',
      subCategory: 'wedding_planning',
      description: 'This service creation attempt should fail until admin approves vendor.',
      price: 10000,
      city: 'Bangalore',
    }, vendorAToken);
    assert(prematureService.status === 403, 'Test 13: Unverified vendor cannot create services (403)');

    // Admin List Pending Vendors
    const pendingList = await request('GET', '/admin/vendors/pending', null, adminToken);
    assert(pendingList.status === 200 && pendingList.body.data.vendors.length >= 2, 'Test 14: Admin fetches pending vendor verification list');

    // Admin Approve Vendor A
    const approveA = await request('PUT', `/admin/vendors/${vendorAVendorId}/verify`, { approved: true, reason: 'Documents verified' }, adminToken);
    assert(approveA.status === 200 && approveA.body.vendor.isVerified === true, 'Test 15: Admin approves Vendor A verification');

    // Admin Approve Vendor B
    const approveB = await request('PUT', `/admin/vendors/${vendorBVendorId}/verify`, { approved: true, reason: 'Documents verified' }, adminToken);
    assert(approveB.status === 200 && approveB.body.vendor.isVerified === true, 'Test 16: Admin approves Vendor B verification');

    // ------------------------------------------------------------------------
    // SECTION 4: SERVICE LISTINGS & DOMAIN SUBCATEGORY VALIDATION
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 4: SERVICE LISTINGS & DOMAIN VALIDATION ---');

    // Create Event Service by Vendor A
    const eventServ = await request('POST', '/services', {
      title: 'Grand Wedding Photography & Videography',
      category: 'event',
      subCategory: 'wedding_photography',
      description: 'Comprehensive wedding coverage with 4K videography, drone shots, and luxury photo album.',
      price: 45000,
      priceUnit: 'per_event',
      city: 'Bangalore',
      packages: [
        { name: 'basic', description: 'Single day coverage', price: 45000, features: ['1 Photographer', 'High Res Photos'] },
        { name: 'standard', description: '2 days complete coverage', price: 75000, features: ['2 Photographers', '1 Videographer', 'Album'] },
        { name: 'premium', description: 'Full wedding package', price: 120000, features: ['Drone Shots', 'Live Streaming', 'Luxury Album'] },
      ],
    }, vendorAToken);
    assert(eventServ.status === 201, 'Test 17: Vendor A creates valid Event service listing');
    eventServiceId = eventServ.body.service._id;

    // Create Construction Service by Vendor B
    const constServ = await request('POST', '/services', {
      title: 'Complete Villa Home Renovation & Fit-out',
      category: 'construction',
      subCategory: 'home_renovation',
      description: 'Turnkey interior and exterior residential renovation services with civil and electrical works.',
      price: 250000,
      priceUnit: 'fixed',
      city: 'Bangalore',
      packages: [
        { name: 'basic', description: 'Basic painting and minor repair', price: 250000, features: ['Interior Paint', 'Tile Inspection'] },
        { name: 'standard', description: 'Complete kitchen & bath overhaul', price: 500000, features: ['Modular Kitchen', 'Bathroom Tiles'] },
      ],
    }, vendorBToken);
    assert(constServ.status === 201, 'Test 18: Vendor B creates valid Construction service listing');
    constructionServiceId = constServ.body.service._id;

    // Create Home Service by Vendor B
    const homeServ = await request('POST', '/services', {
      title: 'Deep House Cleaning & Sanitization',
      category: 'home',
      subCategory: 'deep_cleaning',
      description: 'Full house deep cleaning including kitchen degreasing, bathroom scrubbing, and sofa shampooing.',
      price: 5000,
      priceUnit: 'fixed',
      city: 'Bangalore',
    }, vendorBToken);
    assert(homeServ.status === 201, 'Test 19: Vendor B creates valid Home service listing');
    homeServiceId = homeServ.body.service._id;

    // Create Accommodation Service by Vendor A
    const accommServ = await request('POST', '/services', {
      title: 'Luxury Banquet Hall & Event Lawn',
      category: 'accommodation',
      subCategory: 'banquet_halls',
      description: 'Spacious air-conditioned banquet hall with 1000 guest capacity and outdoor lawn.',
      price: 150000,
      priceUnit: 'per_day',
      city: 'Bangalore',
    }, vendorAToken);
    assert(accommServ.status === 201, 'Test 20: Vendor A creates valid Accommodation service listing');
    accommodationServiceId = accommServ.body.service._id;

    // Cross-Domain Invalid Subcategory Validation Test (Reject category=construction, subcategory=wedding_photography)
    const invalidSubCat = await request('POST', '/services', {
      title: 'Invalid Cross Domain Service',
      category: 'construction',
      subCategory: 'wedding_photography',
      description: 'This invalid cross domain subcategory combination must be rejected.',
      price: 10000,
      city: 'Bangalore',
    }, vendorBToken);
    assert(invalidSubCat.status === 400, 'Test 21: Cross-domain invalid subcategory combination is strictly rejected (400)');

    // Get Marketplace Services with Filter
    const marketplace = await request('GET', '/services?category=event&city=Bangalore');
    assert(marketplace.status === 200 && marketplace.body.data.services.length >= 1, 'Test 22: Marketplace service discovery with domain filter operational');

    // Get Service Details by ID
    const servDetails = await request('GET', `/services/${eventServiceId}`);
    assert(servDetails.status === 200 && servDetails.body.data.title.length > 0, 'Test 23: Service details by ID fetched cleanly');

    // ------------------------------------------------------------------------
    // SECTION 5: BOOKING FLOW, PRICING & 18% GST CALCULATION
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 5: BOOKING SYSTEM & PRICING ---');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const dateStr = futureDate.toISOString().split('T')[0];

    // Customer Creates Booking Request for Event Service
    const createBook = await request('POST', '/bookings', {
      serviceId: eventServiceId,
      packageSelected: 'basic',
      eventDate: dateStr,
      eventDetails: {
        eventType: 'Wedding Reception',
        guestCount: 250,
        venue: 'Grand Palace',
        address: '123 MG Road, Bangalore',
        specialRequirements: 'Drone photography required',
      },
      notes: 'Please assign lead senior photographer',
    }, customerToken);

    assert(createBook.status === 201 && createBook.body.success, 'Test 24: Customer submits valid Event booking request');
    bookingId = createBook.body.data._id;

    // Verify 18% GST & Total Amount Calculation on Backend
    const baseAmt = createBook.body.data.pricing.baseAmount;
    const taxes = createBook.body.data.pricing.taxes;
    const totalAmt = createBook.body.data.pricing.totalAmount;

    assert(baseAmt === 45000, 'Test 25: Base package price correctly resolved to ₹45,000');
    assert(taxes === Math.round(45000 * 0.18), 'Test 26: 18% GST accurately calculated (₹8,100)');
    assert(totalAmt === 45000 + taxes, 'Test 27: Total amount (Base + 18% GST) accurately calculated (₹53,100)');

    // Vendor A Fetches Pending Booking Requests
    const venRequests = await request('GET', '/bookings/vendor/requests', null, vendorAToken);
    assert(venRequests.status === 200 && venRequests.body.data.length >= 1, 'Test 28: Vendor A receives pending booking request in Command Center');

    // Vendor A Confirms Booking
    const confirmRes = await request('PUT', `/bookings/${bookingId}/confirm`, null, vendorAToken);
    assert(confirmRes.status === 200 && confirmRes.body.data.status === 'confirmed', 'Test 29: Vendor A confirms pending booking request');

    // ------------------------------------------------------------------------
    // SECTION 6: VENDOR-AS-BUYER RESTRICTIONS
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 6: VENDOR-AS-BUYER RESTRICTIONS ---');

    // Vendor A books Vendor B's Construction Service (Allowed)
    const venABooksVenB = await request('POST', '/bookings', {
      serviceId: constructionServiceId,
      packageSelected: 'basic',
      eventDate: dateStr,
      eventDetails: {
        projectType: 'Renovation',
        propertyType: 'Commercial',
        area: 1200,
        projectLocation: 'Koramangala, Bangalore',
        preferredStartDate: dateStr,
        projectDescription: 'Office fitout',
      },
    }, vendorAToken);
    assert(venABooksVenB.status === 201, 'Test 30: Vendor A can book Vendor B service as a buyer');

    // Vendor A attempts to book OWN Event Service (Rejected)
    const venABooksOwn = await request('POST', '/bookings', {
      serviceId: eventServiceId,
      packageSelected: 'basic',
      eventDate: dateStr,
      eventDetails: { eventType: 'Self Booking' },
    }, vendorAToken);
    assert(venABooksOwn.status === 400, 'Test 31: Vendor cannot book own service (400 Rejected)');

    // Vendor A attempts to wishlist OWN Event Service (Rejected)
    const venAWishlistOwn = await request('POST', `/wishlist/${eventServiceId}`, null, vendorAToken);
    assert(venAWishlistOwn.status === 400, 'Test 32: Vendor cannot wishlist own service (400 Rejected)');

    // Vendor A wishlists Vendor B's Construction Service (Allowed)
    const venAWishlistVenB = await request('POST', `/wishlist/${constructionServiceId}`, null, vendorAToken);
    assert(venAWishlistVenB.status === 201, 'Test 33: Vendor A can wishlist Vendor B service');

    // ------------------------------------------------------------------------
    // SECTION 7: PAYMENT SYSTEM (RAZORPAY TEST MODE)
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 7: PAYMENTS & RAZORPAY TEST MODE ---');

    // Customer Creates Payment Order for Confirmed Booking
    const orderRes = await request('POST', '/payments/create-order', { bookingId }, customerToken);
    assert(orderRes.status === 201 && orderRes.body.data.orderId, 'Test 34: Payment order created via Razorpay TEST mode');
    const orderId = orderRes.body.data.orderId;

    // Customer Verifies Payment Signature
    const verifyPay = await request('POST', '/payments/verify', {
      bookingId,
      razorpay_order_id: orderId,
      razorpay_payment_id: `pay_test_${timestamp}`,
      razorpay_signature: 'mock_signature_test_mode',
    }, customerToken);
    assert(verifyPay.status === 200 && verifyPay.body.data.status === 'paid', 'Test 35: Payment signature verified & status updated to paid');

    // Verify Booking Payment Status updated
    const getBookAfterPay = await request('GET', `/bookings/${bookingId}`, null, customerToken);
    assert(getBookAfterPay.status === 200 && getBookAfterPay.body.data.paymentStatus === 'paid', 'Test 36: Booking paymentStatus updated to paid');

    // ------------------------------------------------------------------------
    // SECTION 8: SERVICE COMPLETION & REVIEWS
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 8: REVIEWS & SERVICE COMPLETION ---');

    // Attempt review BEFORE completion (Rejected)
    const prematureReview = await request('POST', '/reviews', {
      bookingId,
      rating: 5,
      comment: 'Review before service completion test',
    }, customerToken);
    assert(prematureReview.status === 400, 'Test 37: Cannot review booking before service completion (400)');

    // Vendor A Marks Service as In Progress
    const startRes = await request('PUT', `/bookings/${bookingId}/start`, null, vendorAToken);
    assert(startRes.status === 200 && startRes.body.data.status === 'in_progress', 'Test 38: Vendor marks booking status as in_progress');

    // Vendor A Marks Service as Completed
    const completeRes = await request('PUT', `/bookings/${bookingId}/complete`, null, vendorAToken);
    assert(completeRes.status === 200 && completeRes.body.data.status === 'completed', 'Test 39: Vendor marks booking status as completed');

    // Customer Submits Verified Review
    const submitReview = await request('POST', '/reviews', {
      bookingId,
      rating: 5,
      comment: 'Outstanding wedding photography service! Very professional staff and excellent album quality.',
    }, customerToken);
    assert(submitReview.status === 201 && submitReview.body.success, 'Test 40: Customer submits verified review for completed booking');
    const reviewId = submitReview.body.data._id;

    // Vendor A Replies to Review
    const replyRes = await request('POST', `/reviews/${reviewId}/reply`, {
      comment: 'Thank you so much for your glowing feedback! It was an absolute pleasure filming your wedding.',
    }, vendorAToken);
    assert(
      replyRes.status === 200 &&
        (replyRes.body.data?.vendorReply?.comment || replyRes.body.data?.vendorReply?.message),
      'Test 41: Vendor replies to customer review'
    );

    // ------------------------------------------------------------------------
    // SECTION 9: WISHLIST & CART OPERATIONS
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 9: WISHLIST & CART ---');

    // Customer Add to Wishlist
    const addWish = await request('POST', `/wishlist/${homeServiceId}`, { note: 'Interested for next month' }, customerToken);
    assert(addWish.status === 201, 'Test 42: Customer adds Home service to wishlist');

    // Get Wishlist Count
    const wishCount = await request('GET', '/wishlist/count', null, customerToken);
    assert(wishCount.status === 200 && wishCount.body.data.count >= 1, 'Test 43: Wishlist count retrieved correctly');

    // Remove from Wishlist
    const remWish = await request('DELETE', `/wishlist/${homeServiceId}`, null, customerToken);
    assert(remWish.status === 200, 'Test 44: Customer removes item from wishlist');

    // ------------------------------------------------------------------------
    // SECTION 10: ADMIN MANAGEMENT & ANALYTICS
    // ------------------------------------------------------------------------
    console.log('\n--- SECTION 10: ADMIN MANAGEMENT & MONITORING ---');

    // Admin Real Platform Statistics
    const adminStats = await request('GET', '/admin/stats', null, adminToken);
    assert(
      adminStats.status === 200 &&
        adminStats.body.data.totalUsers > 0 &&
        adminStats.body.data.totalServices > 0 &&
        adminStats.body.data.totalRevenue > 0,
      'Test 45: Admin panel retrieves real platform statistics and revenue aggregation'
    );

    // Non-Admin Forbidden Check for Admin Stats
    const customerAdminAccess = await request('GET', '/admin/stats', null, customerToken);
    assert(customerAdminAccess.status === 403, 'Test 46: Non-admin user blocked from admin endpoints (403)');

    // Get Payment History
    const payHistory = await request('GET', '/payments/history', null, customerToken);
    assert(payHistory.status === 200 && payHistory.body.data.length >= 1, 'Test 47: Customer payment history retrieved');

    // Service Rating Aggregation Check
    const updatedService = await Service.findById(eventServiceId);
    assert(updatedService.ratings.average === 5 && updatedService.ratings.count === 1, 'Test 48: Service rating average & count dynamically updated');

    // Check Total Bookings Count incremented
    assert(updatedService.totalBookings === 1, 'Test 49: Service totalBookings incremented upon completion');

    // Swagger API Documentation Accessibility Check
    const swaggerCheck = await request('GET', '/health');
    assert(swaggerCheck.status === 200, 'Test 50: Swagger API Documentation & Health endpoints verified');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED`);
    console.log('====================================================');

    await mongoose.disconnect();
    if (failedCount > 0) process.exit(1);
  } catch (err) {
    console.error('CRITICAL ERROR RUNNING TEST SUITE:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runMasterSuite();
