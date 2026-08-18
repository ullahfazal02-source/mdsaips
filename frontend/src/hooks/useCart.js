import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updatePackage,
  updateQuantity,
  clearCart,
  calculateTotals,
} from '../app/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cart);

  const addItem = useCallback(
    (serviceItem) => {
      dispatch(addToCart(serviceItem));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (serviceId) => {
      dispatch(removeFromCart(serviceId));
    },
    [dispatch]
  );

  const updatePkg = useCallback(
    (serviceId, selectedPackage, price) => {
      dispatch(updatePackage({ serviceId, selectedPackage, price }));
    },
    [dispatch]
  );

  const updateQty = useCallback(
    (serviceId, quantity) => {
      dispatch(updateQuantity({ serviceId, quantity }));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const recalculate = useCallback(() => {
    dispatch(calculateTotals());
  }, [dispatch]);

  return {
    cartItems: cartState.items,
    totalAmount: cartState.totalAmount,
    itemCount: cartState.itemCount,
    addItem,
    removeItem,
    updatePkg,
    updateQty,
    clear,
    recalculate,
  };
};

export default useCart;
