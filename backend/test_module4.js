import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5001/api/v1';

async function runTests() {
  console.log('--- STARTING MODULE 4 END-TO-END VERIFICATION TESTS ---');

  // TEST 1: Register new customer
  console.log('\n[TEST 1] Registering new customer user...');
  const customerEmail = `cust_${Date.now()}@example.com`;
  const customerPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Module 4 Customer',
      email: customerEmail,
      phone: customerPhone,
      password: 'Password@123',
      role: 'customer',
    }),
  }).then((r) => r.json());

  console.log('Registration Response:', regRes);
  if (!regRes.success || !regRes.userId || !regRes.requiresVerification) {
    throw new Error('TEST 1 FAILED: Invalid registration response');
  }
  const userId = regRes.userId;
  console.log('✓ TEST 1 PASSED: User registered with requiresVerification = true & userId');

  // TEST 2: Wrong OTP
  console.log('\n[TEST 2] Submitting wrong OTP code (999999)...');
  const wrongRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp: '999999', type: 'email_verify' }),
  }).then((r) => r.json());

  console.log('Wrong OTP Response:', wrongRes);
  if (wrongRes.success || wrongRes.message !== 'Incorrect verification code.') {
    throw new Error('TEST 2 FAILED: Expected Incorrect verification code error');
  }
  console.log('✓ TEST 2 PASSED: Wrong OTP rejected cleanly');

  // TEST 3: Wrong OTP 3 times
  console.log('\n[TEST 3] Submitting wrong OTP 2 more times to trigger 3-attempt lock...');
  await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp: '999999', type: 'email_verify' }),
  });
  const lockRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp: '999999', type: 'email_verify' }),
  }).then((r) => r.json());

  console.log('3rd Attempt Lock Response:', lockRes);
  if (lockRes.success || !lockRes.message.includes('Too many incorrect attempts')) {
    throw new Error('TEST 3 FAILED: Expected Too many incorrect attempts lock message');
  }
  console.log('✓ TEST 3 PASSED: OTP locked after 3 wrong attempts');

  // TEST 4: Cooldown & Resend OTP
  console.log('\n[TEST 4] Requesting OTP resend immediately (testing 60s cooldown)...');
  const cooldownRes = await fetch(`${API_BASE}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, type: 'email_verify' }),
  });
  console.log('Cooldown HTTP status:', cooldownRes.status);
  const cooldownData = await cooldownRes.json();
  console.log('Cooldown Response:', cooldownData);
  if (cooldownRes.status !== 429 || !cooldownData.message.includes('Please wait')) {
    throw new Error('TEST 4 FAILED: Cooldown not enforced');
  }
  console.log('✓ TEST 4 PASSED: 60-second resend cooldown enforced cleanly');

  // TEST 6 & 7 & 9 & 10: Unverified Login & Vendor Registration
  console.log('\n[TEST 6 & 7] Logging in as unverified user...');
  const unverifiedLogin = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: 'Password@123' }),
  }).then((r) => r.json());

  console.log('Unverified Login Response:', unverifiedLogin);
  if (unverifiedLogin.success || !unverifiedLogin.requiresVerification || !unverifiedLogin.userId) {
    throw new Error('TEST 6 & 7 FAILED: Unverified user login did not return requiresVerification');
  }
  console.log('✓ TEST 6 & 7 PASSED: Unverified login returns requiresVerification = true & userId');

  // TEST 10: Register Vendor
  console.log('\n[TEST 10] Registering vendor role account...');
  const vendorEmail = `vendor_${Date.now()}@example.com`;
  const vendorPhone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));
  const vendorReg = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Module 4 Vendor',
      email: vendorEmail,
      phone: vendorPhone,
      password: 'Password@123',
      role: 'vendor',
    }),
  }).then((r) => r.json());

  console.log('Vendor Registration Response:', vendorReg);
  if (!vendorReg.success || !vendorReg.userId || !vendorReg.requiresVerification) {
    throw new Error('TEST 10 FAILED: Vendor registration failed');
  }
  console.log('✓ TEST 10 PASSED: Vendor account registered with verification required');

  console.log('\n==================================================');
  console.log('🎉 ALL MODULE 4 HTTP API TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('==================================================');
}

runTests().catch((err) => {
  console.error('❌ TEST RUN FAILED:', err);
  process.exit(1);
});
