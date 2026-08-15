import { createOTP } from './services/otp.service.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5001/api/v1';

async function testVerificationAndLogin() {
  console.log('--- TESTING OTP VERIFICATION & LOGGED IN FLOW ---');
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Register User
  const email = `verify_test_${Date.now()}@example.com`;
  const phone = '9' + String(Math.floor(Math.random() * 899999999 + 100000000));
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Test User',
      email,
      phone,
      password: 'Password@123',
      role: 'customer',
    }),
  }).then((r) => r.json());

  console.log('Registered User ID:', regRes.userId);

  // 2. Generate a fresh known OTP for this user using createOTP service
  const { plainOtp } = await createOTP(regRes.userId, email, 'email_verify');
  console.log('Generated Plain OTP for test verification');

  // 3. Verify OTP via API
  const verifyRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: regRes.userId,
      otp: plainOtp,
      type: 'email_verify',
    }),
  }).then((r) => r.json());

  console.log('Verify Response:', verifyRes);
  if (!verifyRes.success || !verifyRes.token || !verifyRes.user) {
    throw new Error('Verification API failed!');
  }
  console.log('✓ Email Verification Succeeded! JWT Issued:', verifyRes.token ? 'YES' : 'NO');

  // 4. Test Login as verified user
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password@123',
    }),
  }).then((r) => r.json());

  console.log('Post-Verification Login Response:', loginRes);
  if (!loginRes.success || !loginRes.token || loginRes.user.email !== email) {
    throw new Error('Post-verification login failed!');
  }
  console.log('✓ Post-Verification Login Succeeded!');

  await mongoose.disconnect();
  console.log('🎉 VERIFICATION AND LOGIN FLOW FULLY VERIFIED! 🎉');
}

testVerificationAndLogin().catch((err) => {
  console.error('❌ FAILED:', err);
  process.exit(1);
});
