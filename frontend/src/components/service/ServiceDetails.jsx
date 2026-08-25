import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Star,
  MapPin,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Info,
  Building,
  Check,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShoppingCart,
} from 'lucide-react';
import useService from '../../hooks/useService';
import useReview from '../../hooks/useReview';
import useCart from '../../hooks/useCart';
import ReviewSummary from '../review/ReviewSummary';
import ReviewCard from '../review/ReviewCard';
import WishlistButton from '../wishlist/WishlistButton';

export const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentService, getServiceById, loading, error } = useService();
  const { getServiceReviews, reviews, ratingSummary, pagination, loading: reviewsLoading } = useReview();
  const { addItem: addCartItem } = useCart();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentVendor } = useSelector((state) => state.vendor);

  const [selectedImage, setSelectedImage] = useState(null);
  const [activePackage, setActivePackage] = useState('basic');
  const [sortOption, setSortOption] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddToCart = () => {
    if (!currentService) return;

    // Check own-service protection
    const userVendorId = currentVendor?._id;
    const serviceVendorId = currentService.vendorId?._id || currentService.vendorId || currentService.vendor;

    if (userVendorId && serviceVendorId && userVendorId.toString() === serviceVendorId.toString()) {
      toast.error('You cannot add your own service to cart.');
      return;
    }

    const selectedPkgObj = currentService.packages?.find((p) => p.name === activePackage);
    const itemPrice = selectedPkgObj ? selectedPkgObj.price : currentService.price;

    addCartItem({
      serviceId: currentService._id,
      vendorId: serviceVendorId,
      title: currentService.title,
      image: (currentService.images && currentService.images[0]) || '',
      price: itemPrice,
      priceUnit: currentService.priceUnit,
      category: currentService.category,
      vendorName: currentService.vendorId?.businessName || currentService.vendor?.businessName || 'Provider',
      selectedPackage: activePackage,
      quantity: 1,
    });

    toast.success(`"${currentService.title}" (${activePackage.toUpperCase()}) added to Cart!`);
  };

  useEffect(() => {
    if (id) {
      getServiceById(id);
      getServiceReviews({ serviceId: id, page: currentPage, limit: 5, sort: sortOption });
    }
  }, [id, getServiceById, getServiceReviews, currentPage, sortOption]);

  if (loading && !currentService) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !currentService) {
    return (
      <div className="max-w-4xl mx-auto p-8 glass-panel rounded-2xl border border-red-500/20 text-center space-y-4">
        <Info className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Service Listing Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'The requested service listing does not exist or has been removed.'}</p>
        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all"
        >
          Browse All Services
        </button>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    subCategory,
    price,
    priceUnit,
    city,
    location,
    images,
    tags,
    packages,
    ratings,
    vendorId,
    vendor,
  } = currentService;

  const vendorData = vendorId || vendor || {};

  const categoryLabels = {
    event: 'Event Planning & Setup',
    construction: 'Construction & Renovation',
    home: 'Home Care & Renovation',
    accommodation: 'Accommodation & Venues',
  };

  const formatUnit = (unit) => {
    switch (unit) {
      case 'per_hour':
        return 'hour';
      case 'per_day':
        return 'day';
      case 'per_event':
        return 'event';
      case 'per_person':
        return 'person';
      case 'per_sqft':
        return 'sq.ft';
      default:
        return 'service';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Services</span>
      </button>

      {/* Hero Header */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 md:p-8 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Tag className="w-3.5 h-3.5" />
                <span>{categoryLabels[category] || category}</span>
              </span>
              {subCategory && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {subCategory}
                </span>
              )}
              <WishlistButton service={currentService} showText={true} />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center space-x-1.5 text-slate-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>
                  {location || city}, {city}
                </span>
              </span>

              {vendorData.businessName && (
                <span className="inline-flex items-center space-x-1 text-slate-300">
                  <span>By <strong>{vendorData.businessName}</strong></span>
                  {vendorData.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 inline" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Rating Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Base Price</span>
              <p className="text-3xl font-extrabold text-white">
                ₹{price ? price.toLocaleString('en-IN') : '0'}
                <span className="text-xs font-normal text-slate-400 ml-1">/{formatUnit(priceUnit)}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-lg font-bold text-amber-300">
                {ratings?.average ? ratings.average.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-slate-400">({ratings?.count || 0} ratings)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images Gallery */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Service Gallery</span>
            </h2>

            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className="h-36 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-brand-500 transition-all duration-300 group"
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No gallery images uploaded for this listing.</p>
            )}
          </div>

          {/* Description */}
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-brand-400" />
              <span>Service Description</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{description}</p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold mr-1">Tags:</span>
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Packages Comparison Section */}
          {packages && packages.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Service Package Tiers</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">{packages.length} Packages Available</span>
              </div>

              {/* Package Selector Tabs */}
              <div className="flex space-x-2 border-b border-slate-800 pb-3">
                {packages.map((pkg) => (
                  <button
                    key={pkg.name}
                    onClick={() => setActivePackage(pkg.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      activePackage === pkg.name
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pkg.name} Tier
                  </button>
                ))}
              </div>

              {/* Package Content Display */}
              {packages
                .filter((pkg) => pkg.name === activePackage)
                .map((pkg) => (
                  <div key={pkg.name} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {pkg.name} Package
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">{pkg.description || 'Customized service package'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-white">
                          ₹{pkg.price ? pkg.price.toLocaleString('en-IN') : '0'}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    {pkg.features && pkg.features.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Features Included:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pkg.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center space-x-2 text-xs text-slate-300">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Module 9: Verified Reviews & Rating Breakdown Section */}
          <div className="space-y-6 pt-4">
            <ReviewSummary summary={ratingSummary || ratings} />

            {/* Sorting & Header Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-brand-400" />
                <span>Customer Feedback ({pagination.total || reviews.length})</span>
              </h3>

              {/* Sorting Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-semibold">Sort By:</span>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium px-3 py-1.5 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                <Star className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">No Reviews Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Be the first completed customer to share your verified review for this service.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <ReviewCard key={rev._id} review={rev} isVendorView={false} />
                ))}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={currentPage >= pagination.pages}
                        onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vendor Overview Card & Booking CTA */}
        <div className="space-y-8">
          {/* Vendor Card */}
          {vendorData._id && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                <span>Service Provider</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-bold text-white">{vendorData.businessName}</h4>
                    {vendorData.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{vendorData.category} Provider</p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{vendorData.location?.city || city}</span>
                </div>

                <button
                  onClick={() => navigate(`/vendors/${vendorData._id}`)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>View Vendor Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Booking CTA Box */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 w-12 h-12 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Reserve Service</h3>
              <p className="text-xs text-slate-400">
                Select your package, choose your event date, and submit a direct reservation request to the vendor.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4 text-brand-400" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  const userVendorId = currentVendor?._id;
                  const serviceVendorId = currentService.vendorId?._id || currentService.vendorId || currentService.vendor;

                  if (userVendorId && serviceVendorId && userVendorId.toString() === serviceVendorId.toString()) {
                    toast.error('You cannot book your own service.');
                    return;
                  }

                  const targetUrl = `/booking?serviceId=${id}&package=${activePackage}`;
                  if (!isAuthenticated) {
                    navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
                  } else {
                    navigate(targetUrl);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={selectedImage} alt="Expanded Service Gallery" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
