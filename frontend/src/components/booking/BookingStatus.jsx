import React from 'react';
import { Clock, CheckCircle2, Play, Flag, AlertCircle } from 'lucide-react';

/**
 * Booking Status Badge and Lifecycle Timeline Component
 */
export const BookingStatus = ({ status, timeline = [], showTimeline = true }) => {
  const getStatusBadge = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">Pending Request</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">Confirmed</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
            <Play className="w-3.5 h-3.5" />
            <span className="capitalize">In Progress</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Flag className="w-3.5 h-3.5" />
            <span className="capitalize">Completed</span>
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="capitalize">{currentStatus}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <span className="capitalize">{currentStatus}</span>
          </span>
        );
    }
  };

  const steps = [
    { key: 'pending', label: 'Requested', desc: 'Booking request sent' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Vendor confirmed date' },
    { key: 'in_progress', label: 'In Progress', desc: 'Service ongoing' },
    { key: 'completed', label: 'Completed', desc: 'Service completed' },
  ];

  const getStepStatus = (stepKey) => {
    const order = ['pending', 'confirmed', 'in_progress', 'completed'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepKey);

    if (currentIndex === -1) return 'future'; // for cancelled/rejected
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'future';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">{getStatusBadge(status)}</div>

      {showTimeline && (
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Booking Progress Lifecycle
          </h4>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {steps.map((step, idx) => {
              const state = getStepStatus(step.key);
              const timelineItem = timeline.find((t) => t.status === step.key);

              return (
                <div key={step.key} className="flex md:flex-col items-center gap-3 relative z-10 w-full md:w-auto">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      state === 'completed'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : state === 'active'
                        ? 'bg-brand-500 text-white ring-4 ring-brand-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {state === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div className="text-left md:text-center space-y-0.5">
                    <p
                      className={`text-xs font-bold ${
                        state === 'active'
                          ? 'text-brand-400'
                          : state === 'completed'
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {timelineItem && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(timelineItem.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStatus;
