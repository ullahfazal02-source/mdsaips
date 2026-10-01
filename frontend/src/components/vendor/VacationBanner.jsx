import React from 'react';

/**
 * VacationBanner Component
 * Alert banner shown when Vendor is currently on Vacation Mode.
 */
const VacationBanner = ({ isVacationMode, onToggle, isOwner = false }) => {
  if (!isVacationMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-bounce">🏖️</span>
        <div>
          <h4 className="font-bold text-sm">Vendor Currently on Vacation Mode</h4>
          <p className="text-xs text-amber-100 mt-0.5">
            New booking requests are temporarily paused. Existing confirmed bookings remain active.
          </p>
        </div>
      </div>

      {isOwner && onToggle && (
        <button
          onClick={() => onToggle(false)}
          className="px-4 py-1.5 bg-white text-orange-700 font-bold text-xs rounded-xl shadow-xs hover:bg-amber-50 transition-colors whitespace-nowrap"
        >
          Resume Bookings (Turn OFF)
        </button>
      )}
    </div>
  );
};

export default VacationBanner;
