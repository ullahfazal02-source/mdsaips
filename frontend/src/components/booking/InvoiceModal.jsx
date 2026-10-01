import React, { useEffect, useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle, Building, User, Package } from 'lucide-react';
import useBooking from '../../hooks/useBooking';

/**
 * InvoiceModal - Renders a premium, printable invoice for a paid booking
 */
const InvoiceModal = ({ bookingId, isOpen, onClose }) => {
  const { downloadInvoice } = useBooking();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && bookingId) {
      setLoading(true);
      setError('');
      downloadInvoice(bookingId)
        .then((res) => {
          if (res.success) {
            setInvoice(res.data);
          } else {
            setError(res.error || 'Failed to load invoice.');
          }
        })
        .catch(() => setError('Failed to load invoice.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, bookingId]);

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Controls */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Tax Invoice</h2>
              <p className="text-xs text-slate-400">MDSAIPS — Multi-Domain Service Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[80vh] p-6 space-y-6">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {invoice && !loading && (
            <>
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="text-2xl font-black text-brand-400 tracking-tight">MDSAIPS</div>
                  <div className="text-xs text-slate-400 mt-1">Multi-Domain Service Aggregation & Intelligent Planning System</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end space-x-2">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                      PAID
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">
                    Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400">Booking: <span className="text-white font-mono font-bold">{invoice.bookingNumber}</span></p>
                </div>
              </div>

              {/* Billing Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase mb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Bill To (Customer)</span>
                  </div>
                  <p className="text-sm font-bold text-white">{invoice.customer?.name}</p>
                  <p className="text-xs text-slate-400">{invoice.customer?.email}</p>
                  <p className="text-xs text-slate-400">{invoice.customer?.phone}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase mb-2">
                    <Building className="w-3.5 h-3.5" />
                    <span>Service Provider</span>
                  </div>
                  <p className="text-sm font-bold text-white">{invoice.vendor?.businessName}</p>
                  <p className="text-xs text-slate-400 capitalize">{invoice.vendor?.category} Services</p>
                  <p className="text-xs text-slate-400">{invoice.vendor?.city} • {invoice.vendor?.phone}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 px-5 py-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase">
                    <Package className="w-3.5 h-3.5" />
                    <span>Service Details</span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white">{invoice.service?.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{invoice.service?.category} / {invoice.service?.subCategory}</p>
                      {invoice.service?.packageSelected && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[11px] font-bold bg-brand-500/20 text-brand-300 rounded-md capitalize">
                          Package: {invoice.service.packageSelected}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Service Date</p>
                      <p className="text-sm font-bold text-white">
                        {new Date(invoice.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 px-5 py-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase">Pricing Breakdown</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Base Amount</span>
                    <span className="text-white font-semibold">₹{invoice.pricing?.baseAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.pricing?.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400">Discount / Offer Applied</span>
                      <span className="text-emerald-400 font-semibold">- ₹{invoice.pricing.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">GST ({invoice.pricing?.gstRate})</span>
                    <span className="text-white font-semibold">₹{invoice.pricing?.taxes?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold border-t border-slate-800 pt-3">
                    <span className="text-white">Total Amount</span>
                    <span className="text-brand-400">₹{invoice.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-bold">Payment Confirmed</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{invoice.payment?.paymentId}</span>
              </div>

              <p className="text-center text-[11px] text-slate-500 italic">
                This is a computer-generated invoice and does not require a physical signature.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
