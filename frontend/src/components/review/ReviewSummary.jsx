import React from 'react';
import { Star, Award, BarChart3 } from 'lucide-react';

/**
 * ReviewSummary Component
 * Overall Rating, total counts, and 5-to-1 star percentage distribution bars.
 */
export const ReviewSummary = ({ summary, className = '' }) => {
  if (!summary) return null;

  const { average = 0, count = 0, distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } = summary;

  const getPercentage = (starCount) => {
    if (!count || count === 0) return 0;
    return Math.round((starCount / count) * 100);
  };

  return (
    <div className={`glass-card p-6 rounded-3xl border border-slate-800 space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Reviews & Ratings Summary</span>
        </h3>
        <span className="text-xs text-slate-400 font-semibold">{count} Total Reviews</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Column: Overall Average Badge */}
        <div className="text-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-5xl font-extrabold text-white tracking-tight">
            {average ? average.toFixed(1) : '0.0'}
          </div>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(average)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium">Based on {count} verified customer ratings</p>
        </div>

        {/* Right 2 Columns: 1-5 Star Breakdown Progress Bars */}
        <div className="md:col-span-2 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const starCount = distribution[star] || 0;
            const pct = getPercentage(starCount);
            return (
              <div key={star} className="flex items-center space-x-3 text-xs">
                <span className="w-12 font-extrabold text-slate-300 flex items-center space-x-1 shrink-0">
                  <span>{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>

                <div className="flex-1 h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-12 text-right text-slate-400 font-mono shrink-0">
                  {pct}% ({starCount})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
