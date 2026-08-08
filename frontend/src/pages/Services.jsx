import React from 'react';
import { Briefcase, Search, Filter, Star, MapPin } from 'lucide-react';

export const Services = () => {
  const domains = [
    { title: 'Venues & Spaces', count: '140+ Listings', color: 'from-blue-600 to-indigo-600' },
    { title: 'Catering & Dining', count: '85+ Providers', color: 'from-amber-600 to-orange-600' },
    { title: 'Logistics & Transport', count: '60+ Fleets', color: 'from-emerald-600 to-teal-600' },
    { title: 'Media & Photography', count: '110+ Studios', color: 'from-purple-600 to-pink-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Multi-Domain Service Marketplace</h1>
            <p className="text-xs text-slate-400">Browse aggregated services across multiple domains</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search services, vendors, or locations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              readOnly
            />
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 border border-slate-700">
            <Filter className="w-4 h-4" />
            <span>Filter Domains</span>
          </button>
        </div>
      </div>

      {/* Domain Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {domains.map((dom, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 hover:scale-[1.02] transition-transform">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${dom.color} flex items-center justify-center text-white text-xs font-bold`}>
              {dom.title.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="text-base font-bold text-white">{dom.title}</h3>
            <p className="text-xs text-slate-400">{dom.count}</p>
          </div>
        ))}
      </div>

      {/* Placeholder Listings Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-semibold text-white">Aggregated Services Catalog Placeholder</h3>
        <p className="text-xs text-slate-400">
          Domain models, search indexes, and filtering APIs will populate real-time services here.
        </p>
      </div>
    </div>
  );
};

export default Services;
