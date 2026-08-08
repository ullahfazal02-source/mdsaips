import React from 'react';
import { Store, TrendingUp, Calendar, DollarSign, PackageCheck } from 'lucide-react';

export const VendorDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Vendor Command Center</h1>
          <p className="text-xs text-slate-400">Manage listings, incoming requests, and schedule availability</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">Awaiting Service Requests</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Active Listings</span>
            <PackageCheck className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">Configured Service Offerings</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">$0.00</p>
          <p className="text-[11px] text-slate-500">Aggregated Earnings</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
        <TrendingUp className="w-10 h-10 text-purple-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Vendor Portal Operational Ready</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Vendor catalog management, calendar sync, and automated quotation pipelines will be connected to the backend routes in upcoming implementation sprints.
        </p>
      </div>
    </div>
  );
};

export default VendorDashboard;
