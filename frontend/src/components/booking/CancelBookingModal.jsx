import React, { useState } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';

/**
 * CancelBookingModal - Collects cancellation reason and confirms customer cancellation
 */
const CancelBookingModal = ({ booking, isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const REASONS = [
    'Change of plans',
    'Found a better vendor',
    'Budget constraints',
    'Date conflict',
    'Service no longer needed',
    'Other',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a cancellation reason.');
      return;
    }
    setError('');
    onConfirm(booking._id, reason.trim());
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-950 border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Cancel Booking</h2>
              <p className="text-xs text-slate-400 font-mono">{booking.bookingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Warning Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-300 space-y-1">
              <p className="font-bold">Important Notice</p>
              <ul className="list-disc ml-3 space-y-0.5 text-amber-400/80">
                <li>This action cannot be undone.</li>
                <li>A refund will be initiated if payment was made.</li>
                <li>You can reorder within 24 hours of cancellation.</li>
              </ul>
            </div>
          </div>

          {/* Quick Reason Pills */}
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2">Select a reason or type below</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    reason === r
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Free-text Reason */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Cancellation Reason *</label>
            <textarea
              id="cancellation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your reason for cancellation..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          {/* Service Summary */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Booking Amount:</span>
            <span className="text-white font-extrabold">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN') || '0'}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-md shadow-red-600/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelBookingModal;
