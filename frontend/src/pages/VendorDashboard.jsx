import React, { useEffect, useState, useCallback } from 'react';
import {
  Store,
  Calendar,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Edit3,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  ShieldCheck,
  Building,
  Layers,
  Lock,
  ExternalLink,
  Package as PackageIcon,
  Power,
  Eye,
} from 'lucide-react';
import useVendor from '../hooks/useVendor';
import useService from '../hooks/useService';
import useBooking from '../hooks/useBooking';
import useReview from '../hooks/useReview';
import BookingCard from '../components/booking/BookingCard';
import ReviewCard from '../components/review/ReviewCard';
import ReviewSummary from '../components/review/ReviewSummary';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserRole } from '../app/slices/authSlice';
import VendorRegistrationModal from '../components/vendor/VendorRegistrationModal';
import ServiceFormModal from '../components/service/ServiceFormModal';

export const VendorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    dashboardStats,
    getDashboardStats,
    currentVendor,
    updateVendorProfile,
    setVendorAvailability,
    setCancellationPolicy,
    submitDocuments,
    loading,
    error,
  } = useVendor();

  const { myServices, getVendorServices, changeServiceStatus, removeService } = useService();
  const {
    vendorBookings,
    vendorRequests,
    fetchVendorBookings,
    fetchVendorRequests,
    confirmBooking,
    startBooking,
    completeBooking,
    loading: bookingLoading,
  } = useBooking();

  const {
    getVendorReviews,
    reviews: vendorReceivedReviews,
    ratingSummary: vendorRatingSummary,
    loading: reviewsLoading,
  } = useReview();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Local state for profile editing
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    description: '',
    subCategory: '',
    servicesOffered: '',
    basePrice: 0,
    priceUnit: 'per_event',
    city: '',
    state: '',
    pincode: '',
    portfolioUrls: '',
  });

  // Local state for availability
  const [availabilityList, setAvailabilityList] = useState([]);
  const [newAvailDate, setNewAvailDate] = useState('');
  const [newAvailSlots, setNewAvailSlots] = useState('09:00-12:00, 14:00-18:00');

  // Local state for cancellation policy
  const [policyType, setPolicyType] = useState('flexible');
  const [policyRules, setPolicyRules] = useState([
    { hoursBeforeEvent: 72, refundPercentage: 100 },
    { hoursBeforeEvent: 24, refundPercentage: 50 },
    { hoursBeforeEvent: 0, refundPercentage: 0 },
  ]);

  // Local state for verification documents
  const [documentUrls, setDocumentUrls] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchVendorData = useCallback(() => {
    getDashboardStats().catch(() => {});
    getVendorServices().catch(() => {});
    fetchVendorRequests().catch(() => {});
    fetchVendorBookings().catch(() => {});
  }, [getDashboardStats, getVendorServices, fetchVendorRequests, fetchVendorBookings]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  useEffect(() => {
    const vId = dashboardStats?.vendorId || currentVendor?._id;
    if (vId && activeTab === 'reviews') {
      getVendorReviews({ vendorId: vId });
    }
  }, [activeTab, dashboardStats, currentVendor, getVendorReviews]);

  const handleVendorConfirmBooking = async (id) => {
    setActionLoadingId(id);
    const res = await confirmBooking(id);
    setActionLoadingId(null);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Booking request confirmed successfully!' });
      fetchVendorRequests();
      fetchVendorBookings();
      getDashboardStats();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to confirm booking.' });
    }
  };

  const handleVendorRejectBooking = async (id) => {
    setActionLoadingId(id);
    const res = await rejectBooking(id, 'Vendor unable to fulfill request at this time');
    setActionLoadingId(null);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Booking request rejected.' });
      fetchVendorRequests();
      fetchVendorBookings();
      getDashboardStats();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to reject booking.' });
    }
  };

  const handleVendorStartBooking = async (id) => {
    setActionLoadingId(id);
    const res = await startBooking(id);
    setActionLoadingId(null);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Service marked as started!' });
      fetchVendorBookings();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to start service.' });
    }
  };

  const handleVendorCompleteBooking = async (id) => {
    setActionLoadingId(id);
    const res = await completeBooking(id);
    setActionLoadingId(null);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Booking completed and total bookings count updated!' });
      fetchVendorBookings();
      getDashboardStats();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to complete booking.' });
    }
  };

  useEffect(() => {
    if (dashboardStats?.vendorId || currentVendor) {
      const v = currentVendor || {};
      setProfileForm({
        businessName: v.businessName || dashboardStats?.businessName || '',
        description: v.description || '',
        subCategory: v.subCategory || '',
        servicesOffered: v.servicesOffered ? v.servicesOffered.join(', ') : '',
        basePrice: v.pricing?.basePrice || 0,
        priceUnit: v.pricing?.priceUnit || 'per_event',
        city: v.location?.city || '',
        state: v.location?.state || '',
        pincode: v.location?.pincode || '',
        portfolioUrls: v.portfolio ? v.portfolio.join('\n') : '',
      });

      if (v.availability) setAvailabilityList(v.availability);
      if (v.cancellationPolicy) {
        setPolicyType(v.cancellationPolicy.type || 'flexible');
        if (v.cancellationPolicy.rules) setPolicyRules(v.cancellationPolicy.rules);
      }
      if (v.documents) setDocumentUrls(v.documents.join('\n'));
    }
  }, [dashboardStats, currentVendor]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const vendorId = dashboardStats?.vendorId || currentVendor?._id;
    if (!vendorId) return;

    const payload = {
      businessName: profileForm.businessName,
      description: profileForm.description,
      subCategory: profileForm.subCategory,
      servicesOffered: profileForm.servicesOffered
        ? profileForm.servicesOffered.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      pricing: {
        basePrice: Number(profileForm.basePrice),
        priceUnit: profileForm.priceUnit,
        currency: 'INR',
      },
      location: {
        city: profileForm.city,
        state: profileForm.state,
        pincode: profileForm.pincode,
      },
      portfolio: profileForm.portfolioUrls
        ? profileForm.portfolioUrls.split('\n').map((u) => u.trim()).filter(Boolean)
        : [],
    };

    try {
      await updateVendorProfile(vendorId, payload);
      setStatusMsg({ type: 'success', text: 'Business profile updated successfully!' });
      getDashboardStats();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Failed to update profile.' });
    }
  };

  // Handle Availability Add
  const handleAddAvailability = (e) => {
    e.preventDefault();
    if (!newAvailDate) return;

    const slots = newAvailSlots.split(',').map((s) => s.trim()).filter(Boolean);
    const existingIdx = availabilityList.findIndex((item) => item.date === newAvailDate);

    let updated = [...availabilityList];
    if (existingIdx >= 0) {
      updated[existingIdx] = { date: newAvailDate, isAvailable: true, slots };
    } else {
      updated.push({ date: newAvailDate, isAvailable: true, slots });
    }

    setAvailabilityList(updated);
    setNewAvailDate('');
  };

  const handleRemoveAvailability = (dateStr) => {
    setAvailabilityList(availabilityList.filter((item) => item.date !== dateStr));
  };

  const handleSaveAvailability = async () => {
    setStatusMsg({ type: '', text: '' });
    const vendorId = dashboardStats?.vendorId || currentVendor?._id;
    if (!vendorId) return;

    try {
      await setVendorAvailability(vendorId, availabilityList);
      setStatusMsg({ type: 'success', text: 'Availability schedule saved successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Failed to update availability schedule.' });
    }
  };

  // Handle Cancellation Policy Update
  const handleSavePolicy = async () => {
    setStatusMsg({ type: '', text: '' });
    const vendorId = dashboardStats?.vendorId || currentVendor?._id;
    if (!vendorId) return;

    try {
      await setCancellationPolicy(vendorId, { type: policyType, rules: policyRules });
      setStatusMsg({ type: 'success', text: 'Cancellation policy updated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Failed to update cancellation policy.' });
    }
  };

  // Handle Document Upload
  const handleUploadDocs = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const urls = documentUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      return setStatusMsg({ type: 'error', text: 'Please enter at least one document URL.' });
    }

    try {
      await submitDocuments(urls);
      setStatusMsg({
        type: 'success',
        text: 'Document URLs submitted successfully! Admin review in progress.',
      });
      getDashboardStats();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Failed to submit document URLs.' });
    }
  };

  // Service Management Actions
  const handleOpenAddService = () => {
    setServiceToEdit(null);
    setIsServiceFormOpen(true);
  };

  const handleOpenEditService = (service) => {
    setServiceToEdit(service);
    setIsServiceFormOpen(true);
  };

  const handleToggleServiceStatus = async (service) => {
    try {
      await changeServiceStatus(service._id, !service.isActive);
      setStatusMsg({
        type: 'success',
        text: `Service "${service.title}" ${!service.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
      getVendorServices();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Failed to change service status.' });
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) return;
    try {
      await removeService(serviceId);
      setStatusMsg({ type: 'success', text: 'Service listing deleted successfully.' });
      getVendorServices();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err || 'Failed to delete service listing.' });
    }
  };

  const vendorServices = myServices || [];
  const totalServices = vendorServices.length;
  const activeServices = vendorServices.filter((s) => s.isActive).length;
  const inactiveServices = vendorServices.filter((s) => !s.isActive).length;

  const hasVendorProfile = Boolean(dashboardStats?.vendorId || currentVendor?._id);

  // If loading initially with no profile data
  if (loading && !hasVendorProfile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // If vendor profile does not exist yet
  if (!hasVendorProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 text-center space-y-6">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-16 h-16 mx-auto flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">No Vendor Profile Found</h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              You do not have an active vendor profile associated with your account. Register your business profile to begin managing service listings and availability.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/25"
          >
            Create Vendor Profile Now
          </button>
        </div>

        <VendorRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={async () => {
            dispatch(updateUserRole('vendor'));
            setStatusMsg({
              type: 'success',
              text: 'Vendor profile created successfully. Awaiting admin verification.',
            });
            try {
              await getDashboardStats();
            } catch (e) {}
          }}
        />
      </div>
    );
  }

  const isVerified = dashboardStats?.isVerified || currentVendor?.isVerified;
  const vendorId = dashboardStats?.vendorId || currentVendor?._id;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {dashboardStats?.businessName || currentVendor?.businessName || 'Vendor Command Center'}
              </h1>
              {isVerified ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Verification Pending</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage your service listings, packages, profile, and verification status.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenAddService}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service</span>
          </button>

          {vendorId && (
            <button
              onClick={() => navigate(`/vendors/${vendorId}`)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors shrink-0"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Services</span>
            <PackageIcon className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{totalServices}</p>
          <p className="text-[11px] text-slate-500">{activeServices} Active / {inactiveServices} Inactive</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{dashboardStats?.totalBookings || 0}</p>
          <p className="text-[11px] text-slate-500">Available after Booking Module</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Average Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {(dashboardStats?.averageRating || 0).toFixed(1)}
          </p>
          <p className="text-[11px] text-slate-500">Based on customer feedback</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            ₹{(dashboardStats?.monthlyRevenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">Available after Payment Module</p>
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'requests', label: `Pending Requests (${vendorRequests.length})`, icon: Clock },
          { id: 'bookings', label: `All Bookings (${vendorBookings.length})`, icon: Calendar },
          { id: 'reviews', label: 'Reviews Received', icon: Star },
          { id: 'services', label: 'My Services', icon: PackageIcon },
          { id: 'profile', label: 'Business Profile', icon: Building },
          { id: 'availability', label: 'Availability', icon: Calendar },
          { id: 'cancellation', label: 'Cancellation Policy', icon: ShieldCheck },
          { id: 'documents', label: 'Verification Docs', icon: FileText },
          { id: 'placeholders', label: 'Future Modules', icon: Layers },
        ].map((tab) => {
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

      {/* TAB: PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Pending Booking Requests ({vendorRequests.length})</span>
            </h2>
          </div>

          {vendorRequests.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending Requests</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You currently have no pending reservation requests awaiting your confirmation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorRequests.map((request) => (
                <BookingCard
                  key={request._id}
                  booking={request}
                  isVendorView={true}
                  onConfirm={handleVendorConfirmBooking}
                  onReject={handleVendorRejectBooking}
                  onViewDetails={(b) => navigate(`/booking/${b._id}`)}
                  loadingActionId={actionLoadingId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>All Service Bookings ({vendorBookings.length})</span>
            </h2>
          </div>

          {vendorBookings.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Bookings Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active or historical bookings found for your vendor account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  isVendorView={true}
                  onConfirm={handleVendorConfirmBooking}
                  onStart={handleVendorStartBooking}
                  onComplete={handleVendorCompleteBooking}
                  onViewDetails={(b) => navigate(`/booking/${b._id}`)}
                  loadingActionId={actionLoadingId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: REVIEWS RECEIVED */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <ReviewSummary summary={vendorRatingSummary || currentVendor?.ratings} />

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span>Customer Reviews Received ({vendorReceivedReviews.length})</span>
            </h3>

            {reviewsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
              </div>
            ) : vendorReceivedReviews.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
                <Star className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Reviews Received Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Reviews from completed bookings will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorReceivedReviews.map((rev) => (
                  <ReviewCard
                    key={rev._id}
                    review={rev}
                    isVendorView={true}
                    onReplySubmitted={() => {
                      const vId = dashboardStats?.vendorId || currentVendor?._id;
                      if (vId) getVendorReviews({ vendorId: vId });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 0: MY SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Total Listings</span>
                <span className="text-2xl font-bold text-white">{totalServices}</span>
              </div>
              <PackageIcon className="w-6 h-6 text-brand-400" />
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 block font-medium">Active Listings</span>
                <span className="text-2xl font-bold text-white">{activeServices}</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Deactivated Listings</span>
                <span className="text-2xl font-bold text-white">{inactiveServices}</span>
              </div>
              <Power className="w-6 h-6 text-slate-500" />
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <PackageIcon className="w-5 h-5 text-brand-400" />
                <span>Service Catalog ({totalServices})</span>
              </h2>
              <button
                onClick={handleOpenAddService}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Service</span>
              </button>
            </div>

            {vendorServices.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <PackageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Services Created Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create your service listings so customers can search and discover your offerings.
                </p>
                <button
                  onClick={handleOpenAddService}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500"
                >
                  Create Service Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Service</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Base Price</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vendorServices.map((service) => (
                      <tr key={service._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                service.images?.[0] ||
                                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=150&q=80'
                              }
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white hover:text-brand-400 transition-colors line-clamp-1">
                                {service.title}
                              </p>
                              {service.subCategory && (
                                <p className="text-[10px] text-slate-400">{service.subCategory}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 uppercase text-[11px] font-semibold text-brand-300">
                          {service.category}
                        </td>
                        <td className="p-4 font-bold text-white">
                          ₹{service.price ? service.price.toLocaleString('en-IN') : '0'}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">
                            / {service.priceUnit ? service.priceUnit.replace('_', ' ') : 'event'}
                          </span>
                        </td>
                        <td className="p-4">{service.city || 'N/A'}</td>
                        <td className="p-4">
                          {service.isActive ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              <Power className="w-3 h-3" />
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/services/${service._id}`)}
                              title="View Details"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditService(service)}
                              title="Edit Service"
                              className="p-1.5 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleServiceStatus(service)}
                              title={service.isActive ? 'Deactivate Service' : 'Activate Service'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                service.isActive
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service._id)}
                              title="Delete Service"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: Business Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-brand-400" />
            <span>Edit Business Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name</label>
              <input
                type="text"
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory</label>
              <input
                type="text"
                value={profileForm.subCategory}
                onChange={(e) => setProfileForm({ ...profileForm, subCategory: e.target.value })}
                placeholder="e.g. Luxury Wedding Decorator"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={4}
              value={profileForm.description}
              onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Services Offered (comma separated)</label>
            <input
              type="text"
              value={profileForm.servicesOffered}
              onChange={(e) => setProfileForm({ ...profileForm, servicesOffered: e.target.value })}
              placeholder="Catering, Decor, Lighting"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price (₹)</label>
              <input
                type="number"
                value={profileForm.basePrice}
                onChange={(e) => setProfileForm({ ...profileForm, basePrice: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price Unit</label>
              <input
                type="text"
                value={profileForm.priceUnit}
                onChange={(e) => setProfileForm({ ...profileForm, priceUnit: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
              <input
                type="text"
                value={profileForm.state}
                onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Portfolio Image URLs (one per line)
            </label>
            <textarea
              rows={3}
              value={profileForm.portfolioUrls}
              onChange={(e) => setProfileForm({ ...profileForm, portfolioUrls: e.target.value })}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Availability */}
      {activeTab === 'availability' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Manage Availability Schedule</span>
          </h2>

          <form onSubmit={handleAddAvailability} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={newAvailDate}
                onChange={(e) => setNewAvailDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Time Slots (comma separated)</label>
              <input
                type="text"
                value={newAvailSlots}
                onChange={(e) => setNewAvailSlots(e.target.value)}
                placeholder="09:00-12:00, 14:00-18:00"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Date</span>
            </button>
          </form>

          {/* List of Configured Dates */}
          <div className="space-y-3">
            {availabilityList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                <div>
                  <span className="font-mono text-sm text-white font-bold">{item.date}</span>
                  <p className="text-xs text-slate-400">Slots: {item.slots?.join(', ') || 'Full Day'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAvailability(item.date)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveAvailability}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-all"
            >
              Save Schedule Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Cancellation Policy */}
      {activeTab === 'cancellation' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Configure Cancellation Policy</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Policy Type</label>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="w-full md:w-64 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refund Tier Rules</h3>
              {policyRules.map((rule, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <label className="block text-[10px] text-slate-400">Hours Before Event</label>
                    <input
                      type="number"
                      value={rule.hoursBeforeEvent}
                      onChange={(e) => {
                        const newRules = [...policyRules];
                        newRules[idx].hoursBeforeEvent = Number(e.target.value);
                        setPolicyRules(newRules);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Refund Percentage (%)</label>
                    <input
                      type="number"
                      value={rule.refundPercentage}
                      onChange={(e) => {
                        const newRules = [...policyRules];
                        newRules[idx].refundPercentage = Number(e.target.value);
                        setPolicyRules(newRules);
                      }}
                      min="0"
                      max="100"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePolicy}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all"
            >
              Save Cancellation Policy
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Verification Documents */}
      {activeTab === 'documents' && (
        <form onSubmit={handleUploadDocs} className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-purple-400" />
            <span>Upload & Submit Document URLs</span>
          </h2>

          <p className="text-xs text-slate-400">
            Submit URLs to official verification documentation (Business License, Tax ID, Government ID) for admin review.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Document URLs (one URL per line)
            </label>
            <textarea
              rows={4}
              value={documentUrls}
              onChange={(e) => setDocumentUrls(e.target.value)}
              placeholder="https://example.com/license.pdf&#10;https://example.com/gst-certificate.pdf"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all"
            >
              Submit Documents for Admin Verification
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: Placeholders for Future Modules */}
      {activeTab === 'placeholders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Booking Management', module: 'Module 7', desc: 'Calendar sync, instant booking confirmations, and client requests.' },
            { title: 'Earnings & Settlements', module: 'Module 8', desc: 'Payment Gateway integration, payout histories, and tax invoices.' },
            { title: 'Customer Reviews', module: 'Module 9', desc: 'Verified customer ratings, feedback responses, and review analytics.' },
            { title: 'AI Planning Engine', module: 'Module 10', desc: 'Automated package recommendations and multi-vendor aggregated quotes.' },
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 opacity-80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {item.module}
                </span>
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
              <div className="text-[11px] font-medium text-brand-400 pt-2 border-t border-slate-800/80">
                Available after Booking/Payment modules
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <VendorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={async () => {
          dispatch(updateUserRole('vendor'));
          setStatusMsg({
            type: 'success',
            text: 'Vendor profile created successfully. Awaiting admin verification.',
          });
          try {
            await getDashboardStats();
          } catch (e) {}
        }}
      />
      <ServiceFormModal
        isOpen={isServiceFormOpen}
        onClose={() => setIsServiceFormOpen(false)}
        initialData={serviceToEdit}
        onSuccess={() => fetchVendorData()}
      />
    </div>
  );
};

export default VendorDashboard;
