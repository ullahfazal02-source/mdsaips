import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useWishlist from '../../hooks/useWishlist';

/**
 * WishlistButton Component
 * Renders interactive Heart Icon button with debouncing and own-service protection.
 */
export const WishlistButton = ({ service, className = '', showText = true }) => {
  const navigate = useNavigate();
  const { wishlist, add, remove } = useWishlist();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentVendor } = useSelector((state) => state.vendor);
  const [loading, setLoading] = useState(false);

  if (!service) return null;

  const serviceId = service._id || service.id;
  const serviceVendorId = service.vendorId?._id || service.vendorId || service.vendor;

  // Check if saved in wishlist
  const isSaved = wishlist.some((item) => {
    const sId = item.serviceId?._id || item.serviceId;
    return sId === serviceId;
  });

  // Check if current user is owner of this service's vendor profile
  const userVendorId = currentVendor?._id || user?.vendorId;
  const isOwnService =
    userVendorId && serviceVendorId && userVendorId.toString() === serviceVendorId.toString();

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save services to your wishlist');
      navigate('/login');
      return;
    }

    if (isOwnService) {
      toast.error('You cannot add your own service to wishlist.');
      return;
    }

    if (loading) return; // Prevent rapid duplicate requests

    try {
      setLoading(true);
      if (isSaved) {
        await remove(serviceId);
        toast.success('Removed from Wishlist');
      } else {
        await add(serviceId);
        toast.success('Saved to Wishlist');
      }
    } catch (err) {
      toast.error(err.message || 'Wishlist operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (isOwnService) {
    return (
      <span
        title="You cannot wishlist your own service"
        className={`px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs font-medium cursor-not-allowed inline-flex items-center space-x-1.5 ${className}`}
      >
        <Heart className="w-4 h-4 text-slate-600" />
        {showText && <span>Own Service</span>}
      </span>
    );
  }

  return (
    <button
      disabled={loading}
      onClick={handleToggleWishlist}
      className={`px-3 py-1.5 rounded-xl transition-all duration-200 inline-flex items-center space-x-1.5 text-xs font-bold ${
        isSaved
          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
      } ${className}`}
      title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
      ) : (
        <Heart
          className={`w-4 h-4 transition-transform ${
            isSaved ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-400'
          }`}
        />
      )}
      {showText && <span>{isSaved ? 'Saved' : 'Wishlist'}</span>}
    </button>
  );
};

export default WishlistButton;
