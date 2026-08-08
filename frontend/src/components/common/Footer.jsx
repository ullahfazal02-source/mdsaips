import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Layers } from 'lucide-react';

/**
 * MDSAIPS Master Footer Component
 */
export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* System Identity & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">MDSAIPS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-Domain Service Aggregation & Intelligent Planning System. Next-generation ecosystem for intelligent multi-vendor workflow orchestration.
            </p>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-brand-400 transition-colors">Home Portal</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">Service Marketplace</Link></li>
              <li><Link to="/ai-planner" className="hover:text-brand-400 transition-colors">AI Intelligent Planner</Link></li>
              <li><Link to="/booking" className="hover:text-brand-400 transition-colors">Booking Engine</Link></li>
            </ul>
          </div>

          {/* Portals & Dashboards */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Access Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/customer-dashboard" className="hover:text-brand-400 transition-colors">Customer Portal</Link></li>
              <li><Link to="/vendor-dashboard" className="hover:text-brand-400 transition-colors">Vendor Command Center</Link></li>
              <li><Link to="/admin-dashboard" className="hover:text-brand-400 transition-colors">Admin Console</Link></li>
              <li><Link to="/profile" className="hover:text-brand-400 transition-colors">Account Management</Link></li>
            </ul>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-brand-400" />
              <span>React 19 & Express Gateway</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Layers className="w-4 h-4 text-accent-400" />
              <span>Redux Toolkit & Persist</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Winston & Helmet Protected</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Metadata */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MDSAIPS Architecture Team. Major Project Foundation.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Production Blueprint Setup</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
