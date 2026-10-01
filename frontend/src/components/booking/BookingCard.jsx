import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Check,
  Play,
  CheckCircle,
  Eye,
  Tag,
  Star,
  Sparkles,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import BookingStatus from './BookingStatus';
import PaymentStatus from '../payment/PaymentStatus';
import PaymentButton from '../payment/PaymentButton';

/**
 * BookingCard Component for Customer & Vendor Dashboards
 * Features 1-Hour Response Countdown, Expired Booking CTA, and Vendor Action Triggers
 */
export const BookingCard = ({
  booking,
  isVendorView = false,
  onConfirm,
  onReject,
  onStart,
  onComplete,
  onViewDetails,
  onOpenReviewModal,
  onPaymentSuccess,
  onOpenChat,
  onCancel,
  onDownloadInvoice,
  loadingActionId,
}) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const {
    _id,
    bookingNumber,
    serviceId,
    vendorId,
    customerId,
    eventDate,
    eventDetails,
    packageSelected,
    pricing,
    status,
    responseDeadline,
    paymentStatus = 'unpaid',
    isReviewed = false,
  } = booking;

  const service = serviceId || {};
  const vendor = vendorId || {};
  const customer = customerId || {};

  const isLoading = loadingActionId === _id;

  // Calculate 1-hour vendor response deadline countdown
  let remainingMinutes = null;
  if (status === 'pending' && responseDeadline) {
    const diffMs = new Date(responseDeadline).getTime() - Date.now();
    remainingMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }

  const handleFindAnotherVendor = () => {
    const categoryQuery = service.category ? `?category=${service.category}` : '';
    navigate(`/services${categoryQuery}`);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 space-y-5">
      {/* Top Bar: Booking Number, Booking Status, Response Countdown & Payment Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Booking Reference</span>
          <span className="text-sm font-extrabold text-white font-mono">{bookingNumber}</span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* Response Countdown Badge for Pending Bookings */}
          {status === 'pending' && remainingMinutes !== null && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Respond within {remainingMinutes} min</span>
            </span>
          )}

          <BookingStatus status={status} showTimeline={false} />
          <PaymentStatus status={paymentStatus} />
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service & Image Info */}
        <div className="flex items-start space-x-4 md:col-span-2">
          {service.images && service.images[0] ? (
            <img
              src={service.images[0]}
              alt={service.title || 'Service'}
              className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500 font-bold text-xs">
              NO IMG
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white hover:text-brand-400 transition-colors">
              {service.title || 'Service Listing'}
            </h3>

            {isVendorView ? (
              <p className="text-xs text-slate-400">
                Customer: <strong className="text-slate-200">{customer.name || 'Customer'}</strong> ({customer.phone || customer.email || 'N/A'})
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Vendor: <strong className="text-slate-200">{vendor.businessName || 'Service Vendor'}</strong>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </span>

              {/* Event Domain */}
              {eventDetails?.guestCount && (
                <span className="inline-flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  <span>{eventDetails.guestCount} Guests</span>
                </span>
              )}

              {/* Construction Domain */}
              {eventDetails?.projectType && (
                <span className="inline-flex items-center space-x-1 font-semibold text-amber-400">
                  <span>{eventDetails.projectType}</span>
                  {eventDetails.area > 0 && <span>({eventDetails.area} {eventDetails.unit || 'sqft'})</span>}
                </span>
              )}

              {/* Home Domain */}
              {eventDetails?.serviceType && (
                <span className="inline-flex items-center space-x-1 font-semibold text-emerald-400">
                  <span>{eventDetails.serviceType}</span>
                </span>
              )}

              {/* Accommodation Domain */}
              {eventDetails?.rooms && (
                <span className="inline-flex items-center space-x-1 font-semibold text-purple-400">
                  <span>{eventDetails.rooms} Room(s) / {eventDetails.guests || 1} Guest(s)</span>
                </span>
              )}

              {packageSelected && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold capitalize">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>{packageSelected}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Payment Box */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-2 shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Amount</span>
            <p className="text-xl font-extrabold text-white">
              ₹{pricing?.totalAmount ? pricing.totalAmount.toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-[10px] text-slate-500">Includes 18% GST (₹{pricing?.taxes?.toLocaleString('en-IN') || 0})</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400">Payment:</span>
            <PaymentStatus status={paymentStatus} />
          </div>
        </div>
      </div>

      {/* Part 11: Expired / Rejected Customer Notice Banner */}
      {!isVendorView && (status === 'expired' || status === 'rejected') && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                {status === 'expired' ? 'Vendor did not respond within the required 1-hour time window.' : 'Vendor rejected this booking request.'}
              </p>
              <p className="text-slate-400 text-[11px]">You can easily select and book another verified vendor for your project.</p>
            </div>
          </div>

          <button
            onClick={handleFindAnotherVendor}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 shrink-0"
          >
            <span>Find Another Vendor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails && onViewDetails(booking)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>

          {onOpenChat && (
            <button
              onClick={() => onOpenChat(booking)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
            >
              <span>💬</span>
              <span>Chat {isVendorView ? 'Customer' : 'Vendor'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* Customer Pay Now Button */}
          {!isVendorView && paymentStatus !== 'paid' && status === 'confirmed' && (
            <PaymentButton booking={booking} onPaymentSuccess={onPaymentSuccess} />
          )}

          {/* Customer Review Button */}
          {!isVendorView && status === 'completed' && (
            isReviewed ? (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Review Submitted</span>
              </span>
            ) : (
              <button
                onClick={() => onOpenReviewModal && onOpenReviewModal(booking)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>Leave Review</span>
              </button>
            )
          )}

          {/* Customer Cancel Button */}
          {!isVendorView && onCancel && ['pending', 'confirmed'].includes(status) && (
            <button
              onClick={() => onCancel(booking)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          {/* Customer Invoice Button */}
          {!isVendorView && onDownloadInvoice && paymentStatus === 'paid' && (
            <button
              onClick={() => onDownloadInvoice(booking)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>
          )}

          {/* Vendor Action Transitions */}
          {isVendorView && (
            <>
              {status === 'pending' && (
                <div className="flex items-center space-x-2">
                  {onConfirm && (
                    <button
                      disabled={isLoading}
                      onClick={() => onConfirm(_id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  )}

                  {onReject && (
                    <button
                      disabled={isLoading}
                      onClick={() => onReject(_id)}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              )}

              {status === 'confirmed' && onStart && (
                <button
                  disabled={isLoading}
                  onClick={() => onStart(_id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Service</span>
                </button>
              )}

              {status === 'in_progress' && onComplete && (
                <button
                  disabled={isLoading}
                  onClick={() => onComplete(_id)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-brand-600/20"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
