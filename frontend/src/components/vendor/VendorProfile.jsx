import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Tag,
  ArrowLeft,
  Info,
  Clock,
  ShieldCheck,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import useVendor from '../../hooks/useVendor';

export const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentVendor, getVendorById, getVendorAvailability, availability, loading, error } = useVendor();
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) {
      getVendorById(id);
      getVendorAvailability(id);
    }
  }, [id, getVendorById, getVendorAvailability]);

  if (loading && !currentVendor) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !currentVendor) {
    return (
      <div className="max-w-4xl mx-auto p-8 glass-panel rounded-2xl border border-red-500/20 text-center space-y-4">
        <Info className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Vendor Profile Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'The requested vendor profile does not exist or has been removed.'}</p>
        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all"
        >
          Browse All Vendors
        </button>
      </div>
    );
  }

  const {
    businessName,
    description,
    category,
    subCategory,
    servicesOffered,
    pricing,
    location,
    ratings,
    cancellationPolicy,
    portfolio,
    isVerified,
  } = currentVendor;

  const categoryLabels = {
    event: 'Event Planning & Decoration',
    construction: 'Construction & Architectural Services',
    home: 'Home Care & Renovation',
    accommodation: 'Accommodation & Venues',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Vendors</span>
      </button>

      {/* Hero / Header Card */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 md:p-8 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">{businessName}</h1>
              {isVerified ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Vendor</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Verification Pending</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center space-x-1.5 text-brand-400 font-medium">
                <Tag className="w-4 h-4" />
                <span>{categoryLabels[category] || category}</span>
              </span>

              {subCategory && (
                <span className="text-slate-400">
                  • <span className="text-slate-200">{subCategory}</span>
                </span>
              )}

              <span className="inline-flex items-center space-x-1.5 text-slate-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>
                  {location?.city}, {location?.state} {location?.pincode}
                </span>
              </span>
            </div>
          </div>

          {/* Pricing & Ratings Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Starting Rate</span>
              <p className="text-2xl font-extrabold text-white">
                ₹{pricing?.basePrice ? pricing.basePrice.toLocaleString('en-IN') : '0'}
                <span className="text-xs font-normal text-slate-400 ml-1">/{pricing?.priceUnit || 'unit'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-lg font-bold text-amber-300">
                {ratings?.average ? ratings.average.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-slate-400">({ratings?.count || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Business Overview */}
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-brand-400" />
              <span>About Business</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {description || 'No detailed business description provided yet.'}
            </p>
          </div>

          {/* Services Offered */}
          {servicesOffered && servicesOffered.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                <span>Services Offered</span>
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {servicesOffered.map((service, index) => (
                  <span
                    key={index}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 text-brand-300 border border-slate-700/60"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Gallery */}
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <span>Portfolio Gallery</span>
            </h2>
            {portfolio && portfolio.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {portfolio.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className="h-32 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-brand-500 transition-all duration-300 group relative"
                  >
                    <img
                      src={url}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No portfolio media uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-8">
          {/* Cancellation Policy */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Cancellation Policy</span>
            </h3>

            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <span>{cancellationPolicy?.type || 'flexible'} Policy</span>
              </div>

              {cancellationPolicy?.rules && cancellationPolicy.rules.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {cancellationPolicy.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>&gt; {rule.hoursBeforeEvent} hours prior</span>
                      </span>
                      <span className="font-bold text-emerald-400">{rule.refundPercentage}% Refund</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Standard refund rules apply upon cancellation.</p>
              )}
            </div>
          </div>

          {/* Availability Calendar Summary */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Upcoming Availability</span>
            </h3>

            {availability && availability.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availability.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
                  >
                    <span className="text-slate-300 font-mono">{item.date}</span>
                    {item.isAvailable ? (
                      <span className="text-emerald-400 font-medium">Available ({item.slots?.length || 0} slots)</span>
                    ) : (
                      <span className="text-red-400 font-medium">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific calendar exceptions updated.</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={selectedImage} alt="Expanded Portfolio" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;
