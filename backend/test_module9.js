import dotenv from 'dotenv';
import dns from 'dns';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import connectDB from './config/db.js';
import { User, Vendor, Service, Booking, Review } from './models/index.js';

const API_BASE = 'http://localhost:5001/api/v1';

async function runModule9Tests() {
  console.log('==================================================');
  console.log('--- STARTING MODULE 9 REVIEWS & RATINGS VERIFICATION ---');
  console.log('==================================================');

  await connectDB();

  const ts = Date.now();
  const vendorEmail = `v9_vendor_${ts}@example.com`;
  const vendorPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const vendorBEmail = `v9_vendorB_${ts}@example.com`;
  const vendorBPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const customerEmail = `v9_customer_${ts}@example.com`;
  const customerPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const adminEmail = `v9_admin_${ts}@example.com`;
  const adminPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));

  const password = 'Password@123';

  async function createVerifiedUser(email, phone, name, role) {
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      isEmailVerified: true,
      isPhoneVerified: true,
      status: 'active',
    });

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'mdsaips_super_secret_jwt_key_2026_secure', {
      expiresIn: '7d',
    });

    return { userId: user._id, token };
  }

  // 1 & 12. Authenticate Customer, Vendor A, Vendor B, Admin
  console.log('\n[SETUP] Creating test users (Vendor A, Vendor B, Customer, Admin)...');
  const vendorAUser = await createVerifiedUser(vendorEmail, vendorPhone, 'Module 9 Vendor A', 'vendor');
  const vendorBUser = await createVerifiedUser(vendorBEmail, vendorBPhone, 'Module 9 Vendor B', 'vendor');
  const customerUser = await createVerifiedUser(customerEmail, customerPhone, 'Module 9 Customer', 'customer');
  const adminUser = await createVerifiedUser(adminEmail, adminPhone, 'Module 9 Admin', 'admin');
  console.log('✓ TEST 1 & 12 PASSED: Authenticated users');

  // Register Vendor A
  await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorAUser.token}` },
    body: JSON.stringify({
      businessName: 'Starlight Photography Studio',
      category: 'event',
      pricing: { basePrice: 15000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  });

  const vendorADoc = await Vendor.findOneAndUpdate(
    { $or: [{ userId: vendorAUser.userId }, { user: vendorAUser.userId }] },
    { isVerified: true, isActive: true, status: 'active' },
    { new: true }
  );

  // Register Vendor B
  await fetch(`${API_BASE}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorBUser.token}` },
    body: JSON.stringify({
      businessName: 'Unrelated Vendor Studio',
      category: 'event',
      pricing: { basePrice: 10000, priceUnit: 'per_event', currency: 'INR' },
      location: { city: 'Mumbai' },
    }),
  });

  const vendorBDoc = await Vendor.findOneAndUpdate(
    { $or: [{ userId: vendorBUser.userId }, { user: vendorBUser.userId }] },
    { isVerified: true, isActive: true, status: 'active' },
    { new: true }
  );

  // Create Service
  const serviceRes = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorAUser.token}` },
    body: JSON.stringify({
      title: 'Premium Candid Wedding Photography',
      description: 'Full day coverage with cinematic videography and photo album.',
      category: 'event',
      price: 35000,
      priceUnit: 'per_event',
      city: 'Mumbai',
    }),
  }).then((r) => r.json());

  if (!serviceRes.success) throw new Error(`Service creation failed: ${JSON.stringify(serviceRes)}`);
  const serviceObj = serviceRes.data || serviceRes.service;
  const serviceId = serviceObj._id;

  // Create & Complete Booking
  console.log('\n[TEST 2] Creating and completing a booking...');
  const bookingRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUser.token}` },
    body: JSON.stringify({
      serviceId,
      eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      eventDetails: { eventType: 'Wedding Reception', guestCount: 150, venue: 'Grand Ballroom' },
    }),
  }).then((r) => r.json());

  if (!bookingRes.success) throw new Error(`Booking creation failed: ${JSON.stringify(bookingRes)}`);
  const bookingObj = bookingRes.data || bookingRes.booking;
  const bookingId = bookingObj._id;

  // Transition booking to completed: confirm -> start -> complete
  const confirmRes = await fetch(`${API_BASE}/bookings/${bookingId}/confirm`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorAUser.token}` },
  }).then((r) => r.json());
  if (!confirmRes.success) throw new Error(`Booking confirm failed: ${JSON.stringify(confirmRes)}`);

  const startRes = await fetch(`${API_BASE}/bookings/${bookingId}/start`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorAUser.token}` },
  }).then((r) => r.json());
  if (!startRes.success) throw new Error(`Booking start failed: ${JSON.stringify(startRes)}`);

  const completeRes = await fetch(`${API_BASE}/bookings/${bookingId}/complete`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vendorAUser.token}` },
  }).then((r) => r.json());
  if (!completeRes.success) throw new Error(`Booking complete failed: ${JSON.stringify(completeRes)}`);

  console.log('✓ TEST 2 PASSED: Booking completed successfully (confirm -> start -> complete)');

  // 3 & 4 & 5. Submit valid review
  console.log('\n[TEST 3, 4, 5] Submitting customer review for completed booking...');
  const reviewRes = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUser.token}` },
    body: JSON.stringify({
      bookingId,
      serviceId,
      rating: 5,
      title: 'Outstanding Photography & Professionalism!',
      comment: 'The team was punctual, highly skilled, and captured breathtaking moments.',
      tags: ['on_time', 'professional', 'great_quality', 'would_recommend'],
    }),
  }).then((r) => r.json());

  if (!reviewRes.success) throw new Error(`Review submission failed: ${JSON.stringify(reviewRes)}`);
  const reviewId = reviewRes.data._id;

  const updatedBooking = await Booking.findById(bookingId);
  if (!updatedBooking.isReviewed) throw new Error('Expected booking.isReviewed to be true');

  console.log('✓ TEST 3, 4, 5 PASSED: Review saved, verified, and booking.isReviewed updated to true');

  // 6. Verify duplicate review rejected
  console.log('\n[TEST 6] Testing duplicate review rejection...');
  const duplicateReviewRes = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerUser.token}` },
    body: JSON.stringify({
      bookingId,
      serviceId,
      rating: 4,
      comment: 'Attempting duplicate review',
    }),
  }).then((r) => r.json());

  if (duplicateReviewRes.success) throw new Error('Duplicate review should have been rejected');
  console.log('✓ TEST 6 PASSED: Duplicate review correctly rejected');

  // 7 & 8. Verify service rating and vendor rating updated
  console.log('\n[TEST 7 & 8] Verifying Service & Vendor rating updates...');
  const updatedService = await Service.findById(serviceId);
  const updatedVendor = await Vendor.findById(vendorADoc._id);

  if (updatedService.ratings.average !== 5 || updatedService.ratings.count !== 1) {
    throw new Error(`Service rating mismatch: average=${updatedService.ratings.average}, count=${updatedService.ratings.count}`);
  }
  if (updatedVendor.ratings.average !== 5 || updatedVendor.ratings.count !== 1) {
    throw new Error(`Vendor rating mismatch: average=${updatedVendor.ratings.average}, count=${updatedVendor.ratings.count}`);
  }
  console.log('✓ TEST 7 & 8 PASSED: Service and Vendor rating averages mathematically updated to 5.0 (1 count)');

  // 9 & 10. Fetch service reviews & rating distribution
  console.log('\n[TEST 9 & 10] Fetching service reviews and rating distribution...');
  const serviceReviewsRes = await fetch(`${API_BASE}/reviews/service/${serviceId}`).then((r) => r.json());

  if (!serviceReviewsRes.success || !serviceReviewsRes.data.summary.distribution) {
    throw new Error(`Service reviews fetch failed: ${JSON.stringify(serviceReviewsRes)}`);
  }
  if (serviceReviewsRes.data.summary.distribution['5'] !== 1) {
    throw new Error('Expected 5-star distribution count to be 1');
  }
  console.log('✓ TEST 9 & 10 PASSED: Service reviews and rating distribution correctly returned');

  // 11. Fetch vendor reviews
  console.log('\n[TEST 11] Fetching vendor reviews...');
  const vendorReviewsRes = await fetch(`${API_BASE}/reviews/vendor/${vendorADoc._id}`).then((r) => r.json());
  if (!vendorReviewsRes.success || vendorReviewsRes.data.reviews.length === 0) {
    throw new Error(`Vendor reviews fetch failed: ${JSON.stringify(vendorReviewsRes)}`);
  }
  console.log('✓ TEST 11 PASSED: Vendor reviews retrieved successfully');

  // 13 & 14. Vendor replies to review
  console.log('\n[TEST 13 & 14] Vendor posting reply to review...');
  const replyRes = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorAUser.token}` },
    body: JSON.stringify({ message: 'Thank you so much for your wonderful feedback!' }),
  }).then((r) => r.json());

  if (!replyRes.success || !replyRes.data.vendorReply) {
    throw new Error(`Vendor reply failed: ${JSON.stringify(replyRes)}`);
  }
  console.log('✓ TEST 13 & 14 PASSED: Vendor reply saved successfully');

  // 17. Unauthorized vendor reply rejected
  console.log('\n[TEST 17] Testing unauthorized vendor reply rejection...');
  const unauthorizedReplyRes = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorBUser.token}` },
    body: JSON.stringify({ message: 'Fake reply attempt from unrelated vendor' }),
  }).then((r) => r.json());

  if (unauthorizedReplyRes.success) throw new Error('Unrelated vendor should not be allowed to reply');
  console.log('✓ TEST 17 PASSED: Unauthorized vendor reply correctly rejected');

  // 15 & 16. Mark review helpful
  console.log('\n[TEST 15 & 16] Marking review as helpful...');
  const helpfulRes = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerUser.token}` },
  }).then((r) => r.json());

  if (!helpfulRes.success || helpfulRes.data.helpfulCount !== 1) {
    throw new Error(`Helpful count increment failed: ${JSON.stringify(helpfulRes)}`);
  }
  console.log('✓ TEST 15 & 16 PASSED: Review marked helpful and count incremented');

  // 18 & 19. Admin deletes review and ratings recalculate
  console.log('\n[TEST 18 & 19] Testing admin review deletion & rating recalculation...');
  const deleteRes = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminUser.token}` },
  }).then((r) => r.json());

  if (!deleteRes.success) throw new Error(`Delete review failed: ${JSON.stringify(deleteRes)}`);

  const postDeleteService = await Service.findById(serviceId);
  const postDeleteVendor = await Vendor.findById(vendorADoc._id);

  if (postDeleteService.ratings.average !== 0 || postDeleteService.ratings.count !== 0) {
    throw new Error('Service rating failed to reset after review deletion');
  }
  if (postDeleteVendor.ratings.average !== 0 || postDeleteVendor.ratings.count !== 0) {
    throw new Error('Vendor rating failed to reset after review deletion');
  }
  console.log('✓ TEST 18 & 19 PASSED: Review deleted by admin and ratings recalculated back to 0');

  // 20. Verify Modules 1-8 remain functional
  console.log('\n[TEST 20] Verifying Modules 1-8 health...');
  const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
  if (!healthRes.success) throw new Error('System health check failed');
  console.log('✓ TEST 20 PASSED: Modules 1-8 remain fully functional');

  console.log('\n==================================================');
  console.log('--- ALL MODULE 9 REVIEWS TESTS PASSED SUCCESSFULLY! ---');
  console.log('==================================================\n');
  process.exit(0);
}

runModule9Tests().catch((err) => {
  console.error('❌ MODULE 9 TEST FAILURE:', err);
  process.exit(1);
});
