import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  MapPin,
  Users,
  Building,
  Clock,
  Layers,
  Send,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useCart from '../hooks/useCart';
import useBooking from '../hooks/useBooking';

export const CartCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, clear } = useCart();
  const { createBooking } = useBooking();
  const [submitting, setSubmitting] = useState(false);

  // Local state for each service's date & domain inputs
  // Keyed by serviceId
  const [bookingConfigs, setBookingConfigs] = useState(() => {
    const initial = {};
    cartItems.forEach((item) => {
      initial[item.serviceId] = {
        eventDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        eventType: item.category === 'event' ? 'Wedding Reception' : '',
        guestCount: item.category === 'event' ? 100 : undefined,
        venue: 'Grand Hall',
        address: 'Mumbai, Maharashtra',
        projectType: item.category === 'construction' ? 'Residential Renovation' : '',
        area: item.category === 'construction' ? 1200 : undefined,
        serviceType: item.category === 'home' ? 'Full House Deep Cleaning' : '',
        rooms: item.category === 'accommodation' ? 1 : undefined,
        guests: item.category === 'accommodation' ? 2 : undefined,
        specialRequirements: 'Standard booking from multi-service cart bundle',
      };
    });
    return initial;
  });

  const updateConfig = (serviceId, field, value) => {
    setBookingConfigs((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  };

  const handleSubmitAllBookings = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setSubmitting(true);
      toast.loading('Submitting multi-service reservation bundle...', { id: 'cart-checkout' });

      const createdBookings = [];

      // Create individual booking for each cart item
      for (const item of cartItems) {
        const cfg = bookingConfigs[item.serviceId] || {};
        const payload = {
          serviceId: item.serviceId,
          packageSelected: item.selectedPackage || 'basic',
          eventDate: new Date(cfg.eventDate).toISOString(),
          eventDetails: {
            eventType: cfg.eventType || 'Event Reservation',
            guestCount: Number(cfg.guestCount) || 1,
            venue: cfg.venue || 'Venue',
            address: cfg.address || 'Address Location',
            projectType: cfg.projectType,
            area: Number(cfg.area) || undefined,
            serviceType: cfg.serviceType,
            rooms: Number(cfg.rooms) || undefined,
            guests: Number(cfg.guests) || undefined,
            specialRequirements: cfg.specialRequirements || '',
          },
        };

        const res = await createBooking(payload);
        if (res && res.success && res.data) {
          createdBookings.push(res.data);
        } else {
          throw new Error(res?.error || `Failed to create booking for "${item.title}"`);
        }
      }

      toast.success(
        `Successfully created ${createdBookings.length} booking request(s)!`,
        { id: 'cart-checkout' }
      );

      clear(); // Clear cart after successful checkout
      navigate('/customer-dashboard');
    } catch (err) {
      toast.error(err.message || 'Multi-service booking creation failed', { id: 'cart-checkout' });
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No Items in Checkout</h2>
        <p className="text-xs text-slate-400">Please add services to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl"
        >
          Browse Services
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
        <span>Back to Cart</span>
      </button>

      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <CalendarCheck className="w-8 h-8 text-brand-400" />
          <span>Multi-Service Reservation Checkout</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure dates and domain requirements for each selected service in your bundle.
        </p>
      </div>

      <form onSubmit={handleSubmitAllBookings} className="space-y-8">
        {/* Service Configurations List */}
        {cartItems.map((item, idx) => {
          const cfg = bookingConfigs[item.serviceId] || {};
          const isEvent = item.category === 'event';
          const isConstruction = item.category === 'construction';
          const isHome = item.category === 'home';
          const isAccommodation = item.category === 'accommodation';

          return (
            <div
              key={item.serviceId}
              className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 font-extrabold text-xs flex items-center justify-center border border-brand-500/30">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400">
                      Provider: <strong className="text-slate-200">{item.vendorName}</strong> | Tier: <strong className="text-emerald-400 uppercase">{item.selectedPackage}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400">
                    ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                  </span>
                </div>
              </div>

              {/* Date & Details Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Event Date Picker */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Event / Service Date *</label>
                  <input
                    type="date"
                    required
                    value={cfg.eventDate}
                    onChange={(e) => updateConfig(item.serviceId, 'eventDate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Domain Specific Fields */}
                {isEvent && (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Event Type</label>
                      <input
                        type="text"
                        value={cfg.eventType}
                        onChange={(e) => updateConfig(item.serviceId, 'eventType', e.target.value)}
                        placeholder="e.g. Wedding Reception"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Guest Count</label>
                      <input
                        type="number"
                        min={1}
                        value={cfg.guestCount || ''}
                        onChange={(e) => updateConfig(item.serviceId, 'guestCount', e.target.value)}
                        placeholder="100"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </>
                )}

                {isConstruction && (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Project Type</label>
                      <input
                        type="text"
                        value={cfg.projectType}
                        onChange={(e) => updateConfig(item.serviceId, 'projectType', e.target.value)}
                        placeholder="e.g. Full Interior Renovation"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Project Area (sq.ft)</label>
                      <input
                        type="number"
                        value={cfg.area || ''}
                        onChange={(e) => updateConfig(item.serviceId, 'area', e.target.value)}
                        placeholder="1200"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </>
                )}

                {isHome && (
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Service Type</label>
                    <input
                      type="text"
                      value={cfg.serviceType}
                      onChange={(e) => updateConfig(item.serviceId, 'serviceType', e.target.value)}
                      placeholder="e.g. Deep Cleaning & Plumbing Check"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}

                {isAccommodation && (
                  <>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Rooms Count</label>
                      <input
                        type="number"
                        min={1}
                        value={cfg.rooms || ''}
                        onChange={(e) => updateConfig(item.serviceId, 'rooms', e.target.value)}
                        placeholder="1"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </>
                )}

                {/* Address & Requirements */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-300 font-semibold block">Venue Address / Location</label>
                  <input
                    type="text"
                    value={cfg.address}
                    onChange={(e) => updateConfig(item.serviceId, 'address', e.target.value)}
                    placeholder="Full street address and city"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Submit Bundle Button */}
        <button
          disabled={submitting}
          type="submit"
          className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Submitting Multi-Service Bundle...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-white" />
              <span>Confirm & Submit All {cartItems.length} Booking Requests</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CartCheckout;
