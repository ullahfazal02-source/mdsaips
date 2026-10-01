import React, { useEffect, useState } from 'react';
import { X, RefreshCw, Clock, CheckCircle, AlertTriangle, ArrowRight, Tag, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../../hooks/useBooking';

/**
 * ReorderModal - Shows fresh reorder data for a cancelled booking and allows re-booking
 */
const ReorderModal = ({ bookingId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { getReorderData } = useBooking();
  const [reorderInfo, setReorderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && bookingId) {
      setLoading(true);
      setError('');
      getReorderData(bookingId)
        .then((res) => {
          if (res.success) {
            setReorderInfo(res.data);
          } else {
            setError(res.error || 'Unable to fetch reorder data.');
          }
        })
        .catch(() => setError('Unable to fetch reorder data.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, bookingId]);

  if (!isOpen) return null;

  const data = reorderInfo?.data;
  const isExpired = reorderInfo?.isExpired || reorderInfo?.reorderStatus === 'reorder_expired';
  const isAvailable = reorderInfo?.isAvailable;

  const handleReorder = () => {
    if (!data) return;
    // Navigate to booking page with pre-filled service data
    navigate(`/services/${data.serviceId}?reorder=true&oldBookingId=${bookingId}&package=${data.packageSelected || ''}`);
    onClose();
  };

  const handleFindSimilar = () => {
    const q = reorderInfo?.findSimilarQuery;
    if (q) {
      navigate(`/services?category=${q.category || ''}&city=${q.city || ''}`);
    } else {
      navigate('/services');
    }
    onClose();
  };

  const getTimeLeft = () => {
    if (!data?.reorderAvailableUntil) return null;
    const diff = new Date(data.reorderAvailableUntil).getTime() - Date.now();
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m remaining`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Reorder Service</h2>
              <p className="text-xs text-slate-400">Review availability and re-book this service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-500 border-t-transparent" />
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center space-y-3">
              <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
              <p>{error}</p>
              <button
                onClick={handleFindSimilar}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Browse Similar Services
              </button>
            </div>
          )}

          {!loading && !error && reorderInfo && (
            <>
              {/* Expired State */}
              {isExpired && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-base font-bold text-amber-300">Reorder Window Expired</p>
                  <p className="text-xs text-slate-400">The 24-hour reorder window for this cancellation has passed.</p>
                  <button
                    onClick={handleFindSimilar}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <span>Browse Similar Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Unavailable State */}
              {!isExpired && isAvailable === false && (
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                  <p className="text-base font-bold text-red-300">Service Unavailable</p>
                  <p className="text-xs text-slate-400">{reorderInfo.message}</p>
                  <button
                    onClick={handleFindSimilar}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <span>Find Similar Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Available State */}
              {!isExpired && isAvailable && data && (
                <div className="space-y-4">
                  {/* Countdown Timer */}
                  {getTimeLeft() && (
                    <div className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Reorder offer expires in: {getTimeLeft()}</span>
                    </div>
                  )}

                  {/* Service Info */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{data.serviceTitle}</p>
                        <p className="text-xs text-slate-400 capitalize">{data.category} / {data.subCategory}</p>
                      </div>
                      <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Building className="w-3.5 h-3.5 text-brand-400" />
                      <span>{data.vendorName}</span>
                    </div>

                    {data.packageSelected && (
                      <div className="flex items-center space-x-1.5 text-xs">
                        <Tag className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-slate-400">Package:</span>
                        <span className="text-white font-semibold capitalize">{data.packageSelected}</span>
                      </div>
                    )}
                  </div>

                  {/* Current Pricing */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Current Pricing (Live)</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Base Amount</span>
                      <span className="text-white font-semibold">₹{data.currentPricing?.baseAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">GST (18%)</span>
                      <span className="text-white font-semibold">₹{data.currentPricing?.taxes?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base border-t border-slate-800 pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-brand-400">₹{data.currentPricing?.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleFindSimilar}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      Find Other Vendors
                    </button>
                    <button
                      onClick={handleReorder}
                      className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold transition-all shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reorder Now</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReorderModal;
