import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWishlist,
  fetchWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  updateWishlistNote,
  clearWishlistError,
} from '../app/slices/wishlistSlice';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlistState = useSelector((state) => state.wishlist);

  const refreshWishlist = useCallback(async () => {
    const result = await dispatch(fetchWishlist()).unwrap();
    return result;
  }, [dispatch]);

  const refreshCount = useCallback(async () => {
    const result = await dispatch(fetchWishlistCount()).unwrap();
    return result;
  }, [dispatch]);

  const add = useCallback(
    async (serviceId, note = '') => {
      const result = await dispatch(addToWishlist({ serviceId, note })).unwrap();
      dispatch(fetchWishlistCount());
      return result;
    },
    [dispatch]
  );

  const remove = useCallback(
    async (serviceId) => {
      const result = await dispatch(removeFromWishlist(serviceId)).unwrap();
      dispatch(fetchWishlistCount());
      return result;
    },
    [dispatch]
  );

  const clear = useCallback(async () => {
    const result = await dispatch(clearWishlist()).unwrap();
    dispatch(fetchWishlistCount());
    return result;
  }, [dispatch]);

  const updateNote = useCallback(
    async (serviceId, note) => {
      const result = await dispatch(updateWishlistNote({ serviceId, note })).unwrap();
      return result;
    },
    [dispatch]
  );

  const resetError = useCallback(() => {
    dispatch(clearWishlistError());
  }, [dispatch]);

  return {
    wishlist: wishlistState.items,
    count: wishlistState.count,
    loading: wishlistState.loading,
    error: wishlistState.error,
    refresh: refreshWishlist,
    refreshCount,
    add,
    remove,
    clear,
    updateNote,
    resetError,
  };
};

export default useWishlist;
