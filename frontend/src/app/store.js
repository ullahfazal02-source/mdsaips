import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Uses localStorage for web

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import vendorReducer from './slices/vendorSlice';
import serviceReducer from './slices/serviceSlice';
import bookingReducer from './slices/bookingSlice';

/**
 * Root Reducer Aggregation
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  vendor: vendorReducer,
  service: serviceReducer,
  booking: bookingReducer,
});

/**
 * Redux Persist Configuration
 */
const persistConfig = {
  key: 'mdsaips_root',
  version: 1,
  storage,
  whitelist: ['auth', 'ui'], // Persist auth state and UI preferences
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux Toolkit Store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export default store;
