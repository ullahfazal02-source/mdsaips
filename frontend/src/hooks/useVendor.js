import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVendors as fetchVendorsThunk,
  fetchVendorById as fetchVendorByIdThunk,
  registerVendor as registerVendorThunk,
  updateVendor as updateVendorThunk,
  fetchAvailability as fetchAvailabilityThunk,
  updateAvailability as updateAvailabilityThunk,
  updateCancellationPolicy as updateCancellationPolicyThunk,
  uploadVerificationDocuments as uploadVerificationDocumentsThunk,
  fetchVendorDashboardStats as fetchVendorDashboardStatsThunk,
  fetchPendingVendors as fetchPendingVendorsThunk,
  verifyVendor as verifyVendorThunk,
  clearVendorError as clearVendorErrorAction,
  resetCurrentVendor as resetCurrentVendorAction,
} from '../app/slices/vendorSlice';

/**
 * Reusable React Hook for Vendor Operations
 */
export const useVendor = () => {
  const dispatch = useDispatch();
  const vendorState = useSelector((state) => state.vendor);

  const getVendorsList = useCallback(
    (params) => dispatch(fetchVendorsThunk(params)).unwrap(),
    [dispatch]
  );

  const getVendorById = useCallback(
    (id) => dispatch(fetchVendorByIdThunk(id)).unwrap(),
    [dispatch]
  );

  const createVendorProfile = useCallback(
    (vendorData) => dispatch(registerVendorThunk(vendorData)).unwrap(),
    [dispatch]
  );

  const updateVendorProfile = useCallback(
    (id, vendorData) => dispatch(updateVendorThunk({ id, vendorData })).unwrap(),
    [dispatch]
  );

  const getVendorAvailability = useCallback(
    (id, startDate, endDate) => dispatch(fetchAvailabilityThunk({ id, startDate, endDate })).unwrap(),
    [dispatch]
  );

  const setVendorAvailability = useCallback(
    (id, availability) => dispatch(updateAvailabilityThunk({ id, availability })).unwrap(),
    [dispatch]
  );

  const setCancellationPolicy = useCallback(
    (id, policyData) => dispatch(updateCancellationPolicyThunk({ id, policyData })).unwrap(),
    [dispatch]
  );

  const submitDocuments = useCallback(
    (documents) => dispatch(uploadVerificationDocumentsThunk(documents)).unwrap(),
    [dispatch]
  );

  const getDashboardStats = useCallback(
    () => dispatch(fetchVendorDashboardStatsThunk()).unwrap(),
    [dispatch]
  );

  const getPendingVendorsList = useCallback(
    (params) => dispatch(fetchPendingVendorsThunk(params)).unwrap(),
    [dispatch]
  );

  const verifyVendorAccount = useCallback(
    (id, approved, reason) => dispatch(verifyVendorThunk({ id, approved, reason })).unwrap(),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch(clearVendorErrorAction()),
    [dispatch]
  );

  const resetCurrent = useCallback(
    () => dispatch(resetCurrentVendorAction()),
    [dispatch]
  );

  return {
    ...vendorState,
    getVendorsList,
    getVendorById,
    createVendorProfile,
    updateVendorProfile,
    getVendorAvailability,
    setVendorAvailability,
    setCancellationPolicy,
    submitDocuments,
    getDashboardStats,
    getPendingVendorsList,
    verifyVendorAccount,
    clearError,
    resetCurrent,
  };
};

export default useVendor;
