import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';

/**
 * MDSAIPS Primary Navigation Bar Component
 * Glassmorphic design with active route indicators, role badges, and auth actions.
 */
export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, role, logout } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Services', path: '/services', icon: Briefcase },
    { label: 'AI Planner', path: '/ai-planner', icon: Sparkles },
    { label: 'Bookings', path: '/booking', icon: CalendarCheck },
  ];

  const dashboardLinks = [
    { label: 'Customer', path: '/customer-dashboard' },
    { label: 'Vendor', path: '/vendor-dashboard' },
    { label: 'Admin', path: '/admin-dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Identity */}
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

            {/* Dashboards Dropdown / Quick Links */}
            <div className="relative group px-1">
              <button className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all">
                <LayoutDashboard className="w-4 h-4 text-brand-400" />
                <span>Dashboards</span>
              </button>

              <div className="absolute right-0 top-full mt-2 w-48 py-2 glass-panel rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {dashboardLinks.map((dash) => (
                  <Link
                    key={dash.path}
                    to={dash.path}
                    className={`block px-4 py-2 text-xs font-medium transition-colors ${
                      isActive(dash.path)
                        ? 'text-brand-400 bg-brand-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {dash.label} Dashboard
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-[100px]">{user.name}</span>
                    <span className="text-[10px] text-brand-400 uppercase tracking-wider font-bold -mt-0.5">{role}</span>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="User Profile"
                >
                  <User className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 text-xs font-semibold text-white shadow-lg hover:shadow-glow transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs uppercase text-slate-500 font-semibold px-3 py-1">Dashboards</div>
            {dashboardLinks.map((dash) => (
              <Link
                key={dash.path}
                to={dash.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60"
              >
                {dash.label} Dashboard
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-xs text-slate-300 bg-slate-900 rounded-lg flex items-center justify-between">
                  <span>Signed in as <strong className="text-brand-400">{user.name}</strong> ({role})</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 text-sm font-semibold text-red-400 bg-red-500/10 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-200 bg-slate-800 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
