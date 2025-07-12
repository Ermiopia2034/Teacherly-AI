import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import generationReducer from './features/generation/generationSlice';
import contentReducer from './features/content/contentSlice';
import studentsReducer from './features/students/studentsSlice';
import gradesReducer from './features/grades/gradesSlice';
import attendanceReducer from './features/attendance/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    generation: generationReducer,
    content: contentReducer,
    students: studentsReducer,
    grades: gradesReducer,
    attendance: attendanceReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;