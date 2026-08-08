import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * Placeholder Verification Page for Module 3 Foundation
 * Collects and stores verification email for Module 4 OTP integration.
 */
export const VerifyOtp = () => {
  const location = useLocation();
  const email = location.state?.email || 'your registered email';

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto shadow-glow">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Registration Complete</h2>
          <p className="text-xs text-slate-300">
            Account created for <span className="font-semibold text-brand-400">{email}</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-3 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Authentication Profile Established</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Module 3 Authentication Foundation is active. Email verification via OTP will be integrated in Module 4.
          </p>
        </div>

        <div className="pt-2 flex flex-col space-y-3">
          <Link
            to="/login"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm shadow-glow flex items-center justify-center space-x-2 hover:opacity-95 transition-opacity"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Return to MDSAIPS Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
