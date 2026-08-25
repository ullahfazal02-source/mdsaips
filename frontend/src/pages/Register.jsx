import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Shield, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    const cleanPhone = formData.phone.replace(/[\s\-\+]/g, '');
    const indianPhoneRegex = /^(?:91)?[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!indianPhoneRegex.test(cleanPhone)) {
      errors.phone = 'Please provide a valid 10-digit Indian phone number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
      });

      if (response?.requiresVerification || response?.success) {
        navigate('/verify-otp', {
          state: {
            userId: response.userId,
            email: response.email || formData.email.trim(),
          },
        });
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        toast.error(err.errors.join(', '));
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400 mx-auto shadow-glow">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join the MDSAIPS Multi-Domain Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border ${
                  formErrors.name ? 'border-red-500/80' : 'border-slate-700 focus:border-accent-500'
                } text-slate-200 text-sm focus:outline-none transition-colors`}
              />
            </div>
            {formErrors.name && (
              <p className="text-[11px] text-red-400 font-medium">{formErrors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border ${
                  formErrors.email ? 'border-red-500/80' : 'border-slate-700 focus:border-accent-500'
                } text-slate-200 text-sm focus:outline-none transition-colors`}
              />
            </div>
            {formErrors.email && (
              <p className="text-[11px] text-red-400 font-medium">{formErrors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Phone Number (India)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border ${
                  formErrors.phone ? 'border-red-500/80' : 'border-slate-700 focus:border-accent-500'
                } text-slate-200 text-sm focus:outline-none transition-colors`}
              />
            </div>
            {formErrors.phone && (
              <p className="text-[11px] text-red-400 font-medium">{formErrors.phone}</p>
            )}
          </div>

          {/* Account Role Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Account Type</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-accent-500 appearance-none cursor-pointer"
              >
                <option value="customer">Customer / Client</option>
                <option value="vendor">Service Vendor</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border ${
                  formErrors.password ? 'border-red-500/80' : 'border-slate-700 focus:border-accent-500'
                } text-slate-200 text-sm focus:outline-none transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-[11px] text-red-400 font-medium">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border ${
                  formErrors.confirmPassword ? 'border-red-500/80' : 'border-slate-700 focus:border-accent-500'
                } text-slate-200 text-sm focus:outline-none transition-colors`}
              />
            </div>
            {formErrors.confirmPassword && (
              <p className="text-[11px] text-red-400 font-medium">{formErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-600 to-brand-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* OR Divider & Google OAuth Button */}
        <div className="space-y-4 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 absolute">
              OR
            </span>
          </div>

          <GoogleAuthButton label="Sign up with Google" />
        </div>

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
