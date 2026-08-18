import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import usePayment from '../../hooks/usePayment';
import loadRazorpayScript from '../../utils/loadRazorpayScript';

/**
 * PaymentButton Component
 * Razorpay TEST Mode Checkout Trigger
 */
export const PaymentButton = ({ booking, onPaymentSuccess, className = '' }) => {
  const { initiatePaymentOrder, verifySignature, handleFailure } = usePayment();
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const isPaid = booking.paymentStatus === 'paid';
  const totalAmount = booking.pricing?.totalAmount || 0;

  const handlePayNow = async () => {
    try {
      setLoading(true);

      // 1. Dynamically Load Razorpay Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Call backend create-order API
      const orderRes = await initiatePaymentOrder(booking._id);
      if (!orderRes || !orderRes.success || !orderRes.data) {
        toast.error(orderRes?.message || 'Failed to create payment order.');
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 3. Configure Razorpay TEST Checkout Options
      const options = {
        key: keyId || 'rzp_test_MDSAIPS2026Key',
        amount: amount,
        currency: currency || 'INR',
        name: 'MDSAIPS Core Platform',
        description: `Payment for Booking Ref: ${booking.bookingNumber}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            toast.loading('Verifying payment signature with backend...', { id: 'payment-verify' });

            // 4. Send Razorpay details to backend signature verification endpoint
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

      // 4. Fallback handler if external Razorpay API is blocked or mock credentials used
      if (typeof window.Razorpay !== 'function') {
        // Fallback test payment verification for dev environments
        toast.loading('Processing TEST mode verification...', { id: 'payment-test' });
        const mockPayId = `pay_test_${Date.now()}`;
        const mockSig = 'mock_signature_test_mode';

        setTimeout(async () => {
          try {
            const verifyRes = await verifySignature({
              bookingId: booking._id,
              razorpay_order_id: orderId,
              razorpay_payment_id: mockPayId,
              razorpay_signature: mockSig,
            });

            if (verifyRes && verifyRes.success) {
              toast.success('TEST Mode Payment Verified Successfully!', { id: 'payment-test' });
              if (onPaymentSuccess) onPaymentSuccess(verifyRes.data);
            } else {
              toast.error(verifyRes?.message || 'Payment verification failed.', { id: 'payment-test' });
            }
          } catch (err) {
            toast.error(err.message || 'Verification error', { id: 'payment-test' });
          } finally {
            setLoading(false);
          }
        }, 1000);
        return;
      }

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

  if (isPaid) {
    return (
      <div className={`px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Payment Paid (₹{totalAmount.toLocaleString('en-IN')})</span>
      </div>
    );
  }

  return (
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
  );
};

export default PaymentButton;
