import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  CalendarCheck, 
  User, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  Briefcase,
  LogOut,
  ChevronDown,
  Heart,
  ShoppingCart,
  BookmarkCheck
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useWishlist from '@/hooks/useWishlist';
import useCart from '@/hooks/useCart';

/**
 * MDSAIPS Primary Navigation Bar Component
 * Features role-aware user profile dropdown menu, live Wishlist/Cart counters, and responsive auth controls.
 */
export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, user, role, logout } = useAuth();
  const { count: wishlistCount, refreshCount } = useWishlist();
  const { itemCount: cartCount } = useCart();

  // Refresh Wishlist count when logged in
  useEffect(() => {
    if (isAuthenticated) {
      refreshCount().catch(() => {});
    }
  }, [isAuthenticated, refreshCount]);

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary Nav Links
  const navLinks = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Services', path: '/services', icon: Briefcase },
    { label: 'AI Planner', path: '/ai-planner', icon: Sparkles },
  ];

  if (isAuthenticated) {
    navLinks.push({ label: 'Bookings', path: '/booking', icon: CalendarCheck });
  }

  const isActive = (path) => location.pathname === path;

  // Determine role-aware dashboard URL
  const getDashboardPath = () => {
    if (role === 'vendor') return '/vendor-dashboard';
    if (role === 'admin') return '/admin-dashboard';
    return '/customer-dashboard';
  };

  const getDashboardLabel = () => {
    if (role === 'vendor') return 'Vendor Command Center';
    if (role === 'admin') return 'Admin Dashboard';
    return 'Customer Portal';
  };

  const handleLogoutClick = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent tracking-tight">
                MDSAIPS
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium uppercase tracking-widest -mt-1">
                Intelligent Aggregator
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Wishlist Link & Badge */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/wishlist')
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold ml-1 animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Link & Badge */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/cart')
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-brand-400" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold ml-1 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Desktop Auth User Profile Dropdown */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative" ref={userMenuRef}>
              {isAuthenticated && user ? (
                /* Authenticated User Menu Button */
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all text-xs font-semibold"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold text-xs shrink-0">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white line-clamp-1 max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] text-brand-400 uppercase tracking-wider font-extrabold -mt-0.5">{role}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                /* Unauthenticated User Menu Button */
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <User className="w-4 h-4 text-brand-400" />
                  <span>Account</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Dropdown Options Panel */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 py-2 glass-panel rounded-2xl shadow-2xl border border-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Header Info */}
                      <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-[10px] font-bold text-brand-400 uppercase">
                          {role} Account
                        </span>
                      </div>

                      {/* Role-Aware Dashboard Link */}
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-400" />
                        <span>{getDashboardLabel()}</span>
                      </Link>

                      {/* Profile Link */}
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        <span>My Profile</span>
                      </Link>

                      {/* My Bookings Link */}
                      <Link
                        to="/booking"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 text-blue-400" />
                        <span>My Bookings</span>
                      </Link>

                      {/* Wishlist Link */}
                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span>Wishlist</span>
                        </div>
                        {wishlistCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      {/* Cart Link */}
                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <ShoppingCart className="w-4 h-4 text-brand-400" />
                          <span>Cart</span>
                        </div>
                        {cartCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold">
                            {cartCount}
                          </span>
                        )}
                      </Link>

                      <div className="my-1 border-t border-slate-800" />

                      {/* Logout Action */}
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Logged Out Options */}
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
                      >
                        <LogIn className="w-4 h-4 text-brand-400" />
                        <span>Login</span>
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-accent-400" />
                        <span>Register</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Drawer Toggle */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Auth Section */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2 text-xs text-slate-300 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center text-[10px]">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-bold text-white line-clamp-1">{user.name}</span>
                  </div>
                  <span className="text-[10px] text-brand-400 font-bold uppercase px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                    {role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 text-brand-400" />
                      <span>Cart</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-center py-2.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl mt-2 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-slate-200 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-white bg-brand-600 rounded-xl shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
