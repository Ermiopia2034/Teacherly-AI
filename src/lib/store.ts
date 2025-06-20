import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import generationReducer from './features/generation/generationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    generation: generationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;