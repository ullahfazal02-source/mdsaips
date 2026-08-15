import React, { useState } from 'react';
import { X, Store, MapPin, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import useVendor from '../../hooks/useVendor';

export const VendorRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const { createVendorProfile, loading, error, clearError } = useVendor();

  const [formData, setFormData] = useState({
    businessName: '',
    category: 'event',
    subCategory: '',
    description: '',
    servicesOffered: '',
    basePrice: '',
    priceUnit: 'per_event',
    currency: 'INR',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      return setFormError('Business name is required.');
    }
    if (!formData.city.trim()) {
      return setFormError('City is required.');
    }
    if (!formData.basePrice || isNaN(formData.basePrice) || Number(formData.basePrice) < 0) {
      return setFormError('Please enter a valid non-negative base price.');
    }

    const payload = {
      businessName: formData.businessName.trim(),
      category: formData.category,
      subCategory: formData.subCategory.trim(),
      description: formData.description.trim(),
      servicesOffered: formData.servicesOffered
        ? formData.servicesOffered.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      pricing: {
        basePrice: Number(formData.basePrice),
        priceUnit: formData.priceUnit.trim() || 'per_event',
        currency: formData.currency.trim() || 'INR',
      },
      location: {
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        ...(formData.latitude || formData.longitude
          ? {
              coordinates: {
                lat: formData.latitude ? Number(formData.latitude) : undefined,
                lng: formData.longitude ? Number(formData.longitude) : undefined,
              },
            }
          : {}),
      },
    };

    try {
      const res = await createVendorProfile(payload);
      if (res && res.success) {
        if (onSuccess) await onSuccess();
        onClose();
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Failed to register vendor profile.');
      setFormError(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-slate-800 p-6 md:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Register Vendor Profile</h2>
              <p className="text-xs text-slate-400">Create your business presence on MDSAIPS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {(formError || error) && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Royal Events & Decor"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="event">Event Planning</option>
                <option value="construction">Construction & Renovation</option>
                <option value="home">Home Services</option>
                <option value="accommodation">Accommodation & Venues</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SubCategory */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory / Tagline</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="e.g. Wedding Decorator, Catering"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Services Offered (comma separated)</label>
              <input
                type="text"
                name="servicesOffered"
                value={formData.servicesOffered}
                onChange={handleChange}
                placeholder="Planning, Decor, Sound, Lighting"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Business Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your services, expertise, and offerings..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Pricing Section */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Pricing Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Base Price (₹) *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Pricing Unit</label>
                <input
                  type="text"
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleChange}
                  placeholder="per_event, per_day, etc."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>Business Location</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bangalore"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Latitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="12.9716"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Longitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="77.5946"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <span>Registering...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Vendor Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistrationModal;
