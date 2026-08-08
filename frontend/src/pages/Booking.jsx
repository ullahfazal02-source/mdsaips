import React from 'react';
import { CalendarCheck, ShieldCheck, CreditCard, Clock } from 'lucide-react';

export const Booking = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Booking Management & Checkout</h1>
          <p className="text-xs text-slate-400">Cross-domain multi-service booking confirmation engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Hold Status</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white">No Active Reservations</p>
          <p className="text-[11px] text-slate-500">Service slots expire in 15 mins</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Payment Gateway</span>
            <CreditCard className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-xl font-bold text-white">Stripe / Escrow Ready</p>
          <p className="text-[11px] text-slate-500">Secure transaction protocol</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Protection Policy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">Multi-Vendor Protection</p>
          <p className="text-[11px] text-slate-500">Atomic rollback on failure</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Booking Engine Ready</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Cart aggregation, service schedule locking, atomic transaction handling, and checkout flows ready for backend connection.
        </p>
      </div>
    </div>
  );
};

export default Booking;
