import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPaymentOrder,
  verifyPayment,
  reportPaymentFailure,
  fetchPaymentHistory,
  fetchPaymentByBooking,
  clearPaymentError,
  clearActiveOrder,
} from '../app/slices/paymentSlice';

export const usePayment = () => {
  const dispatch = useDispatch();
  const paymentState = useSelector((state) => state.payment);

  const initiatePaymentOrder = useCallback(
    async (bookingId) => {
      const result = await dispatch(createPaymentOrder({ bookingId })).unwrap();
      return result;
    },
    [dispatch]
  );

  const verifySignature = useCallback(
    async (verificationPayload) => {
      const result = await dispatch(verifyPayment(verificationPayload)).unwrap();
      return result;
    },
    [dispatch]
  );

  const handleFailure = useCallback(
    async (failurePayload) => {
      const result = await dispatch(reportPaymentFailure(failurePayload)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getHistory = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchPaymentHistory(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getPaymentDetails = useCallback(
    async (bookingId) => {
      const result = await dispatch(fetchPaymentByBooking(bookingId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const resetError = useCallback(() => {
    dispatch(clearPaymentError());
  }, [dispatch]);

  const resetOrder = useCallback(() => {
    dispatch(clearActiveOrder());
  }, [dispatch]);

  return {
    ...paymentState,
    initiatePaymentOrder,
    verifySignature,
    handleFailure,
    getHistory,
    getPaymentDetails,
    resetError,
    resetOrder,
  };
};

export default usePayment;
