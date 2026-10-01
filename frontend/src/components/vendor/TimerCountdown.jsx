import React, { useState, useEffect } from 'react';

/**
 * TimerCountdown Component
 * Displays live response window countdown based strictly on BACKEND responseDeadline timestamp.
 */
const TimerCountdown = ({ deadline, onExpire, status = 'pending' }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    if (!deadline || status !== 'pending') return;

    const calculateTime = () => {
      const targetTime = new Date(deadline).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, status, onExpire]);

  if (status !== 'pending') return null;

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold border border-red-300">
        <span>⏰</span>
        <span>Expired (Vendor did not respond in 1 hour)</span>
      </div>
    );
  }

  const isUrgent = timeLeft.minutes < 15;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border transition-colors ${
      isUrgent
        ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
        : 'bg-amber-50 text-amber-800 border-amber-300'
    }`}>
      <span>⏰</span>
      <span>
        Response Window: {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default TimerCountdown;
