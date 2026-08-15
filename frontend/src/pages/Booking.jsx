import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, ArrowLeft, Info, CheckCircle2, Clock } from 'lucide-react';
import useService from '../hooks/useService';
import useBooking from '../hooks/useBooking';
import BookingForm from '../components/booking/BookingForm';
import BookingCard from '../components/booking/BookingCard';
import BookingStatus from '../components/booking/BookingStatus';

export const Booking = () => {
  const { id } = useParams(); // If viewing /booking/:id
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const serviceId = searchParams.get('serviceId');
  const packageParam = searchParams.get('package');

  const { currentService, getServiceById, loading: serviceLoading } = useService();
  const { createBooking, fetchBooking, currentBooking, loading: bookingLoading, error } = useBooking();

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBookingData, setCreatedBookingData] = useState(null);

  // Load Service if creating booking with serviceId
  useEffect(() => {
    if (serviceId && (!currentService || currentService._id !== serviceId)) {
      getServiceById(serviceId);
    }
  }, [serviceId, currentService, getServiceById]);

  // Load Booking if viewing existing booking by ID
  useEffect(() => {
    if (id) {
      fetchBooking(id);
    }
  }, [id, fetchBooking]);

  const handleBookingSubmit = async (payload) => {
    const res = await createBooking(payload);
    if (res.success && res.data) {
      setCreatedBookingData(res.data);
      setBookingSuccess(true);
    }
  };

  // 1. Success Screen after booking creation
  if (bookingSuccess && createdBookingData) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-8 text-center">
        <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-20 h-20 mx-auto flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-white">Booking Request Submitted!</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your reservation request for <strong>{currentService?.title || 'Service'}</strong> has been successfully sent to the vendor.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 max-w-lg mx-auto text-left space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Reference No:</span>
            <span className="font-bold text-white">{createdBookingData.bookingNumber}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Event Date:</span>
            <span className="font-bold text-white">
              {new Date(createdBookingData.eventDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Total Amount:</span>
            <span className="font-extrabold text-emerald-400">
              ₹{createdBookingData.pricing?.totalAmount?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/customer-dashboard')}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30"
          >
            Go to Customer Dashboard
          </button>

          <button
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-800 transition-all"
          >
            Browse More Services
          </button>
        </div>
      </div>
    );
  }

  // 2. View Existing Booking by ID (/booking/:id)
  if (id) {
    if (bookingLoading && !currentBooking) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      );
    }

    if (error || !currentBooking) {
      return (
        <div className="max-w-3xl mx-auto p-8 glass-panel rounded-2xl border border-red-500/20 text-center space-y-4">
          <Info className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'The requested booking details could not be retrieved.'}</p>
          <button
            onClick={() => navigate('/customer-dashboard')}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Booking Reference</span>
              <h1 className="text-2xl font-extrabold text-white font-mono">{currentBooking.bookingNumber}</h1>
            </div>

            <BookingStatus status={currentBooking.status} timeline={currentBooking.timeline} />
          </div>

          <BookingCard booking={currentBooking} onViewDetails={null} />
        </div>
      </div>
    );
  }

  // 3. New Booking Form View (/booking?serviceId=...)
  if (serviceId) {
    if (serviceLoading && !currentService) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      );
    }

    if (!currentService) {
      return (
        <div className="max-w-3xl mx-auto p-8 glass-panel rounded-2xl border border-red-500/20 text-center space-y-4">
          <Info className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Service Not Found</h2>
          <p className="text-sm text-slate-400">The service you are trying to book does not exist or has been removed.</p>
          <Link
            to="/services"
            className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all"
          >
            Explore Services
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Service Details</span>
        </button>

        <BookingForm
          service={currentService}
          initialPackage={packageParam}
          onSubmit={handleBookingSubmit}
          loading={bookingLoading}
          error={error}
        />
      </div>
    );
  }

  // 4. Default Fallback View
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-center py-12">
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 w-16 h-16 mx-auto flex items-center justify-center">
        <CalendarCheck className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">Booking Management & Checkout</h1>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        Please select a service listing from the marketplace to proceed with package selection and event booking.
      </p>
      <Link
        to="/services"
        className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30"
      >
        Browse Service Marketplace
      </Link>
    </div>
  );
};

export default Booking;
