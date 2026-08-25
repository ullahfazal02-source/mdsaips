import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response?.requiresVerification) {
        navigate('/verify-otp', {
          state: {
            userId: response.userId,
            email: response.email || formData.email.trim(),
          },
        });
        return;
      }

      if (response?.success && response?.user) {
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          const role = response.user.role;
          if (role === 'vendor') navigate('/vendor-dashboard');
          else if (role === 'admin') navigate('/admin-dashboard');
          else navigate('/customer-dashboard');
        }
      }
    } catch (err) {
      // Error handled by useAuth hook toast
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Password reset feature will be enabled in Module 4 with OTP verification.');
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto shadow-glow">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to access your MDSAIPS portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  formErrors.email ? 'border-red-500/80' : 'border-slate-700 focus:border-brand-500'
                } text-slate-200 text-sm focus:outline-none transition-colors`}
              />
            </div>
            {formErrors.email && (
              <p className="text-[11px] text-red-400 font-medium">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-brand-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
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
                  formErrors.password ? 'border-red-500/80' : 'border-slate-700 focus:border-brand-500'
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
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

          <GoogleAuthButton label="Continue with Google" />
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
