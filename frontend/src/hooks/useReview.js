import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitReview,
  fetchServiceReviews,
  fetchVendorReviews,
  replyToReview,
  markReviewHelpful,
  deleteReview,
  clearReviewError,
  resetReviewsState,
} from '../app/slices/reviewSlice';

export const useReview = () => {
  const dispatch = useDispatch();
  const reviewState = useSelector((state) => state.review);

  const submitNewReview = useCallback(
    async (reviewData) => {
      const result = await dispatch(submitReview(reviewData)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getServiceReviews = useCallback(
    async ({ serviceId, page = 1, limit = 10, sort = 'recent' }) => {
      const result = await dispatch(fetchServiceReviews({ serviceId, page, limit, sort })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getVendorReviews = useCallback(
    async ({ vendorId, page = 1, limit = 10, sort = 'recent' }) => {
      const result = await dispatch(fetchVendorReviews({ vendorId, page, limit, sort })).unwrap();
      return result;
    },
    [dispatch]
  );

  const postReply = useCallback(
    async ({ reviewId, message }) => {
      const result = await dispatch(replyToReview({ reviewId, message })).unwrap();
      return result;
    },
    [dispatch]
  );

  const markHelpful = useCallback(
    async (reviewId) => {
      const result = await dispatch(markReviewHelpful(reviewId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const removeReview = useCallback(
    async (reviewId) => {
      const result = await dispatch(deleteReview(reviewId)).unwrap();
      return result;
    },
    [dispatch]
  );

  const resetError = useCallback(() => {
    dispatch(clearReviewError());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetReviewsState());
  }, [dispatch]);

  return {
    ...reviewState,
    submitNewReview,
    getServiceReviews,
    getVendorReviews,
    postReply,
    markHelpful,
    removeReview,
    resetError,
    resetState,
  };
};

export default useReview;
