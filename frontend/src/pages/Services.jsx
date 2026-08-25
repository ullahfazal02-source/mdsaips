import React, { useEffect, useState } from 'react';
import { Search, Filter, Briefcase, Store, SlidersHorizontal, RefreshCw, Layers, Sparkles } from 'lucide-react';
import useService from '../hooks/useService';
import useVendor from '../hooks/useVendor';
import ServiceCard from '../components/service/ServiceCard';
import VendorCard from '../components/vendor/VendorCard';
import { DOMAINS } from '../config/domains';

export const Services = () => {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'vendors'

  const { services, getServicesList, loading: serviceLoading, error: serviceError, pagination: servicePagination } = useService();
  const { vendors, getVendorsList, loading: vendorLoading, error: vendorError, pagination: vendorPagination } = useVendor();

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  const fetchCatalogData = (page = 1) => {
    const params = { page, limit: 12 };
    if (q.trim()) params.q = q.trim();
    if (category) params.category = category;
    if (subCategory) params.subCategory = subCategory;
    if (city.trim()) params.city = city.trim();
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    if (sortBy) params.sortBy = sortBy;
    if (isVerifiedOnly) params.isVerified = true;

    if (activeTab === 'services') {
      getServicesList(params).catch(() => {});
    } else {
      getVendorsList(params).catch(() => {});
    }
  };

  useEffect(() => {
    fetchCatalogData(1);
  }, [activeTab, category, subCategory, sortBy, isVerifiedOnly]);

  const handleDomainSelect = (domainKey) => {
    setCategory(domainKey);
    setSubCategory(''); // Reset subcategory when domain changes
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalogData(1);
  };

  const handleResetFilters = () => {
    setQ('');
    setCategory('');
    setSubCategory('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('');
    setIsVerifiedOnly(false);
  };

  const loading = activeTab === 'services' ? serviceLoading : vendorLoading;
  const error = activeTab === 'services' ? serviceError : vendorError;
  const pagination = activeTab === 'services' ? servicePagination : vendorPagination;

  // Subcategory Pill Quick Filters for Active Domain
  const getSubcategoryPills = () => {
    if (!category || !DOMAINS[category]) return [];
    if (category === 'home') {
      return [
        { key: '', label: 'All Home Services' },
        { key: 'plumbing', label: 'Plumbing' },
        { key: 'electrical', label: 'Electrical' },
        { key: 'carpentry', label: 'Carpentry' },
        { key: 'painting', label: 'Painting' },
        { key: 'tile_fixing', label: 'Tile Fixing' },
        { key: 'housekeeping', label: 'Housekeeping' },
        { key: 'air_conditioning', label: 'AC & Appliances' },
        { key: 'ro_water_purifier', label: 'RO Purifiers' },
        { key: 'cctv', label: 'CCTV & Smart Home' },
        { key: 'welding_fabrication', label: 'Fabrication & Interior' },
      ];
    }
    if (category === 'event') {
      return [
        { key: '', label: 'All Event Services' },
        { key: 'wedding_marriage', label: 'Wedding & Marriage' },
        { key: 'photography_videography', label: 'Photography & Videography' },
        { key: 'event_decoration', label: 'Event Decoration' },
        { key: 'catering_food', label: 'Catering & Food' },
        { key: 'dj_music', label: 'DJ & Music' },
        { key: 'sound_lighting', label: 'Sound & Lighting' },
        { key: 'makeup_mehendi', label: 'Makeup & Mehendi' },
      ];
    }
    if (category === 'construction') {
      return [
        { key: '', label: 'All Construction' },
        { key: 'general_contractor', label: 'General Contractor' },
        { key: 'home_renovation', label: 'Home Renovation' },
        { key: 'civil_works', label: 'Civil Works' },
        { key: 'painting', label: 'Painting' },
        { key: 'interior_design', label: 'Interior Design' },
      ];
    }
    if (category === 'accommodation') {
      return [
        { key: '', label: 'All Accommodation' },
        { key: 'hotels', label: 'Hotels' },
        { key: 'resorts', label: 'Resorts' },
        { key: 'guest_houses', label: 'Guest Houses' },
        { key: 'banquet_halls', label: 'Banquet Halls' },
        { key: 'wedding_venues', label: 'Wedding Venues' },
      ];
    }
    return [];
  };

  const subcategoryPills = getSubcategoryPills();

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tab Selector */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Multi-Domain Service Marketplace</h1>
              <p className="text-xs text-slate-400">
                Discover aggregated services and verified service providers across 4 core domains
              </p>
            </div>
          </div>

          {/* Dual Tab Buttons */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'services'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Service Listings</span>
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vendors'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vendor Directory</span>
            </button>
          </div>
        </div>

        {/* DOMAIN SELECTION TAB BAR (4 Core Domains) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => handleDomainSelect('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              category === ''
                ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white border-brand-500 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            All Domains
          </button>
          <button
            onClick={() => handleDomainSelect('event')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              category === 'event'
                ? 'bg-amber-500 text-white border-amber-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            🎉 Event Planning
          </button>
          <button
            onClick={() => handleDomainSelect('construction')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              category === 'construction'
                ? 'bg-blue-500 text-white border-blue-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            🏗️ Construction & Renovation
          </button>
          <button
            onClick={() => handleDomainSelect('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              category === 'home'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            🛠️ Home Services
          </button>
          <button
            onClick={() => handleDomainSelect('accommodation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              category === 'accommodation'
                ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            🏨 Accommodation & Venues
          </button>
        </div>

        {/* SECONDARY SUBCATEGORY PILL BAR */}
        {subcategoryPills.length > 0 && (
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Subcategories:</span>
            </span>
            {subcategoryPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setSubCategory(pill.key)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                  subCategory === pill.key
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter Controls Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Keyword Search */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search wedding, decor, plumbing, venues..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Price (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Max Price (₹)</label>
              <input
                type="number"
                placeholder="Unlimited"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="">Newest Listings</option>
                <option value="rating">Highest Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerifiedOnly}
                onChange={(e) => setIsVerifiedOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
              />
              <span>Verified Providers Only</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>

              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center space-x-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Search Catalog</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Catalog Display */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center space-y-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : activeTab === 'services' ? (
        // Service Listings Grid
        services.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <SlidersHorizontal className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Service Listings Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your keyword query or category/subcategory filters to discover active services.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* Pagination */}
            {pagination?.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchCatalogData(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === p
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        // Vendor Directory Grid
        vendors.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <SlidersHorizontal className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Vendors Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria to view registered vendor profiles.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendors.map((vendor) => (
                <VendorCard key={vendor._id} vendor={vendor} />
              ))}
            </div>

            {/* Pagination */}
            {pagination?.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchCatalogData(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === p
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Services;
