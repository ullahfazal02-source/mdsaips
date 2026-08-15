import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchServices as fetchServicesThunk,
  fetchServiceById as fetchServiceByIdThunk,
  fetchMyServices as fetchMyServicesThunk,
  createService as createServiceThunk,
  updateService as updateServiceThunk,
  toggleServiceStatus as toggleServiceStatusThunk,
  deleteService as deleteServiceThunk,
  clearServiceError as clearServiceErrorAction,
  resetCurrentService as resetCurrentServiceAction,
} from '../app/slices/serviceSlice';

/**
 * Reusable React Custom Hook for Service Operations
 */
export const useService = () => {
  const dispatch = useDispatch();
  const serviceState = useSelector((state) => state.service);

  const getServicesList = useCallback(
    (params) => dispatch(fetchServicesThunk(params)).unwrap(),
    [dispatch]
  );

  const getServiceById = useCallback(
    (id) => dispatch(fetchServiceByIdThunk(id)).unwrap(),
    [dispatch]
  );

  const getVendorServices = useCallback(
    () => dispatch(fetchMyServicesThunk()).unwrap(),
    [dispatch]
  );

  const createNewService = useCallback(
    (serviceData) => dispatch(createServiceThunk(serviceData)).unwrap(),
    [dispatch]
  );

  const updateServiceListing = useCallback(
    (id, serviceData) => dispatch(updateServiceThunk({ id, serviceData })).unwrap(),
    [dispatch]
  );

  const changeServiceStatus = useCallback(
    (id, isActive) => dispatch(toggleServiceStatusThunk({ id, isActive })).unwrap(),
    [dispatch]
  );

  const removeService = useCallback(
    (id) => dispatch(deleteServiceThunk(id)).unwrap(),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch(clearServiceErrorAction()),
    [dispatch]
  );

  const resetCurrent = useCallback(
    () => dispatch(resetCurrentServiceAction()),
    [dispatch]
  );

  return {
    ...serviceState,
    getServicesList,
    getServiceById,
    getVendorServices,
    createNewService,
    updateServiceListing,
    changeServiceStatus,
    removeService,
    clearError,
    resetCurrent,
  };
};

export default useService;
