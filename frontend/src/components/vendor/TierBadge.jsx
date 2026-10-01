import React from 'react';

/**
 * Dynamic Vendor Tier Badge Component
 * Displays tier level badge with badge icon and stylized styling.
 */
const TierBadge = ({ tier, showDetails = false, className = '' }) => {
  if (!tier) return null;

  const key = typeof tier === 'string' ? tier : tier.key || tier.label;

  let bg = 'bg-gray-100 text-gray-700 border-gray-300';
  let badgeIcon = '🌱';
  let label = 'New Vendor';

  if (key.includes('Top') || key.includes('top')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm';
    badgeIcon = '🏆';
    label = 'Top Vendor 🏆';
  } else if (key.includes('Trusted') || key.includes('trusted')) {
    bg = 'bg-purple-50 text-purple-700 border-purple-300 shadow-sm';
    badgeIcon = '★';
    label = 'Trusted Vendor ★';
  } else if (key.includes('Verified') || key.includes('verified')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm';
    badgeIcon = '✓';
    label = 'Verified Vendor ✓';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${bg} ${className}`}
      title={label}
    >
      <span className="text-xs">{badgeIcon}</span>
      <span>{label}</span>
    </span>
  );
};

export default TierBadge;
