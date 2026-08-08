import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from '@/app/store';
import AppRouter from '@/routes/AppRouter';

/**
 * Root React Application Component
 * Connects Redux Provider, PersistGate, and React Hot Toast to the AppRouter.
 */
export const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AppRouter />
      </PersistGate>
    </Provider>
  );
};

export default App;
