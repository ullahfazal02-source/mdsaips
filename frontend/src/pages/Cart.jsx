import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Package,
  Plus,
  Minus,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useCart from '../hooks/useCart';

export const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, itemCount, removeItem, updatePkg, updateQty, clear } = useCart();

  const gstEstimate = Math.round(totalAmount * 0.18);
  const grandTotalEstimate = totalAmount + gstEstimate;

  const handlePackageChange = (serviceId, pkgName, price) => {
    updatePkg(serviceId, pkgName, price);
  };

  const handleClearCart = () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    clear();
    toast.success('Cart cleared');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Multi-Service Booking Cart</h1>
            <p className="text-xs text-slate-400 mt-1">
              Bundle services across multiple vendors to prepare unified multi-service reservation requests.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
            {itemCount} Item(s) Selected
          </span>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Your Cart is Empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select services from the marketplace or move items from your saved wishlist to prepare a multi-service booking bundle.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-lg shadow-brand-600/30 transition-all"
          >
            <span>Browse Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const {
                serviceId,
                title,
                vendorName,
                image,
                price = 0,
                priceUnit = 'per_event',
                selectedPackage = 'basic',
                quantity = 1,
              } = item;

              return (
                <div key={serviceId} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500 font-bold text-xs">
                          NO IMG
                        </div>
                      )}

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
                        <p className="text-xs text-slate-400">
                          Provider: <strong className="text-slate-200">{vendorName}</strong>
                        </p>

                        <div className="flex items-center space-x-3 pt-1">
                          <span className="text-sm font-extrabold text-emerald-400">
                            ₹{(price * quantity).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400">
                            (₹{price.toLocaleString('en-IN')} / {priceUnit})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(serviceId)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors self-end sm:self-center"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Package Selector & Quantity Controls */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Package Selector */}
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-400 font-semibold">Package Tier:</span>
                      <div className="flex space-x-1">
                        {['basic', 'standard', 'premium'].map((pkg) => (
                          <button
                            key={pkg}
                            onClick={() => handlePackageChange(serviceId, pkg, price)}
                            className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                              selectedPackage === pkg
                                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {pkg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-semibold">Qty:</span>
                      <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button
                          onClick={() => updateQty(serviceId, quantity - 1)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-bold text-white text-xs">{quantity}</span>
                        <button
                          onClick={() => updateQty(serviceId, quantity + 1)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Price Breakdown Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Price Estimation</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Est. GST (18%)</span>
                  <span>₹{gstEstimate.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-extrabold text-white">
                  <span>Grand Total Estimate</span>
                  <span className="text-lg text-brand-400">₹{grandTotalEstimate.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
                <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  This is an estimated price preview. The backend server remains authoritative for final booking pricing.
                </span>
              </div>

              <button
                onClick={() => navigate('/cart/checkout')}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Multi-Service Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
