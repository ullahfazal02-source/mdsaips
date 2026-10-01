import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * OfferManager Component
 * Allows vendor to create and manage promotional offers, percentage/flat discounts, and usage limits.
 */
const OfferManager = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offerType: 'percentage',
    discountValue: 10,
    minBookingAmount: 500,
    code: '',
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE = '/api/v1';

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/offers/my-offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOffers(res.data.data.offers || []);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(
        `${API_BASE}/offers`,
        {
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          offerType: 'percentage',
          discountValue: 10,
          minBookingAmount: 500,
          code: '',
          startDate: '',
          endDate: '',
        });
        fetchOffers();
      }
    } catch (err) {
      console.error('Failed to create offer:', err);
      alert(err.response?.data?.message || 'Failed to create offer');
    } finally {
      setSaving(false);
    }
  };

  const toggleOfferStatus = async (offerId, currentStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/offers/${offerId}/toggle`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOffers();
    } catch (err) {
      console.error('Failed to toggle offer status:', err);
    }
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this promotional offer?')) return;
    try {
      await axios.delete(`${API_BASE}/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOffers();
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🎁</span> Promotional Offers & Discount Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create custom discounts, percentage deals, and promo codes to boost service bookings.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>➕</span> Create Offer
        </button>
      </div>

      {/* Offer List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center space-y-3">
          <span className="text-4xl">🏷️</span>
          <h3 className="font-bold text-gray-800 text-lg">No Promotional Offers Active</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Promotional offers help attract customers during seasonal campaigns or off-peak periods.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className={`bg-white p-6 rounded-2xl border transition-all ${
                offer.isActive ? 'border-indigo-200 shadow-xs' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-2 uppercase">
                    {offer.offerType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                  </span>
                  <h4 className="font-bold text-gray-900 text-base">{offer.title}</h4>
                  {offer.code && (
                    <div className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md inline-block mt-1">
                      Code: <strong>{offer.code}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOfferStatus(offer._id, offer.isActive)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                      offer.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}
                  >
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteOffer(offer._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 line-clamp-2">{offer.description || 'No description provided.'}</p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Min Booking: ₹{offer.minBookingAmount || 0}</span>
                <span>Valid: {new Date(offer.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">Create New Promotional Offer</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% Summer Discount"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Offer Type</label>
                  <select
                    value={formData.offerType}
                    onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min Booking Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Promo Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Terms and details of offer..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg"
                >
                  {saving ? 'Creating...' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManager;
