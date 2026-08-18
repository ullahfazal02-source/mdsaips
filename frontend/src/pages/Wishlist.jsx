import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Save,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useWishlist from '../hooks/useWishlist';
import useCart from '../hooks/useCart';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, count, loading, refresh, remove, clear, updateNote } = useWishlist();
  const { addItem: addCartItem } = useCart();

  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const toggleSelectService = (serviceId) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedServiceIds.length === wishlist.length) {
      setSelectedServiceIds([]);
    } else {
      const activeIds = wishlist
        .filter((item) => item.isAvailable !== false)
        .map((item) => item.serviceId?._id || item.serviceId);
      setSelectedServiceIds(activeIds);
    }
  };

  const handleSaveNote = async (serviceId) => {
    try {
      await updateNote(serviceId, noteText);
      toast.success('Wishlist note updated');
      setEditingNoteId(null);
      setNoteText('');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleRemoveItem = async (serviceId) => {
    try {
      await remove(serviceId);
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
      toast.success('Removed from Wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return;
    try {
      await clear();
      setSelectedServiceIds([]);
      toast.success('Wishlist cleared');
    } catch (err) {
      toast.error('Failed to clear wishlist');
    }
  };

  const handleAddSelectedToCart = () => {
    const selectedItems = wishlist.filter((item) => {
      const sId = item.serviceId?._id || item.serviceId;
      return selectedServiceIds.includes(sId) && item.isAvailable !== false;
    });

    if (selectedItems.length === 0) {
      toast.error('Please select at least one active service item');
      return;
    }

    selectedItems.forEach((item) => {
      const service = item.serviceId || {};
      const vendor = item.vendor || service.vendorId || {};
      addCartItem({
        serviceId: service._id || item.serviceId,
        vendorId: vendor._id || service.vendorId,
        title: service.title || 'Service Listing',
        image: (service.images && service.images[0]) || '',
        price: service.price || 0,
        priceUnit: service.priceUnit || 'per_event',
        category: service.category || 'general',
        vendorName: vendor.businessName || 'Provider',
        selectedPackage: 'basic',
        quantity: 1,
      });
    });

    toast.success(`${selectedItems.length} service(s) added to Cart!`);
    navigate('/cart');
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const allSelected = wishlist.length > 0 && selectedServiceIds.length === wishlist.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Saved Wishlist</h1>
            <p className="text-xs text-slate-400 mt-1">
              Curate your favorite services, attach personal notes, and select items for multi-service bundle booking.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
            {count} Saved Services
          </span>
          {wishlist.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {wishlist.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <Heart className="w-16 h-16 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Explore our diverse marketplace of verified vendors in events, construction, home care, and venues to save your favorite services.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-lg shadow-brand-600/30 transition-all"
          >
            <span>Explore Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-brand-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Select All Active ({wishlist.filter((i) => i.isAvailable !== false).length})</span>
            </button>

            <button
              disabled={selectedServiceIds.length === 0}
              onClick={handleAddSelectedToCart}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg shadow-brand-600/20 transition-all flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add Selected to Cart ({selectedServiceIds.length})</span>
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="space-y-4">
            {wishlist.map((item) => {
              const service = item.service || item.serviceId || {};
              const vendor = item.vendor || service.vendorId || {};
              const serviceId = service._id || item.serviceId;
              const isAvailable = item.isAvailable !== false && service.isActive !== false;
              const isSelected = selectedServiceIds.includes(serviceId);

              return (
                <div
                  key={item._id || serviceId}
                  className={`glass-card p-6 rounded-2xl border transition-all space-y-4 ${
                    isAvailable
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Checkbox + Image + Details */}
                    <div className="flex items-start space-x-4">
                      {isAvailable ? (
                        <button
                          onClick={() => toggleSelectService(serviceId)}
                          className="mt-1 text-slate-400 hover:text-brand-400 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-brand-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                      ) : (
                        <div className="mt-1 w-5 h-5 shrink-0" />
                      )}

                      {service.images && service.images[0] ? (
                        <img
                          src={service.images[0]}
                          alt={service.title || 'Service'}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500 font-bold text-xs">
                          NO IMG
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3
                            onClick={() => isAvailable && navigate(`/services/${serviceId}`)}
                            className={`text-base font-bold transition-colors ${
                              isAvailable
                                ? 'text-white hover:text-brand-400 cursor-pointer'
                                : 'text-slate-400 line-through'
                            }`}
                          >
                            {service.title || 'Service Listing'}
                          </h3>

                          {!isAvailable && (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Service Currently Unavailable</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400">
                          Provider: <strong className="text-slate-200">{vendor.businessName || 'Service Vendor'}</strong>
                        </p>

                        <p className="text-sm font-extrabold text-emerald-400 pt-1">
                          ₹{service.price ? service.price.toLocaleString('en-IN') : '0'}
                          <span className="text-xs text-slate-400 font-normal"> / {service.priceUnit || 'event'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {isAvailable && (
                        <button
                          onClick={() => navigate(`/booking?serviceId=${serviceId}`)}
                          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                        >
                          Book Now
                        </button>
                      )}

                      <button
                        onClick={() => handleRemoveItem(serviceId)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Personal Note Editor */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-start space-x-3 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-1" />

                    {editingNoteId === serviceId ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add personal note (e.g. Important for wedding setup)"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                        <button
                          onClick={() => handleSaveNote(serviceId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-slate-300 italic">
                          {item.note ? `"${item.note}"` : 'No personal note added.'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNoteId(serviceId);
                            setNoteText(item.note || '');
                          }}
                          className="text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1 ml-2 shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{item.note ? 'Edit Note' : '+ Add Note'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
