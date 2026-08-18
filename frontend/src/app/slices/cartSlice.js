import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
};

const calculateCartTotals = (items) => {
  let count = 0;
  let total = 0;

  items.forEach((item) => {
    const qty = item.quantity || 1;
    count += qty;
    total += (item.price || 0) * qty;
  });

  return { itemCount: count, totalAmount: total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.serviceId === newItem.serviceId
      );

      if (existingIndex !== -1) {
        // Update existing entry package / price / quantity
        state.items[existingIndex] = {
          ...state.items[existingIndex],
          selectedPackage: newItem.selectedPackage || state.items[existingIndex].selectedPackage,
          price: newItem.price || state.items[existingIndex].price,
          quantity: (state.items[existingIndex].quantity || 1) + (newItem.quantity || 1),
        };
      } else {
        state.items.push({
          serviceId: newItem.serviceId,
          vendorId: newItem.vendorId,
          title: newItem.title,
          image: newItem.image || (newItem.images && newItem.images[0]) || '',
          price: newItem.price || 0,
          priceUnit: newItem.priceUnit || 'per_event',
          category: newItem.category || 'general',
          vendorName: newItem.vendorName || newItem.vendor?.businessName || 'Service Provider',
          selectedPackage: newItem.selectedPackage || 'basic',
          quantity: newItem.quantity || 1,
        });
      }

      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
    },

    removeFromCart: (state, action) => {
      const serviceId = action.payload;
      state.items = state.items.filter((item) => item.serviceId !== serviceId);
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
    },

    updatePackage: (state, action) => {
      const { serviceId, selectedPackage, price } = action.payload;
      const target = state.items.find((item) => item.serviceId === serviceId);
      if (target) {
        target.selectedPackage = selectedPackage;
        if (price !== undefined) target.price = price;
      }
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
    },

    updateQuantity: (state, action) => {
      const { serviceId, quantity } = action.payload;
      const target = state.items.find((item) => item.serviceId === serviceId);
      if (target) {
        target.quantity = Math.max(1, quantity);
      }
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.itemCount = 0;
    },

    calculateTotals: (state) => {
      const totals = calculateCartTotals(state.items);
      state.itemCount = totals.itemCount;
      state.totalAmount = totals.totalAmount;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updatePackage,
  updateQuantity,
  clearCart,
  calculateTotals,
} = cartSlice.actions;

export default cartSlice.reducer;
