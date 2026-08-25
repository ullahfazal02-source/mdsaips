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
import { User, Vendor, Service, Booking, Payment } from './models/index.js';
import bcrypt from 'bcryptjs';

const PORT = process.env.TEST_PORT || 5003;
const API_BASE = `http://localhost:${PORT}/api/v1`;

async function runEnhancementSuite() {
  console.log('================================================================================');
  console.log('--- STARTING MDSAIPS DOMAIN, FILTERING, VENDOR-BUYER & OAUTH AUDIT SUITE ---');
  console.log('================================================================================');

  await connectDB();
  const server = app.listen(PORT);
  const ts = Date.now();

  const password = 'Password@123';
  const vendorAEmail = `suite_va_${ts}@example.com`;
  const vendorBEmail = `suite_vb_${ts}@example.com`;
  const customerEmail = `suite_cust_${ts}@example.com`;
  const googleUserEmail = `suite_google_${ts}@gmail.com`;

  // 1. Create Helper Users
  async function createVerifiedUser(name, email, phone, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone: '9' + String(Math.floor(Math.random() * 899999999 + 100000000)),
      password: hashedPassword,
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

    return { userId: user._id, token: loginRes.token };
  }

  console.log('\n[SETUP] Creating test users & vendor profiles...');
  const vendorA = await createVerifiedUser('Suite Vendor A', vendorAEmail, null, 'vendor');
  const vendorB = await createVerifiedUser('Suite Vendor B', vendorBEmail, null, 'vendor');
  const customer = await createVerifiedUser('Suite Customer', customerEmail, null, 'customer');

  // Register vendor profiles directly
  const vA = await Vendor.create({
    userId: vendorA.userId,
    user: vendorA.userId,
    businessName: 'Vendor A Enterprises',
    category: 'event',
    location: { city: 'Mumbai' },
    isVerified: true,
    isActive: true,
    status: 'active',
  });

  const vB = await Vendor.create({
    userId: vendorB.userId,
    user: vendorB.userId,
    businessName: 'Vendor B Solutions',
    category: 'home',
    location: { city: 'Delhi' },
    isVerified: true,
    isActive: true,
    status: 'active',
  });

  // Create Services for Tests 1 - 6
  console.log('\n[SETUP] Seeding services across 4 domains...');

  // Home Plumbing Service (Vendor A)
  const plumbingSrv = await Service.create({
    vendorId: vA._id,
    vendor: vA._id,
    title: 'Bathroom Pipe Repair & Tank Check',
    description: 'Expert bathroom pipe leak repair and water tank inspection services.',
    category: 'home',
    subCategory: 'plumbing',
    price: 800,
    city: 'Mumbai',
    isActive: true,
  });

  // Home Plumbing Service (Vendor B)
  const plumbingSrv2 = await Service.create({
    vendorId: vB._id,
    vendor: vB._id,
    title: 'Full Home Plumbing & Pipe Fitting',
    description: 'Complete home plumbing, sanitary fitting and pipe repair service.',
    category: 'home',
    subCategory: 'plumbing',
    price: 1500,
    city: 'Mumbai',
    isActive: true,
  });

  // Home AC Service
  const acSrv = await Service.create({
    vendorId: vB._id,
    vendor: vB._id,
    title: 'Split AC Repair & Jet Service',
    description: 'Comprehensive split AC jet cleaning, gas charging and repair service.',
    category: 'home',
    subCategory: 'air_conditioning',
    price: 1200,
    city: 'Delhi',
    isActive: true,
  });

  // Home CCTV Service
  const cctvSrv = await Service.create({
    vendorId: vB._id,
    vendor: vB._id,
    title: '4-Camera HD CCTV System Installation',
    description: '4-channel HD CCTV camera installation with remote mobile monitoring.',
    category: 'home',
    subCategory: 'cctv',
    price: 8500,
    city: 'Delhi',
    isActive: true,
  });

  // Construction Painting Service
  const constrPaintSrv = await Service.create({
    vendorId: vA._id,
    vendor: vA._id,
    title: 'Exterior Building Painting & Weather Shield',
    description: 'Commercial and residential exterior wall painting and waterproofing coating.',
    category: 'construction',
    subCategory: 'painting',
    price: 45000,
    city: 'Mumbai',
    isActive: true,
  });

  // Event Photography Service
  const photoSrv = await Service.create({
    vendorId: vA._id,
    vendor: vA._id,
    title: 'Candid Wedding Photography & Drone Shoot',
    description: 'Premium candid wedding photography, traditional coverage and 4K video.',
    category: 'event',
    subCategory: 'photography_videography',
    price: 35000,
    city: 'Mumbai',
    isActive: true,
  });

  // Accommodation Hotel Service
  const hotelSrv = await Service.create({
    vendorId: vB._id,
    vendor: vB._id,
    title: 'Grand Luxury Executive Suite Hotel Stay',
    description: '5-star executive suite hotel stay with complimentary breakfast.',
    category: 'accommodation',
    subCategory: 'hotels',
    price: 6500,
    city: 'Delhi',
    isActive: true,
  });

  // ---------------------------------------------------------------------------
  // TEST 1: Home Services -> Plumbing -> Bathroom Pipe Repair
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 1] Testing Home Services -> Plumbing filtering...');
  const t1Res = await fetch(`${API_BASE}/services?category=home&subCategory=plumbing`).then((r) => r.json());
  const t1Services = t1Res.data?.services || t1Res.data;
  if (!t1Res.success || !Array.isArray(t1Services) || t1Services.length < 2) {
    throw new Error(`Test 1 Failed: Expected multiple plumbing services, got ${JSON.stringify(t1Res)}`);
  }
  console.log(`✓ TEST 1 PASSED: Found ${t1Services.length} plumbing services across vendors.`);

  // ---------------------------------------------------------------------------
  // TEST 2: Home Services -> AC & Appliances -> AC Repair
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Testing Home Services -> AC & Appliances filtering...');
  const t2Res = await fetch(`${API_BASE}/services?category=home&subCategory=air_conditioning`).then((r) => r.json());
  const t2Services = t2Res.data?.services || t2Res.data;
  if (!t2Res.success || !Array.isArray(t2Services) || t2Services.length === 0 || !t2Services.every((s) => s.subCategory.includes('ac') || s.subCategory.includes('air'))) {
    throw new Error(`Test 2 Failed: Expected AC services only, got ${JSON.stringify(t2Res)}`);
  }
  console.log(`✓ TEST 2 PASSED: Successfully retrieved AC services (${t2Services[0].title}).`);

  // ---------------------------------------------------------------------------
  // TEST 3: Home Services -> Electrical & Smart Home -> CCTV
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Testing Home Services -> CCTV filtering...');
  const t3Res = await fetch(`${API_BASE}/services?category=home&subCategory=cctv`).then((r) => r.json());
  const t3Services = t3Res.data?.services || t3Res.data;
  if (!t3Res.success || !Array.isArray(t3Services) || t3Services.length === 0 || t3Services[0].subCategory !== 'cctv') {
    throw new Error(`Test 3 Failed: Expected CCTV services only, got ${JSON.stringify(t3Res)}`);
  }
  console.log(`✓ TEST 3 PASSED: Successfully retrieved CCTV services (${t3Services[0].title}).`);

  // ---------------------------------------------------------------------------
  // TEST 4: Construction -> Painting
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing Construction -> Painting filtering...');
  const t4Res = await fetch(`${API_BASE}/services?category=construction&subCategory=painting`).then((r) => r.json());
  const t4Services = t4Res.data?.services || t4Res.data;
  if (!t4Res.success || !Array.isArray(t4Services) || t4Services.length === 0 || t4Services[0].category !== 'construction') {
    throw new Error(`Test 4 Failed: Expected Construction Painting services, got ${JSON.stringify(t4Res)}`);
  }
  console.log(`✓ TEST 4 PASSED: Successfully retrieved Construction Painting services (${t4Services[0].title}).`);

  // ---------------------------------------------------------------------------
  // TEST 5: Event -> Photography
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 5] Testing Event -> Photography filtering...');
  const t5Res = await fetch(`${API_BASE}/services?category=event&subCategory=photography_videography`).then((r) => r.json());
  const t5Services = t5Res.data?.services || t5Res.data;
  if (!t5Res.success || !Array.isArray(t5Services) || t5Services.length === 0 || t5Services[0].category !== 'event') {
    throw new Error(`Test 5 Failed: Expected Event Photography services, got ${JSON.stringify(t5Res)}`);
  }
  console.log(`✓ TEST 5 PASSED: Successfully retrieved Event Photography services (${t5Services[0].title}).`);

  // ---------------------------------------------------------------------------
  // TEST 6: Accommodation -> Hotels
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 6] Testing Accommodation -> Hotels filtering...');
  const t6Res = await fetch(`${API_BASE}/services?category=accommodation&subCategory=hotels`).then((r) => r.json());
  const t6Services = t6Res.data?.services || t6Res.data;
  if (!t6Res.success || !Array.isArray(t6Services) || t6Services.length === 0 || t6Services[0].category !== 'accommodation') {
    throw new Error(`Test 6 Failed: Expected Accommodation Hotel services, got ${JSON.stringify(t6Res)}`);
  }
  console.log(`✓ TEST 6 PASSED: Successfully retrieved Hotel services (${t6Services[0].title}).`);

  // ---------------------------------------------------------------------------
  // TEST 7: Invalid combination: Home -> Wedding Photography (Must be Rejected)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 7] Testing invalid domain-subcategory combination rejection...');
  const t7Res = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      title: 'Invalid Combination Listing',
      description: 'Invalid listing attempt for testing domain validation.',
      category: 'home',
      subCategory: 'wedding_photography',
      price: 5000,
      city: 'Mumbai',
    }),
  }).then((r) => r.json());

  if (t7Res.success) {
    throw new Error('Test 7 Failed: Invalid domain-subcategory combination should have been rejected');
  }
  console.log(`✓ TEST 7 PASSED: Invalid combination correctly rejected with 400: "${t7Res.message}"`);

  // ---------------------------------------------------------------------------
  // TEST 8: Vendor A attempts to book own service (Must be Rejected)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 8] Testing Vendor own-service booking prohibition...');
  const t8Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      serviceId: photoSrv._id,
      eventDate: '2026-09-15',
      eventDetails: { eventType: 'Self Booking' },
    }),
  }).then((r) => r.json());

  if (t8Res.success) {
    throw new Error('Test 8 Failed: Vendor was allowed to book their own service');
  }
  console.log(`✓ TEST 8 PASSED: Vendor own-service booking correctly blocked: "${t8Res.message}"`);

  // ---------------------------------------------------------------------------
  // TEST 9: Vendor A books Vendor B's service (Normal customer purchase flow)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 9] Testing Vendor-as-Buyer capabilities (Vendor A books Vendor B)...');
  const t9Res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${vendorA.token}` },
    body: JSON.stringify({
      serviceId: acSrv._id,
      eventDate: '2026-09-10',
      eventDetails: {
        serviceType: 'Office AC Repair',
        serviceAddress: 'Vendor A Studio, Mumbai',
      },
    }),
  }).then((r) => r.json());

  if (!t9Res.success || !t9Res.data?._id) {
    throw new Error(`Test 9 Failed: Vendor-as-buyer booking failed: ${JSON.stringify(t9Res)}`);
  }
  console.log(`✓ TEST 9 PASSED: Vendor A successfully booked Vendor B's service (Booking ID: ${t9Res.data._id}).`);

  // ---------------------------------------------------------------------------
  // TEST 10: Google OAuth New User Registration (Defaults to Customer)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 10] Testing Google OAuth new user registration...');
  const t10Res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: googleUserEmail,
      name: 'Google New Customer',
      picture: 'https://lh3.googleusercontent.com/a/default-user',
    }),
  }).then((r) => r.json());

  if (!t10Res.success || !t10Res.token || t10Res.user.role !== 'customer') {
    throw new Error(`Test 10 Failed: Google OAuth new user registration failed: ${JSON.stringify(t10Res)}`);
  }
  console.log(`✓ TEST 10 PASSED: New Google account created as Customer with JWT issued (Role: ${t10Res.user.role}).`);

  // ---------------------------------------------------------------------------
  // TEST 11: Google OAuth Existing User Authentication (No Duplication)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 11] Testing Google OAuth existing user login...');
  const t11Res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: googleUserEmail,
      name: 'Google New Customer',
    }),
  }).then((r) => r.json());

  if (!t11Res.success || !t11Res.token || t11Res.user.id !== t10Res.user.id) {
    throw new Error(`Test 11 Failed: Existing Google account login failed or duplicated: ${JSON.stringify(t11Res)}`);
  }

  const countUser = await User.countDocuments({ email: googleUserEmail.toLowerCase() });
  if (countUser !== 1) {
    throw new Error(`Test 11 Failed: Account duplication detected for ${googleUserEmail}`);
  }
  console.log(`✓ TEST 11 PASSED: Existing Google account authenticated without user duplication.`);

  console.log('\n================================================================================');
  console.log('--- ALL 11 ENHANCEMENT AUDIT TESTS PASSED 100% SUCCESSFULLY! ---');
  console.log('================================================================================\n');

  server.close();
  process.exit(0);
}

runEnhancementSuite().catch((err) => {
  console.error('\n❌ ENHANCEMENT TEST SUITE FAILED:', err);
  process.exit(1);
});
