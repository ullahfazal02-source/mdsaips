import React from 'react';
import { Star, MapPin, CheckCircle2, Tag, ArrowRight, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Service Card Component
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
    city,
    images,
    ratings,
    packages,
    vendorId,
    vendor,
  } = service;

  const vendorData = vendorId || vendor || {};
  const vendorName = vendorData.businessName || 'Verified Vendor';
  const isVendorVerified = vendorData.isVerified;

  const thumbnail =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';

  const categoryLabels = {
    event: 'Event Planning',
    construction: 'Construction & Renovation',
    home: 'Home Services',
    accommodation: 'Accommodation & Venues',
  };

  const formatUnit = (unit) => {
    switch (unit) {
      case 'per_hour':
        return 'hr';
      case 'per_day':
        return 'day';
      case 'per_event':
        return 'event';
      case 'per_person':
        return 'person';
      case 'per_sqft':
        return 'sq.ft';
      default:
        return 'service';
    }
  };

  return (
    <div className="glass-card group rounded-2xl border border-slate-800 hover:border-brand-500/40 overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-brand-500/10">
      <div>
        {/* Thumbnail Header */}
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

          {/* Category Pill */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/80 text-brand-300 border border-slate-700/60 backdrop-blur-md">
              <Tag className="w-3 h-3 text-brand-400" />
              <span>{categoryLabels[category] || category}</span>
            </span>
          </div>

          {/* Package Count Pill */}
          {packages && packages.length > 0 && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                <Layers className="w-3 h-3" />
                <span>{packages.length} Packages</span>
              </span>
            </div>
          )}

          {/* Rating Tag */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="font-bold text-xs text-amber-300">
              {ratings?.average ? ratings.average.toFixed(1) : '0.0'}
            </span>
            <span className="text-[10px] text-slate-300">({ratings?.count || 0})</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
            {subCategory && (
              <p className="text-xs text-slate-400 font-medium line-clamp-1">{subCategory}</p>
            )}
          </div>

          {/* Vendor Info & Location */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center space-x-1 text-slate-300 font-medium">
              <span className="line-clamp-1">{vendorName}</span>
              {isVendorVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
              )}
            </div>

            <div className="flex items-center space-x-1 text-slate-400 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>{city || 'Location N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Action */}
      <div className="p-5 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting Rate</span>
          <p className="text-lg font-extrabold text-white">
            ₹{price ? price.toLocaleString('en-IN') : '0'}
            <span className="text-xs font-normal text-slate-400 ml-1">
              / {formatUnit(priceUnit)}
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate(`/services/${_id}`)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-500/10 text-brand-300 border border-brand-500/30 hover:bg-brand-500 hover:text-white transition-all text-xs font-semibold"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
