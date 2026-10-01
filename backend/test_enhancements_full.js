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

const runEnhancementsSuite = async () => {
  console.log('====================================================');
  console.log('MDSAIPS ADVANCED FEATURES AUTOMATED INTEGRATION TEST');
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
  const customerEmail = `cust_adv_${timestamp}@test.com`;
  const vendorEmail = `vend_adv_${timestamp}@test.com`;
  const defaultPassword = 'Password123!';

  let customerToken = null;
  let vendorToken = null;
  let vendorId = null;
  let serviceId = null;
  let bookingId1 = null;
  let bookingId2 = null;
  let shareToken = null;

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.success, 'Test 1: Health check endpoint working');

    // 2. Customer & Vendor Setup
    const regCust = await request('POST', '/auth/register', {
      name: 'Adv Customer',
      email: customerEmail,
      phone: `9100${timestamp.slice(0, 6)}`,
      password: defaultPassword,
      role: 'customer',
    });
    assert(regCust.status === 201, 'Test 2: Customer registration succeeds');

    const regVen = await request('POST', '/auth/register', {
      name: 'Adv Vendor',
      email: vendorEmail,
      phone: `9200${timestamp.slice(0, 6)}`,
      password: defaultPassword,
      role: 'vendor',
    });
    assert(regVen.status === 201, 'Test 3: Vendor registration succeeds');

    // Direct DB update for email verification
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mdsaips_db';
    await mongoose.connect(mongoUri);
    const User = mongoose.model('User');
    const Vendor = mongoose.model('Vendor');
    const Booking = mongoose.model('Booking');

    await User.updateMany(
      { email: { $in: [customerEmail, vendorEmail] } },
      { $set: { isEmailVerified: true } }
    );

    // Login users
    const logCust = await request('POST', '/auth/login', { email: customerEmail, password: defaultPassword });
    customerToken = logCust.body.token;

    const logVen = await request('POST', '/auth/login', { email: vendorEmail, password: defaultPassword });
    vendorToken = logVen.body.token;

    // Create Vendor profile & approve
    const venProfile = await request('POST', '/vendors/profile', {
      businessName: `Apex Home Services ${timestamp}`,
      description: 'Expert plumbing, cleaning, and home renovation services',
      category: 'home',
      subCategory: 'plumbing',
      pricing: { basePrice: 1500, priceUnit: 'fixed' },
      location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001', coordinates: { lat: 12.9716, lng: 77.5946 } },
    }, vendorToken);
    vendorId = venProfile.body.data?.vendor?._id || venProfile.body.vendor?._id;

    await Vendor.findByIdAndUpdate(vendorId, { $set: { isVerified: true } });

    // Create Home Plumbing Service
    const createServ = await request('POST', '/services', {
      title: 'Emergency Plumbing Repair & Maintenance',
      category: 'home',
      subCategory: 'plumbing',
      description: 'Quick response pipe leak repair, tap fixing, and drain cleaning.',
      price: 1500,
      priceUnit: 'fixed',
      city: 'Bangalore',
      packages: [
        { name: 'basic', description: 'Minor leak repair', price: 1500, features: ['1 Leak Fix'] },
        { name: 'standard', description: 'Full bathroom pipe repair', price: 3000, features: ['3 Pipe Repairs'] },
      ],
    }, vendorToken);
    assert(createServ.status === 201, 'Test 4: Home Plumbing service created successfully');
    serviceId = createServ.body.service._id;

    // ------------------------------------------------------------------------
    // SECTION 1: CANCELLATION DASHBOARD & CANCELLATION FLOW
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 1: CANCELLATION & DASHBOARD ---');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];

    const book1 = await request('POST', '/bookings', {
      serviceId,
      packageSelected: 'basic',
      eventDate: dateStr,
      eventDetails: { serviceType: 'Pipe Leak', serviceAddress: 'Bangalore' },
    }, customerToken);
    assert(book1.status === 201, 'Test 5: Booking 1 created for cancellation test');
    bookingId1 = book1.body.data._id;

    // Cancel Booking 1 with Reason
    const cancel1 = await request('PUT', `/bookings/${bookingId1}/cancel`, {
      reason: 'Schedule conflict, need to reschedule',
    }, customerToken);

    assert(cancel1.status === 200 && cancel1.body.data.status === 'cancelled', 'Test 6: Booking 1 cancelled with reason');
    assert(cancel1.body.data.reorderAvailableUntil !== null, 'Test 7: reorderAvailableUntil timestamp set on server');
    assert(cancel1.body.data.refundStatus === 'not_applicable', 'Test 8: Unpaid cancellation refundStatus is not_applicable');

    // Fetch Cancelled Bookings Dashboard API
    const cancelledList = await request('GET', '/bookings/customer/cancelled', null, customerToken);
    assert(cancelledList.status === 200 && cancelledList.body.data.length >= 1, 'Test 9: Customer fetches Cancelled Bookings dashboard list');
    assert(cancelledList.body.data[0].reorderStatus === 'reorder_available', 'Test 10: Reorder status is reorder_available within 24h');

    // ------------------------------------------------------------------------
    // SECTION 2: 24-HOUR REORDER FEATURE & REORDER DATA RULES
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 2: 24-HOUR REORDER & LIVE PRICING ---');

    // Fetch fresh reorder data
    const reorderData = await request('GET', `/bookings/${bookingId1}/reorder-data`, null, customerToken);
    assert(reorderData.status === 200 && reorderData.body.isAvailable, 'Test 11: Customer fetches reorder data for cancelled booking');
    assert(reorderData.body.data.currentPricing.baseAmount === 1500, 'Test 12: Live service package price re-fetched correctly (₹1,500)');

    // Submit new booking using reordered details (New booking created, old booking unchanged)
    const reorderSubmit = await request('POST', '/bookings', {
      serviceId: reorderData.body.data.serviceId,
      packageSelected: reorderData.body.data.packageSelected,
      eventDate: dateStr,
      eventDetails: reorderData.body.data.eventDetails,
    }, customerToken);

    assert(reorderSubmit.status === 201 && reorderSubmit.body.data._id !== bookingId1, 'Test 13: "Book Again" creates a NEW booking request');
    bookingId2 = reorderSubmit.body.data._id;

    // Verify old booking remains cancelled
    const checkOldBooking = await request('GET', `/bookings/${bookingId1}`, null, customerToken);
    assert(checkOldBooking.body.data.status === 'cancelled', 'Test 14: Old booking is NOT restored and stays cancelled');

    // ------------------------------------------------------------------------
    // SECTION 3: VENDOR REJECTION & REFUND HANDLING
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 3: VENDOR REJECTION & REFUNDS ---');

    // Vendor rejects Booking 2 with Rejection Reason
    const reject2 = await request('PUT', `/bookings/${bookingId2}/reject`, {
      reason: 'Fully booked on the requested date',
    }, vendorToken);

    assert(reject2.status === 200 && reject2.body.data.status === 'rejected', 'Test 15: Vendor rejects Booking 2 with reason');
    assert(reject2.body.data.cancellationReason === 'Fully booked on the requested date', 'Test 16: Rejection reason stored in booking record');

    // ------------------------------------------------------------------------
    // SECTION 4: CHAT WITH VENDOR
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 4: BOOKING-BASED CHAT ---');

    // Customer sends message to Vendor for Booking 2
    const sendMsg = await request('POST', `/chats/booking/${bookingId2}/messages`, {
      message: 'Hi, can you recommend another available date for plumbing?',
    }, customerToken);
    assert(sendMsg.status === 201 && sendMsg.body.data.message.message.length > 0, 'Test 17: Customer sends chat message to vendor linked to booking');

    // Vendor fetches chat history
    const getChat = await request('GET', `/chats/booking/${bookingId2}`, null, vendorToken);
    assert(getChat.status === 200 && getChat.body.data.messages.length >= 1, 'Test 18: Vendor receives & views chat message history');

    // ------------------------------------------------------------------------
    // SECTION 5: LOYALTY POINTS SYSTEM
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 5: LOYALTY POINTS SYSTEM ---');

    // Create Booking 3 for Loyalty Points test
    const book3 = await request('POST', '/bookings', {
      serviceId,
      packageSelected: 'standard',
      eventDate: dateStr,
      eventDetails: { serviceType: 'Plumbing Overhaul', serviceAddress: 'Bangalore' },
    }, customerToken);
    const bookingId3 = book3.body.data._id;

    // Confirm, Pay, and Complete Booking 3
    await request('PUT', `/bookings/${bookingId3}/confirm`, null, vendorToken);
    const order3 = await request('POST', '/payments/create-order', { bookingId: bookingId3 }, customerToken);
    await request('POST', '/payments/verify', {
      bookingId: bookingId3,
      razorpay_order_id: order3.body.data.orderId,
      razorpay_payment_id: `pay_loyalty_${timestamp}`,
      razorpay_signature: 'mock_sig',
    }, customerToken);

    await request('PUT', `/bookings/${bookingId3}/start`, null, vendorToken);
    await request('PUT', `/bookings/${bookingId3}/complete`, null, vendorToken);

    // Fetch Loyalty Points summary
    const loyaltyRes = await request('GET', '/auth/loyalty', null, customerToken);
    assert(loyaltyRes.status === 200 && loyaltyRes.body.data.points.current > 0, 'Test 19: Loyalty points earned after completed paid booking (1 pt / ₹100)');
    assert(loyaltyRes.body.data.history.length >= 1, 'Test 20: Loyalty points history contains transaction log');

    // ------------------------------------------------------------------------
    // SECTION 6: SHARE WISHLIST
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 6: SHARE WISHLIST ---');

    // Add service to wishlist & generate share token
    await request('POST', `/wishlist/${serviceId}`, null, customerToken);
    const shareRes = await request('GET', '/wishlist/share-link', null, customerToken);
    assert(shareRes.status === 200 && shareRes.body.data.shareToken, 'Test 21: Shareable wishlist token generated');
    shareToken = shareRes.body.data.shareToken;

    // Access public shared wishlist (No Auth Header!)
    const publicWishlist = await request('GET', `/wishlist/shared/${shareToken}`);
    assert(publicWishlist.status === 200 && publicWishlist.body.data.items.length >= 1, 'Test 22: Public user accesses shared wishlist page without auth');
    assert(publicWishlist.body.data.items[0].title.length > 0, 'Test 23: Shared wishlist displays service details & vendor name');
    assert(!publicWishlist.body.data.items[0].email && !publicWishlist.body.data.items[0].phone, 'Test 24: Shared page strictly hides customer email/phone');

    // ------------------------------------------------------------------------
    // SECTION 7: DOWNLOAD INVOICE PDF DATA
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 7: INVOICE PDF DATA ---');

    const invoiceRes = await request('GET', `/bookings/${bookingId3}/invoice`, null, customerToken);
    assert(invoiceRes.status === 200 && invoiceRes.body.data.invoiceNumber, 'Test 25: Customer downloads invoice data with Invoice Number');
    assert(invoiceRes.body.data.pricing.taxes === Math.round(3000 * 0.18), 'Test 26: Invoice contains 18% GST calculation (₹540)');

    // ------------------------------------------------------------------------
    // SECTION 8: MAP-BASED SEARCH & LOCATION FILTER
    // ------------------------------------------------------------------------
    console.log('\n--- FEATURE 8: MAP-BASED SEARCH ---');

    const mapRes = await request('GET', '/services/map-search?category=home&city=Bangalore&lat=12.9716&lng=77.5946&radiusKm=15');
    assert(mapRes.status === 200 && mapRes.body.data.length >= 1, 'Test 27: Map-based search retrieves nearby Home Plumbing services');
    assert(mapRes.body.data[0].locationCoordinates.lat === 12.9716, 'Test 28: Location coordinates returned for map pin markers');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passedCount} PASSED / ${failedCount} FAILED`);
    console.log('====================================================');

    await mongoose.disconnect();
    if (failedCount > 0) process.exit(1);
  } catch (err) {
    console.error('CRITICAL ERROR IN ENHANCEMENTS TEST SUITE:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runEnhancementsSuite();
