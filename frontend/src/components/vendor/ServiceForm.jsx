import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, Image as ImageIcon, Layers, DollarSign, MapPin, AlertCircle, Check } from 'lucide-react';
import useService from '../../hooks/useService';

/**
 * Reusable Service Form Modal Component (Create & Edit Service)
 */
export const ServiceForm = ({ isOpen, onClose, initialData = null, onSuccess }) => {
  const { addService, editService, loading } = useService();

  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'event',
    subCategory: '',
    price: '',
    priceUnit: 'per_event',
    city: '',
    location: '',
    images: [''],
    tags: [''],
    packages: [
      { name: 'basic', description: '', price: '', features: [''] },
      { name: 'standard', description: '', price: '', features: [''] },
      { name: 'premium', description: '', price: '', features: [''] },
    ],
  });

  const [formError, setFormError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'event',
        subCategory: initialData.subCategory || '',
        price: initialData.price !== undefined ? initialData.price : '',
        priceUnit: initialData.priceUnit || 'per_event',
        city: initialData.city || '',
        location: initialData.location || '',
        images: initialData.images?.length > 0 ? initialData.images : [''],
        tags: initialData.tags?.length > 0 ? initialData.tags : [''],
        packages: [
          initialData.packages?.find((p) => p.name === 'basic') || {
            name: 'basic',
            description: '',
            price: '',
            features: [''],
          },
          initialData.packages?.find((p) => p.name === 'standard') || {
            name: 'standard',
            description: '',
            price: '',
            features: [''],
          },
          initialData.packages?.find((p) => p.name === 'premium') || {
            name: 'premium',
            description: '',
            price: '',
            features: [''],
          },
        ],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'event',
        subCategory: '',
        price: '',
        priceUnit: 'per_event',
        city: '',
        location: '',
        images: [''],
        tags: [''],
        packages: [
          { name: 'basic', description: '', price: '', features: [''] },
          { name: 'standard', description: '', price: '', features: [''] },
          { name: 'premium', description: '', price: '', features: [''] },
        ],
      });
    }
    setFormError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Basic Field Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Handlers
  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Tag Handlers
  const handleTagChange = (index, value) => {
    const updated = [...formData.tags];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, tags: updated }));
  };

  const addTagField = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, ''] }));
  };

  const removeTagField = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Package Handlers
  const handlePackageChange = (pkgName, field, value) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => (pkg.name === pkgName ? { ...pkg, [field]: value } : pkg)),
    }));
  };

  const handleFeatureChange = (pkgName, featureIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.name === pkgName) {
          const updatedFeatures = [...pkg.features];
          updatedFeatures[featureIndex] = value;
          return { ...pkg, features: updatedFeatures };
        }
        return pkg;
      }),
    }));
  };

  const addFeature = (pkgName) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.name === pkgName) {
          return { ...pkg, features: [...pkg.features, ''] };
        }
        return pkg;
      }),
    }));
  };

  const removeFeature = (pkgName, featureIndex) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) => {
        if (pkg.name === pkgName) {
          return {
            ...pkg,
            features: pkg.features.filter((_, i) => i !== featureIndex),
          };
        }
        return pkg;
      }),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Client-side Validation
    if (!formData.title || formData.title.trim().length < 3) {
      setFormError('Service title must be at least 3 characters long.');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      setFormError('Service description must be at least 10 characters long.');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      setFormError('Base price must be a valid number greater than or equal to 0.');
      return;
    }
    if (!formData.city || formData.city.trim() === '') {
      setFormError('City is required.');
      return;
    }

    // Clean up arrays
    const cleanImages = formData.images.filter((img) => img.trim() !== '');
    const cleanTags = formData.tags.filter((t) => t.trim() !== '');

    // Format packages (only include packages with price or description filled)
    const cleanPackages = formData.packages
      .filter((pkg) => pkg.price !== '' || pkg.description.trim() !== '' || pkg.features.some((f) => f.trim() !== ''))
      .map((pkg) => ({
        name: pkg.name,
        description: pkg.description.trim(),
        price: Number(pkg.price || 0),
        features: pkg.features.filter((f) => f.trim() !== ''),
      }));

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      subCategory: formData.subCategory.trim(),
      price: Number(formData.price),
      priceUnit: formData.priceUnit,
      city: formData.city.trim(),
      location: formData.location.trim(),
      images: cleanImages,
      tags: cleanTags,
      packages: cleanPackages,
    };

    try {
      if (isEditing) {
        await editService(initialData._id, payload);
      } else {
        await addService(payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save service.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Service Listing' : 'Create New Service Listing'}
            </h2>
            <p className="text-xs text-slate-400">
              Provide comprehensive service details, pricing, images, and package tiers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Tab Navigation */}
          <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`pb-3 transition-colors ${
                activeTab === 'basic'
                  ? 'text-brand-400 border-b-2 border-brand-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`pb-3 transition-colors ${
                activeTab === 'packages'
                  ? 'text-brand-400 border-b-2 border-brand-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Package Tiers (Optional)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`pb-3 transition-colors ${
                activeTab === 'media'
                  ? 'text-brand-400 border-b-2 border-brand-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Media & Tags
            </button>
          </div>

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Premium Grand Wedding Decoration & Lighting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="event">Event Planning</option>
                    <option value="construction">Construction & Renovation</option>
                    <option value="home">Home Services</option>
                    <option value="accommodation">Accommodation & Venues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder="e.g. Stage Decoration, Floral, Plumbing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Comprehensive summary of what this service offers..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Base Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="25000"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price Unit</label>
                  <select
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="per_event">per event</option>
                    <option value="per_hour">per hour</option>
                    <option value="per_day">per day</option>
                    <option value="per_person">per person</option>
                    <option value="fixed">fixed</option>
                    <option value="per_sqft">per sqft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bangalore"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Address</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Indiranagar, Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('packages')}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Next: Package Tiers →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGE TIERS */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400">
                Optionally configure Basic, Standard, and Premium packages with specific features and prices.
              </p>

              {formData.packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                      {pkg.name} Package
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={pkg.price}
                        onChange={(e) => handlePackageChange(pkg.name, 'price', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Package summary..."
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(pkg.name, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Feature list builder */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-medium text-slate-400">Included Features</label>
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. Stage decoration, Sound system"
                          value={feat}
                          onChange={(e) => handleFeatureChange(pkg.name, fIdx, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(pkg.name, fIdx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addFeature(pkg.name)}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 pt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                >
                  ← Back to Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Next: Media & Tags →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & TAGS */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Image URLs */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Image URLs (Direct Image Links)
                </label>
                {formData.images.map((imgUrl, iIdx) => (
                  <div key={iIdx} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imgUrl}
                        onChange={(e) => handleImageChange(iIdx, e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(iIdx)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Image URL</span>
                </button>
              </div>

              {/* Tags */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300">Tags (Keywords)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.tags.map((tagVal, tIdx) => (
                    <div key={tIdx} className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="e.g. wedding, decor, lighting"
                          value={tagVal}
                          onChange={(e) => handleTagChange(tIdx, e.target.value)}
                          className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTagField(tIdx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addTagField}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('packages')}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                >
                  ← Back to Packages
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center space-x-1.5"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isEditing ? 'Save Changes' : 'Create Service'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
