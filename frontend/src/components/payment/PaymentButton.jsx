import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, ShieldCheck, X, Building2, QrCode, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import usePayment from '../../hooks/usePayment';
import loadRazorpayScript from '../../utils/loadRazorpayScript';

/**
 * PaymentButton Component
 * Supports both Official Razorpay Checkout SDK (when valid keys are configured)
 * and interactive Local Razorpay Test Mode Checkout (when operating with test order IDs).
 */
export const PaymentButton = ({ booking, onPaymentSuccess, className = '' }) => {
  const { initiatePaymentOrder, verifySignature, handleFailure } = usePayment();
  const [loading, setLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('netbanking');
  const [orderData, setOrderData] = useState(null);

  if (!booking) return null;

  const isPaid = booking.paymentStatus === 'paid';
  const totalAmount = booking.pricing?.totalAmount || 0;

  const handlePayNow = async () => {
    try {
      setLoading(true);

      // 1. Call backend create-order API
      const orderRes = await initiatePaymentOrder(booking._id);
      if (!orderRes || !orderRes.success || !orderRes.data) {
        toast.error(orderRes?.message || 'Failed to create payment order.');
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId, isMockOrder } = orderRes.data;
      setOrderData(orderRes.data);

      const isLocalTestOrder =
        isMockOrder ||
        !orderId ||
        orderId.startsWith('order_test_') ||
        !keyId ||
        keyId === 'rzp_test_MDSAIPS2026Key';

      // 2. If operating with local mock order credentials, open the interactive Test Checkout Modal
      if (isLocalTestOrder) {
        setLoading(false);
        setShowTestModal(true);
        return;
      }

      // 3. If valid external Razorpay credentials exist, dynamically load SDK and open official Checkout
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        // Fallback to test modal if Razorpay CDN is unreachable
        setLoading(false);
        setShowTestModal(true);
        return;
      }

      // 4. Configure official Razorpay Checkout Options
      const options = {
        key: keyId,
        amount: amount, // in paise
        currency: currency || 'INR',
        name: 'MDSAIPS Core Platform',
        description: `Payment for Booking Ref: ${booking.bookingNumber}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            toast.loading('Verifying payment signature with backend...', { id: 'payment-verify' });

            const verifyRes = await verifySignature({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes && verifyRes.success) {
              toast.success('Payment Verified & Completed Successfully!', { id: 'payment-verify' });
              if (onPaymentSuccess) {
                onPaymentSuccess(verifyRes.data);
              }
            } else {
              toast.error(verifyRes?.message || 'Payment signature verification failed.', { id: 'payment-verify' });
            }
          } catch (err) {
            toast.error(err.message || 'Signature verification failed.', { id: 'payment-verify' });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: booking.customerId?.name || 'Customer',
          email: booking.customerId?.email || '',
          contact: booking.customerId?.phone || '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            toast.error('Payment window closed before completion.');
            await handleFailure({ bookingId: booking._id, razorpay_order_id: orderId });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        setLoading(false);
        toast.error(`Payment Failed: ${response.error.description}`);
        await handleFailure({
          bookingId: booking._id,
          razorpay_order_id: orderId,
          error: response.error,
        });
      });

      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initialize payment.');
      setLoading(false);
    }
  };

  // Execute Simulated Test Payment Success
  const handleSimulatedTestSuccess = async () => {
    if (!orderData) return;
    try {
      setLoading(true);
      setShowTestModal(false);
      toast.loading('Processing TEST Mode signature verification...', { id: 'test-payment' });

      const mockPaymentId = `pay_test_${Date.now()}`;
      const mockSignature = 'mock_signature_test_mode';

      const verifyRes = await verifySignature({
        bookingId: booking._id,
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      });

      if (verifyRes && verifyRes.success) {
        toast.success('Razorpay TEST Mode Payment Verified & Paid!', { id: 'test-payment' });
        if (onPaymentSuccess) {
          onPaymentSuccess(verifyRes.data);
        }
      } else {
        toast.error(verifyRes?.message || 'Payment verification failed.', { id: 'test-payment' });
      }
    } catch (err) {
      toast.error(err.message || 'Payment processing error', { id: 'test-payment' });
    } finally {
      setLoading(false);
    }
  };

  // Execute Simulated Test Payment Failure / Cancellation
  const handleSimulatedTestFailure = async () => {
    if (!orderData) return;
    try {
      setLoading(true);
      setShowTestModal(false);
      toast.loading('Recording payment failure state...', { id: 'test-fail' });

      await handleFailure({
        bookingId: booking._id,
        razorpay_order_id: orderData.orderId,
        error: { description: 'Payment cancelled by user in test checkout modal' },
      });

      toast.error('Payment Failed: Transaction was cancelled or declined. You can Retry Payment anytime.', { id: 'test-fail' });
    } catch (err) {
      toast.error(err.message || 'Failed to record payment cancellation', { id: 'test-fail' });
    } finally {
      setLoading(false);
    }
  };

  if (isPaid) {
    return (
      <div className={`px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Payment Paid (₹{totalAmount.toLocaleString('en-IN')})</span>
      </div>
    );
  }

  return (
    <>
      <button
        disabled={loading}
        onClick={handlePayNow}
        className={`px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-white" />
            <span>Pay Now (₹{totalAmount.toLocaleString('en-IN')})</span>
          </>
        )}
      </button>

      {/* Interactive Razorpay TEST Mode Checkout Modal */}
      {showTestModal && orderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
            {/* Modal Header */}
            <div className="bg-indigo-600/20 border-b border-indigo-500/20 p-5 relative flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-black tracking-wider uppercase border border-indigo-400/30">
                    Razorpay TEST Mode
                  </span>
                  <span className="text-slate-400 text-xs font-mono">INR (₹)</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">MDSAIPS Core Platform</h3>
                <p className="text-xs text-slate-400 mt-0.5">Booking Ref: <span className="font-mono text-indigo-400">{booking.bookingNumber}</span></p>
              </div>

              <button
                onClick={handleSimulatedTestFailure}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Cancel Payment"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Amount Banner */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">Total Payable Amount</div>
                  <div className="text-2xl font-black text-white">
                    ₹{totalAmount.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal ml-2">({orderData.amount} paise)</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                  <span>Secure 256-bit</span>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Select Test Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('netbanking')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all text-xs ${
                      activeTab === 'netbanking'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Netbanking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('card')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all text-xs ${
                      activeTab === 'card'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('upi')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all text-xs ${
                      activeTab === 'upi'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('wallet')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all text-xs ${
                      activeTab === 'wallet'
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Wallets</span>
                  </button>
                </div>
              </div>

              {/* Order Metadata Box */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Order ID:</span>
                  <span className="text-indigo-300 font-semibold">{orderData.orderId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Currency:</span>
                  <span className="text-slate-200">{orderData.currency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <span className="text-slate-200">{booking.customerId?.name || 'Customer'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSimulatedTestSuccess}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Complete Successful Test Payment (₹{totalAmount.toLocaleString('en-IN')})</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulatedTestFailure}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Simulate Payment Failure / Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentButton;

