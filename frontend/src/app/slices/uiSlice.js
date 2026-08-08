import { createSlice } from '@reduxjs/toolkit';

/**
 * UI & Theme State Slice Placeholder
 */
const initialState = {
  theme: 'dark', // 'dark' | 'light'
  isSidebarOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { toggleTheme, toggleSidebar, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
