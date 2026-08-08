import React from 'react';
import { User, Mail, Shield, Key, Bell } from 'lucide-react';

export const Profile = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Account & Profile Settings</h1>
          <p className="text-xs text-slate-400">Manage account credentials, preferences, and notifications</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-glow">
            U
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Guest Account</h3>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>guest@mdsaips.org</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase">Assigned Role</span>
            <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Customer / Aggregator</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-semibold uppercase">Security Mode</span>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <Key className="w-4 h-4" />
              <span>JWT / Cookie-Parser Standby</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-accent-400" />
            <span>Email & System Notifications</span>
          </div>
          <span className="text-emerald-400 font-semibold">Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
