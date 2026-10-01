import React, { useState } from 'react';
import axios from 'axios';

/**
 * ServiceAreaCheck Component
 * Allows customers to input city or address to check service coverage before placing a booking.
 */
const ServiceAreaCheck = ({ serviceId, defaultCity = '' }) => {
  const [city, setCity] = useState(defaultCity);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const API_BASE = '/api/v1';

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setChecking(true);
    try {
      const res = await axios.post(`${API_BASE}/services/${serviceId}/check-coverage`, {
        city: city.trim(),
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Failed to check service area coverage:', err);
      setResult({ isAvailable: false, message: 'Could not verify service area.' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">📍</span>
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
          Check Service Availability
        </h4>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter city or area name (e.g. Bangalore)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={checking || !city.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
        >
          {checking ? 'Checking...' : 'Check'}
        </button>
      </form>

      {result && (
        <div
          className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            result.isAvailable
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{result.isAvailable ? '✓' : '⚠️'}</span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
};

export default ServiceAreaCheck;
