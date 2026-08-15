import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import OTPInput from '@/components/auth/OTPInput';

/**
 * Mask email address for privacy display (e.g. u***@gmail.com)
 */
const maskEmail = (emailStr) => {
  if (!emailStr || typeof emailStr !== 'string' || !emailStr.includes('@')) {
    return 'your registered email';
  }
  const [local, domain] = emailStr.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

export const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, loading } = useAuth();

  const userId = location.state?.userId || sessionStorage.getItem('pending_userId');
  const email = location.state?.email || sessionStorage.getItem('pending_email') || '';

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Persist pending credentials locally in case of page refresh
  useEffect(() => {
    if (location.state?.userId) {
      sessionStorage.setItem('pending_userId', location.state.userId);
    }
    if (location.state?.email) {
      sessionStorage.setItem('pending_email', location.state.email);
    }
  }, [location.state]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (!userId) {
      toast.error('Session expired. Please log in or register again.');
      navigate('/login');
      return;
    }

    try {
      const response = await verifyOtp({
        userId,
        otp,
        type: 'email_verify',
      });

      if (response?.success && response?.user) {
        sessionStorage.removeItem('pending_userId');
        sessionStorage.removeItem('pending_email');

        const role = response.user.role;
        if (role === 'vendor') {
          navigate('/vendor-dashboard');
        } else if (role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      }
    } catch (err) {
      // Error handled by useAuth toast
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    if (!userId) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    setResending(true);
    try {
      const response = await resendOtp({
        userId,
        type: 'email_verify',
      });

      if (response?.success) {
        setCountdown(60);
        setOtp('');
      }
    } catch (err) {
      // Error handled by useAuth toast
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 text-center shadow-xl">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto shadow-glow">
          <ShieldCheck className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-white">Verify Your Email</h2>
          <p className="text-xs text-slate-400">
            We sent a 6-digit verification code to:
          </p>
          <p className="text-sm font-semibold text-brand-400 tracking-wide">
            {maskEmail(email)}
          </p>
        </div>

        {/* Form & OTP Input */}
        <form onSubmit={handleVerify} className="space-y-6">
          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="pt-4 border-t border-slate-800/80 text-xs space-y-2">
          {!canResend ? (
            <p className="text-slate-400">
              Didn't receive the code?{' '}
              <span className="font-semibold text-brand-400">
                Resend code in {countdown}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center space-x-1.5 text-brand-400 font-semibold hover:underline focus:outline-none disabled:opacity-50"
            >
              {resending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Navigation links */}
        <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/60">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <Link
            to="/register"
            className="hover:text-brand-400 transition-colors"
          >
            Register another account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
