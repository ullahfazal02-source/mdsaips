import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Clock,
  BookmarkCheck,
  Flag,
  CalendarCheck,
  Info,
  Sparkles,
  Heart,
  ShoppingCart,
  ArrowRight,
  X,
  XCircle,
  Star,
  FileText,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import useBooking from '../hooks/useBooking';
import useWishlist from '../hooks/useWishlist';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import BookingCard from '../components/booking/BookingCard';
import ReviewForm from '../components/review/ReviewForm';
import ChatModal from '../components/vendor/ChatModal';
import CancelBookingModal from '../components/booking/CancelBookingModal';
import InvoiceModal from '../components/booking/InvoiceModal';
import CancelledBookingsTab from '../components/booking/CancelledBookingsTab';
import LoyaltyPointsPanel from '../components/booking/LoyaltyPointsPanel';

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const {
    customerBookings,
    cancelledBookings,
    fetchCustomerBookings,
    fetchCancelledBookings,
    cancelBooking,
    loading,
  } = useBooking();
  const { wishlist, count: wishlistCount, refresh: refreshWishlist } = useWishlist();
  const { cartItems, itemCount: cartCount, totalAmount: cartTotal } = useCart();

  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cancelBookingData, setCancelBookingData] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [invoiceBookingId, setInvoiceBookingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCustomerBookings();
    fetchCancelledBookings();
    refreshWishlist().catch(() => {});
    fetchProfile().catch(() => {});
  }, []);

  const handleRefresh = () => {
    fetchCustomerBookings();
    fetchCancelledBookings();
    fetchProfile().catch(() => {});
  };

  const handleCancelBooking = async (id, reason) => {
    setCancelLoading(true);
    const res = await cancelBooking(id, reason);
    setCancelLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Booking cancelled successfully. Refund will be processed if applicable.' });
      setCancelBookingData(null);
      handleRefresh();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to cancel booking.' });
      setCancelBookingData(null);
    }
  };

  // Stats
  const totalBookings = customerBookings.length;
  const pendingBookings = customerBookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = customerBookings.filter((b) => b.status === 'confirmed').length;
  const completedBookings = customerBookings.filter((b) => b.status === 'completed').length;

  const latestWishlistItems = wishlist.slice(0, 3);

  const loyaltyPoints = user?.loyaltyPoints?.current || 0;

  const TABS = [
    { id: 'bookings', label: `My Bookings (${totalBookings})`, icon: CalendarCheck },
    { id: 'cancelled', label: `Cancelled (${cancelledBookings.length})`, icon: XCircle },
    { id: 'loyalty', label: `Loyalty Points (${loyaltyPoints.toLocaleString()})`, icon: Trophy },
  ];

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Customer Portal</h1>
            <p className="text-xs text-slate-400">
              Overview of service reservations, saved wishlist items, cart bundles, and verified reviews
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-600/20"
        >
          Book New Service
        </button>
      </div>

      {/* Status Message */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg({ type: '', text: '' })}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalBookings}</p>
          <p className="text-[11px] text-slate-500">Service Reservations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{pendingBookings}</p>
          <p className="text-[11px] text-slate-500">Awaiting Confirmation</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Confirmed</span>
            <BookmarkCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-400">{confirmedBookings}</p>
          <p className="text-[11px] text-slate-500">Date Scheduled</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Loyalty Points</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{loyaltyPoints.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">= ₹{Math.floor(loyaltyPoints * 0.5).toLocaleString()} value</p>
        </div>
      </div>

      {/* Module 10: Wishlist & Cart Previews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wishlist Preview Box */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-500/20" />
              <span>Saved Wishlist ({wishlistCount})</span>
            </h3>
            <button
              onClick={() => navigate('/wishlist')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center space-x-1"
            >
              <span>View Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestWishlistItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No saved wishlist items yet.</p>
          ) : (
            <div className="space-y-2">
              {latestWishlistItems.map((item) => {
                const service = item.service || item.serviceId || {};
                return (
                  <div
                    key={item._id || service._id}
                    onClick={() => navigate('/wishlist')}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      {service.images && service.images[0] && (
                        <img src={service.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <span className="font-semibold text-white line-clamp-1">{service.title || 'Saved Service'}</span>
                    </div>
                    <span className="font-bold text-emerald-400 shrink-0">₹{service.price?.toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Preview Box */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-brand-400" />
              <span>Booking Cart ({cartCount})</span>
            </h3>
            <button
              onClick={() => navigate('/cart')}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 py-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Cart Total Subtotal</span>
              <span className="text-base font-extrabold text-brand-400">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            {cartItems.length > 0 ? (
              <button
                onClick={() => navigate('/cart/checkout')}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-600/20 transition-all"
              >
                Proceed to Multi-Service Checkout
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">Your booking cart is currently empty.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>My Service Reservations</span>
            </h2>
            <span className="text-xs text-slate-400">{totalBookings} Total</span>
          </div>

          {loading && customerBookings.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : customerBookings.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
              <Info className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't requested any service reservations. Browse the service marketplace to get started.
                </p>
              </div>
              <button
                onClick={() => navigate('/services')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Explore Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  isVendorView={false}
                  onViewDetails={(b) => navigate(`/booking/${b._id}`)}
                  onOpenReviewModal={(b) => setSelectedBookingForReview(b)}
                  onOpenChat={(b) => {
                    setChatBooking(b);
                    setIsChatOpen(true);
                  }}
                  onCancel={
                    ['pending', 'confirmed'].includes(booking.status)
                      ? (b) => setCancelBookingData(b)
                      : null
                  }
                  onDownloadInvoice={
                    booking.paymentStatus === 'paid'
                      ? (b) => setInvoiceBookingId(b._id)
                      : null
                  }
                  onPaymentSuccess={handleRefresh}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CANCELLED BOOKINGS */}
      {activeTab === 'cancelled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Cancelled Bookings ({cancelledBookings.length})</span>
            </h2>
            <button
              onClick={() => fetchCancelledBookings()}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
          <CancelledBookingsTab cancelledBookings={cancelledBookings} loading={loading} />
        </div>
      )}

      {/* TAB: LOYALTY POINTS */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Loyalty Rewards</span>
            </h2>
          </div>
          <LoyaltyPointsPanel user={user} />
        </div>
      )}

      {/* Review Modal Popup */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setSelectedBookingForReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <ReviewForm
              booking={selectedBookingForReview}
              onReviewSubmitted={() => {
                setSelectedBookingForReview(null);
                handleRefresh();
              }}
            />
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        booking={cancelBookingData}
        isOpen={Boolean(cancelBookingData)}
        onClose={() => setCancelBookingData(null)}
        onConfirm={handleCancelBooking}
        loading={cancelLoading}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        bookingId={invoiceBookingId}
        isOpen={Boolean(invoiceBookingId)}
        onClose={() => setInvoiceBookingId(null)}
      />

      {/* Chat Modal Drawer */}
      <ChatModal
        booking={chatBooking}
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatBooking(null);
        }}
      />
    </div>
  );
};

export default CustomerDashboard;
