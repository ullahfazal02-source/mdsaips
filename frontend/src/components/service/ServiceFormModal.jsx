import React, { useEffect, useState } from 'react';
import { X, Briefcase, DollarSign, Layers, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import useService from '../../hooks/useService';

export const ServiceFormModal = ({ isOpen, onClose, initialData = null, onSuccess }) => {
  const { createNewService, updateServiceListing, loading, error, clearError } = useService();

  const [formData, setFormData] = useState({
    title: '',
    category: 'event',
    subCategory: '',
    description: '',
    price: '',
    priceUnit: 'per_event',
    city: '',
    location: '',
    images: '',
    tags: '',
  });

  const [packages, setPackages] = useState([
    { name: 'basic', description: 'Basic tier service package', price: '', features: '' },
  ]);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'event',
        subCategory: initialData.subCategory || '',
        description: initialData.description || '',
        price: initialData.price || '',
        priceUnit: initialData.priceUnit || 'per_event',
        city: initialData.city || '',
        location: initialData.location || '',
        images: initialData.images ? initialData.images.join('\n') : '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
      });
      if (initialData.packages && initialData.packages.length > 0) {
        setPackages(
          initialData.packages.map((p) => ({
            name: p.name,
            description: p.description || '',
            price: p.price,
            features: p.features ? p.features.join(', ') : '',
          }))
        );
      }
    } else {
      setFormData({
        title: '',
        category: 'event',
        subCategory: '',
        description: '',
        price: '',
        priceUnit: 'per_event',
        city: '',
        location: '',
        images: '',
        tags: '',
      });
      setPackages([{ name: 'basic', description: 'Basic tier service package', price: '', features: '' }]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    clearError();
  };

  const handleAddPackageTier = (tierName) => {
    if (packages.some((p) => p.name === tierName)) return;
    setPackages([
      ...packages,
      { name: tierName, description: `${tierName} tier service package`, price: '', features: '' },
    ]);
  };

  const handleRemovePackage = (tierName) => {
    setPackages(packages.filter((p) => p.name !== tierName));
  };

  const handlePackageChange = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.title.length < 3) {
      return setFormError('Service title must be at least 3 characters.');
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      return setFormError('Service description must be at least 10 characters.');
    }
    if (!formData.city.trim()) {
      return setFormError('City is required.');
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      return setFormError('Please enter a valid non-negative base price.');
    }

    const formattedPackages = packages.map((p) => ({
      name: p.name,
      description: p.description.trim(),
      price: Number(p.price) || Number(formData.price),
      features: p.features
        ? p.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [],
    }));

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      subCategory: formData.subCategory.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      priceUnit: formData.priceUnit,
      city: formData.city.trim(),
      location: formData.location.trim(),
      images: formData.images
        ? formData.images.split('\n').map((u) => u.trim()).filter(Boolean)
        : [],
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      packages: formattedPackages,
    };

    try {
      if (initialData?._id) {
        await updateServiceListing(initialData._id, payload);
      } else {
        await createNewService(payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setFormError(err || 'Failed to save service listing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-slate-800 p-6 md:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialData ? 'Edit Service Listing' : 'Create New Service Listing'}
              </h2>
              <p className="text-xs text-slate-400">Configure service details, pricing, and package options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {(formError || error) && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Wedding Floral & Stage Decor"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Domain Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="e.g. Stage Decoration"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Bangalore"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Service Description *</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the scope, deliverables, and terms of this service..."
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Pricing & Units */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Base Pricing</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Base Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="45000"
                  min="0"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Price Unit</label>
                <select
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="per_event">per_event</option>
                  <option value="per_day">per_day</option>
                  <option value="per_hour">per_hour</option>
                  <option value="per_person">per_person</option>
                  <option value="per_sqft">per_sqft</option>
                  <option value="fixed">fixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Package Tier Builder */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Package Tiers (Basic, Standard, Premium)</span>
              </h3>
              <div className="flex items-center space-x-1">
                {['basic', 'standard', 'premium'].map(
                  (tier) =>
                    !packages.some((p) => p.name === tier) && (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleAddPackageTier(tier)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500 hover:text-white transition-all"
                      >
                        + Add {tier}
                      </button>
                    )
                )}
              </div>
            </div>

            <div className="space-y-4">
              {packages.map((pkg, idx) => (
                <div key={pkg.name} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      {pkg.name} Tier
                    </span>
                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(pkg.name)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400">Package Price (₹)</label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => handlePackageChange(idx, 'price', e.target.value)}
                        placeholder={formData.price || '45000'}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Description</label>
                      <input
                        type="text"
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(idx, 'description', e.target.value)}
                        placeholder="Tier description..."
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400">Features Included (comma separated)</label>
                    <input
                      type="text"
                      value={pkg.features}
                      onChange={(e) => handlePackageChange(idx, 'features', e.target.value)}
                      placeholder="Stage Backdrop, Entrance Flowers, Ambient Lighting"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Images & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Image URLs (one URL per line)
              </label>
              <textarea
                rows={3}
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="wedding, stage, decor, flowers"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all flex items-center space-x-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{initialData ? 'Update Service' : 'Create Service'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
