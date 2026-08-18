import React from 'react';
import { Receipt, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import PaymentStatus from './PaymentStatus';

/**
 * PaymentSummary Component
 * Displays financial breakdown for a booking (Base, GST, Discount, Total, Payment Status).
 */
export const PaymentSummary = ({ booking, className = '' }) => {
  if (!booking) return null;

  const { pricing = {}, packageSelected, serviceId = {}, paymentStatus = 'unpaid' } = booking;
  const { baseAmount = 0, taxes = 0, discount = 0, totalAmount = 0 } = pricing;
  const service = serviceId || {};

  return (
    <div className={`glass-card p-6 rounded-2xl border border-slate-800 space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-brand-400" />
          <span>Payment Summary</span>
        </h3>
        <PaymentStatus status={paymentStatus} />
      </div>

      <div className="space-y-2 text-xs">
        {/* Service Title */}
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Service</span>
          <span className="font-semibold text-white">{service.title || 'Service Listing'}</span>
        </div>

        {/* Package Selected */}
        {packageSelected && (
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-emerald-400" />
              <span>Package Tier</span>
            </span>
            <span className="font-bold text-emerald-400 capitalize px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {packageSelected}
            </span>
          </div>
        )}

        {/* Base Amount */}
        <div className="flex justify-between items-center text-slate-300 pt-1">
          <span className="text-slate-400">Base Amount</span>
          <span>₹{baseAmount.toLocaleString('en-IN')}</span>
        </div>

        {/* GST (18%) */}
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">GST (18%)</span>
          <span>₹{taxes.toLocaleString('en-IN')}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-400">
            <span>Discount Applied</span>
            <span>- ₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Total Amount */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-extrabold text-white">
          <span>Total Amount</span>
          <span className="text-lg text-brand-400">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Secured via Razorpay 256-bit Encrypted TEST Checkout</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
