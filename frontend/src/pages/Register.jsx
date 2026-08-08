import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.info('Registration UI structure ready. Auth logic will be integrated in Phase 2.');
  };

  return (
    <div className="max-w-md mx-auto my-6">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400 mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join the MDSAIPS Multi-Domain Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-accent-500"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-accent-500"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Account Type</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <select
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-accent-500 appearance-none"
                disabled
              >
                <option value="customer">Customer / Client</option>
                <option value="vendor">Service Vendor</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-accent-500"
                readOnly
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-600 to-brand-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 transition-opacity"
          >
            Create Account
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-400 font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
