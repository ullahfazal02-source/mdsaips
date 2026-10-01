import React from 'react';

/**
 * OfferBadge Component
 * Renders promotional discount badge and calculates original strikethrough price + final discounted price.
 */
const OfferBadge = ({ offer, basePrice }) => {
  if (!offer || !basePrice) return null;

  let discountLabel = '';
  let discountAmount = 0;

  if (offer.offerType === 'percentage') {
    discountAmount = Math.round((basePrice * offer.discountValue) / 100);
    discountLabel = `${offer.discountValue}% OFF`;
  } else {
    discountAmount = Math.min(offer.discountValue, basePrice);
    discountLabel = `₹${offer.discountValue} OFF`;
  }

  const finalPrice = Math.max(0, basePrice - discountAmount);

  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[11px] rounded-md shadow-xs animate-pulse">
        <span>🔥</span>
        <span>{offer.title || discountLabel}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-indigo-700">₹{finalPrice.toLocaleString('en-IN')}</span>
        <span className="text-xs text-gray-400 line-through">₹{basePrice.toLocaleString('en-IN')}</span>
        <span className="text-[11px] font-bold text-emerald-600">Save ₹{discountAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default OfferBadge;
