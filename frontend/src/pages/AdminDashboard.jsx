import React from 'react';
import { ShieldAlert, Users, Server, AlertTriangle } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Admin Console</h1>
          <p className="text-xs text-slate-400">Global system oversight, user management, and health telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">Customers, Vendors & Admins</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Server Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">100% Operational</p>
          <p className="text-[11px] text-slate-500">Express Gateway & Logger Active</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">Vendor Verification Queue</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Admin Oversight Architecture Standby</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          System telemetry metrics, user access management, role delegation, and domain configuration policies setup.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
