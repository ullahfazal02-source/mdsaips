import React, { useState } from 'react';
import {
  XCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Tag,
  Building,
} from 'lucide-react';
import InvoiceModal from './InvoiceModal';
import ReorderModal from './ReorderModal';

/**
 * CancelledBookingsTab - Displays customer's cancelled bookings with
 * refund status, reorder availability, and inline actions
 */
const CancelledBookingsTab = ({ cancelledBookings, loading }) => {
  const [invoiceBookingId, setInvoiceBookingId] = useState(null);
  const [reorderBookingId, setReorderBookingId] = useState(null);

  const getRefundStatusBadge = (booking) => {
    const { refundStatus, paymentStatus } = booking;

    if (paymentStatus === 'refunded' || refundStatus === 'refunded') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
          <CheckCircle className="w-3 h-3" />
          <span>Refunded</span>
        </span>
      );
    }
    if (refundStatus === 'refund_pending') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold animate-pulse">
          <Clock className="w-3 h-3" />
          <span>Refund Pending</span>
        </span>
      );
    }
    if (paymentStatus === 'unpaid' || refundStatus === 'not_applicable') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-700 text-slate-400 text-[11px] font-bold">
          <span>No Refund Needed</span>
        </span>
      );
    }
    return null;
  };

  const getReorderStatusBadge = (booking) => {
    const now = new Date();
    const isAvailable = booking.reorderAvailableUntil && now <= new Date(booking.reorderAvailableUntil);
    const reorderStatus = booking.reorderStatus || (isAvailable ? 'reorder_available' : 'reorder_expired');

    if (reorderStatus === 'reorder_available') {
      const mins = Math.floor((new Date(booking.reorderAvailableUntil).getTime() - now.getTime()) / 60000);
      const hrs = Math.floor(mins / 60);
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[11px] font-bold">
          <RefreshCw className="w-3 h-3" />
          <span>Reorder ({hrs > 0 ? `${hrs}h` : `${mins}m`} left)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-700 text-slate-500 text-[11px] font-bold">
        <span>Reorder Expired</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (cancelledBookings.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
        <XCircle className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No Cancelled Bookings</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You have no cancelled bookings. Cancelled bookings appear here with refund and reorder options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cancelledBookings.map((booking) => {
        const service = booking.serviceId || {};
        const vendor = booking.vendorId || {};
        const now = new Date();
        const isReorderAvailable = booking.reorderAvailableUntil && now <= new Date(booking.reorderAvailableUntil);

        return (
          <div
            key={booking._id}
            className="glass-card p-5 rounded-2xl border border-red-500/20 hover:border-red-500/30 transition-all space-y-4"
          >
            {/* Top Row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Booking Ref</span>
                <span className="text-sm font-extrabold text-white font-mono">{booking.bookingNumber}</span>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold">
                  <XCircle className="w-3 h-3" />
                  <span>Cancelled</span>
                </span>
                {getRefundStatusBadge(booking)}
                {getReorderStatusBadge(booking)}
              </div>
            </div>

            {/* Service Info */}
            <div className="flex items-center space-x-3">
              {service.images?.[0] ? (
                <img src={service.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-slate-600" />
                </div>
              )}
              <div className="space-y-0.5 flex-1">
                <p className="text-sm font-bold text-white">{service.title || 'Service'}</p>
                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <Building className="w-3 h-3" />
                  <span>{vendor.businessName || 'Vendor'}</span>
                </p>
                {booking.packageSelected && (
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold capitalize">
                    {booking.packageSelected} Package
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-extrabold text-white">
                  ₹{booking.pricing?.totalAmount?.toLocaleString('en-IN') || '0'}
                </p>
                <p className="text-[10px] text-slate-500">Booking Amount</p>
              </div>
            </div>

            {/* Date Info */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  Original Date: {booking.eventDate
                    ? new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>
                  Cancelled: {booking.cancelledAt
                    ? new Date(booking.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </span>
              </span>
            </div>

            {/* Cancellation Reason */}
            {booking.cancellationReason && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400">Reason: </span>
                <span className="text-slate-300 italic">"{booking.cancellationReason}"</span>
              </div>
            )}

            {/* Refund Notice */}
            {booking.refundStatus === 'refund_pending' && (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-amber-400/80">
                  Refund of <strong>₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</strong> is being processed and will be credited within 5-7 business days.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
              {booking.paymentStatus === 'paid' && (
                <button
                  onClick={() => setInvoiceBookingId(booking._id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Invoice</span>
                </button>
              )}
              {isReorderAvailable && (
                <button
                  onClick={() => setReorderBookingId(booking._id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Modals */}
      <InvoiceModal
        bookingId={invoiceBookingId}
        isOpen={Boolean(invoiceBookingId)}
        onClose={() => setInvoiceBookingId(null)}
      />
      <ReorderModal
        bookingId={reorderBookingId}
        isOpen={Boolean(reorderBookingId)}
        onClose={() => setReorderBookingId(null)}
      />
    </div>
  );
};

export default CancelledBookingsTab;
