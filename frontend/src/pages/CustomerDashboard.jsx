import React from 'react';
import { UserCheck, Clock, BookmarkCheck, Sparkles } from 'lucide-react';
// import {stars} from 'lucide-react'

export const CustomerDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Customer Portal</h1>
          <p className="text-xs text-slate-400">Overview of active service requests, saved plans, and bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Upcoming Plans</span>
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">Scheduled Itineraries</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Confirmed Bookings</span>
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">Cross-domain Reservations</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Saved AI Plans</span>
            <Sparkles className="w-4 h-4 text-accent-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">0</p>
          <p className="text-[11px] text-slate-500">AI Generated Dynamic Drafts</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Customer Hub Ready</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Customer itinerary timeline, vendor direct messaging, and payment status modules will be connected here.
        </p>
      </div>
    </div>
  );
};

export default CustomerDashboard;
