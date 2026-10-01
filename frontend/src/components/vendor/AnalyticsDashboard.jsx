import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * AnalyticsDashboard Component
 * Displays vendor performance stats, profile views, service views, conversion rate %, and tier progress.
 */
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('30days');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const API_BASE = '/api/v1';

  const fetchAnalytics = async (tf) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/analytics/my-analytics?timeframe=${tf}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load vendor analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  const timeframeOptions = [
    { key: 'today', label: 'Today' },
    { key: '7days', label: '7 Days' },
    { key: '30days', label: '30 Days' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year', label: 'This Year' },
  ];

  if (loading && !analytics) {
    return <div className="p-8 text-center text-gray-500">Loading analytics dashboard...</div>;
  }

  const metrics = analytics?.metrics || {};
  const currentTier = metrics.currentTier || {};

  return (
    <div className="space-y-6">
      {/* Header & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📊</span> Vendor Performance & Conversion Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track profile impressions, service views, booking conversions, and vendor tier progression.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl">
          {timeframeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTimeframe(opt.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === opt.key
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile Views</span>
            <span className="p-2 bg-indigo-50 rounded-xl text-lg">👁️</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{metrics.profileViews || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Unique Profile Visitors: {metrics.uniqueVisitors || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Service Views</span>
            <span className="p-2 bg-purple-50 rounded-xl text-lg">🛍️</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{metrics.serviceViews || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Impressions across listings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Bookings Generated</span>
            <span className="p-2 bg-emerald-50 rounded-xl text-lg">🎉</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{metrics.bookingsCompleted || 0}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Confirmed & Completed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Conversion Rate</span>
            <span className="p-2 bg-amber-50 rounded-xl text-lg">📈</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{metrics.conversionRate || '0.0'}%</div>
          <p className="text-xs text-gray-500 mt-1">Views to Bookings Ratio</p>
        </div>
      </div>

      {/* Vendor Tier Progress Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-indigo-200">
            <span>🏆 Dynamic Tier Performance</span>
          </div>
          <h3 className="text-2xl font-bold">
            Current Tier: <span className="text-amber-400">{currentTier.label || 'New Vendor'}</span>
          </h3>
          <p className="text-sm text-slate-300 max-w-xl">
            Calculated dynamically based on real performance metrics: {metrics.bookingsCompleted || 0} completed bookings, average rating {metrics.averageRating || '0.0'} ★, and response rate {metrics.responseRate || '100'}%.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center min-w-[200px]">
          <div className="text-xs text-indigo-200 uppercase font-semibold">Response Rate</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">{metrics.responseRate || 100}%</div>
          <div className="text-[10px] text-slate-400 mt-1">1-Hour Deadline Compliance</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
