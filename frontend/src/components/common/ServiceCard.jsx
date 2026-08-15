import React from 'react';
import { Star, MapPin, CheckCircle2, Tag, ArrowRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Service Card Component
 * 
 * Renders service thumbnail, category badge, title, location/city, vendor name,
 * verification badge, rating, starting price, and "View Details" button.
 */
export const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  if (!service) return null;

  const {
    _id,
    title,
    category,
    subCategory,
    price,
    priceUnit,
    images,
    ratings,
    city,
    vendorId,
  } = service;

  // Extract vendor info if populated
  const vendorName = vendorId?.businessName || 'Verified Vendor';
  const isVerified = vendorId?.isVerified ?? true;

  // Image fallback logic
  const thumbnail =
    images && images.length > 0 && images[0]
      ? images[0]
      : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';

  const categoryLabels = {
    event: 'Event Planning',
    construction: 'Construction & Renovation',
    home: 'Home Services',
    accommodation: 'Accommodation & Venues',
  };

  const formattedPriceUnit = priceUnit ? priceUnit.replace('_', ' ') : 'event';

  return (
    <div className="glass-card group rounded-2xl border border-slate-800 hover:border-brand-500/40 overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-brand-500/10">
      <div>
        {/* Service Image Header */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Verified Vendor Badge */}
          {isVerified && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Vendor</span>
              </span>
            </div>
          )}

          {/* Category Pill */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/80 text-brand-300 border border-slate-700/60 backdrop-blur-md">
              <Tag className="w-3 h-3 text-brand-400" />
              <span>{categoryLabels[category] || category}</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Vendor Name */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Store className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate font-medium text-slate-300">{vendorName}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            {/* City */}
            <div className="flex items-center space-x-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{city || 'Multiple Cities'}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span className="font-bold text-amber-300">
                {ratings?.average ? ratings.average.toFixed(1) : '0.0'}
              </span>
              <span className="text-[10px] text-slate-400">({ratings?.count || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer & Action */}
      <div className="p-5 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting Price</span>
          <p className="text-base font-extrabold text-white">
            ₹{price ? price.toLocaleString('en-IN') : '0'}
            <span className="text-[11px] font-normal text-slate-400 ml-1">
              / {formattedPriceUnit}
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate(`/services/${_id}`)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all text-xs font-semibold shadow-md shadow-brand-500/20"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
