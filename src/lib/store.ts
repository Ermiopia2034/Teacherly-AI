import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import generationReducer from './features/generation/generationSlice';
import contentReducer from './features/content/contentSlice';
import studentsReducer from './features/students/studentsSlice';
import gradesReducer from './features/grades/gradesSlice';
import gradingReducer from './features/grading/gradingSlice';
import attendanceReducer from './features/attendance/attendanceSlice';
import reportsReducer from './features/reports/reportsSlice';
import settingsReducer from './features/settings/settingsSlice';
import academicYearsReducer from './features/academic/academicYearsSlice';
import semestersReducer from './features/academic/semestersSlice';
import sectionsReducer from './features/academic/sectionsSlice';
import enrollmentsReducer from './features/academic/enrollmentsSlice';
import markAllocationReducer from './features/academic/markAllocationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    generation: generationReducer,
    content: contentReducer,
    students: studentsReducer,
    grades: gradesReducer,
    grading: gradingReducer,
    attendance: attendanceReducer,
    reports: reportsReducer,
    settings: settingsReducer,
    academicYears: academicYearsReducer,
    semesters: semestersReducer,
    sections: sectionsReducer,
    enrollments: enrollmentsReducer,
    markAllocation: markAllocationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;