import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Clock, BookmarkCheck, Flag, CalendarCheck, Info, Sparkles } from 'lucide-react';
import useBooking from '../hooks/useBooking';
import BookingCard from '../components/booking/BookingCard';

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { customerBookings, fetchCustomerBookings, loading } = useBooking();

  useEffect(() => {
    fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  // Calculate stats directly from actual database results
  const totalBookings = customerBookings.length;
  const pendingBookings = customerBookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = customerBookings.filter((b) => b.status === 'confirmed').length;
  const completedBookings = customerBookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Customer Portal</h1>
            <p className="text-xs text-slate-400">Overview of service reservations and booking statuses</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-600/20"
        >
          Book New Service
        </button>
      </div>

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
            <span>Completed</span>
            <Flag className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{completedBookings}</p>
          <p className="text-[11px] text-slate-500">Fulfilled Services</p>
        </div>
      </div>

      {/* Bookings List Section */}
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
