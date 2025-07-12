import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Student, 
  StudentCreatePayload, 
  StudentUpdatePayload, 
  StudentStats,
  StudentListParams,
  createStudent as apiCreateStudent,
  getStudents as apiGetStudents,
  getStudentById as apiGetStudentById,
  updateStudent as apiUpdateStudent,
  deleteStudent as apiDeleteStudent,
  getStudentStats as apiGetStudentStats
} from '@/lib/api/students';

// State interface
interface StudentsState {
  students: Student[];
  currentStudent: Student | null;
  stats: StudentStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: StudentsState = {
  students: [],
  currentStudent: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createStudentThunk = createAsyncThunk(
  'students/create',
  async (payload: StudentCreatePayload, { rejectWithValue }) => {
    try {
      const student = await apiCreateStudent(payload);
      return student;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create student';
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentsThunk = createAsyncThunk(
  'students/fetchAll',
  async (params: StudentListParams = {}, { rejectWithValue }) => {
    try {
      const students = await apiGetStudents(params);
      return students;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch students';
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentByIdThunk = createAsyncThunk(
  'students/fetchById',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const student = await apiGetStudentById(studentId);
      return student;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch student';
      return rejectWithValue(message);
    }
  }
);

export const updateStudentThunk = createAsyncThunk(
  'students/update',
  async (
    { studentId, payload }: { studentId: number; payload: StudentUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const student = await apiUpdateStudent(studentId, payload);
      return student;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update student';
      return rejectWithValue(message);
    }
  }
);

export const deleteStudentThunk = createAsyncThunk(
  'students/delete',
  async (studentId: number, { rejectWithValue }) => {
    try {
      await apiDeleteStudent(studentId);
      return studentId;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete student';
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentStatsThunk = createAsyncThunk(
  'students/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetStudentStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch student statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null;
    },
    setCurrentStudent: (state, action: PayloadAction<Student>) => {
      state.currentStudent = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create student
    builder
      .addCase(createStudentThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createStudentThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.students.push(action.payload);
        // Update stats if available
        if (state.stats) {
          state.stats.total_students += 1;
        }
      })
      .addCase(createStudentThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch students
    builder
      .addCase(fetchStudentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch student by ID
    builder
      .addCase(fetchStudentByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchStudentByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update student
    builder
      .addCase(updateStudentThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStudentThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.students.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        if (state.currentStudent?.id === action.payload.id) {
          state.currentStudent = action.payload;
        }
      })
      .addCase(updateStudentThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete student
    builder
      .addCase(deleteStudentThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteStudentThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.students = state.students.filter(s => s.id !== action.payload);
        if (state.currentStudent?.id === action.payload) {
          state.currentStudent = null;
        }
        // Update stats if available
        if (state.stats) {
          state.stats.total_students -= 1;
        }
      })
      .addCase(deleteStudentThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchStudentStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStudentStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearCurrentStudent, setCurrentStudent } = studentsSlice.actions;

// Selectors
export const selectStudents = (state: { students: StudentsState }) => state.students.students;
export const selectCurrentStudent = (state: { students: StudentsState }) => state.students.currentStudent;
export const selectStudentStats = (state: { students: StudentsState }) => state.students.stats;
export const selectStudentsLoading = (state: { students: StudentsState }) => state.students.isLoading;
export const selectStudentsCreating = (state: { students: StudentsState }) => state.students.isCreating;
export const selectStudentsUpdating = (state: { students: StudentsState }) => state.students.isUpdating;
export const selectStudentsDeleting = (state: { students: StudentsState }) => state.students.isDeleting;
export const selectStudentsError = (state: { students: StudentsState }) => state.students.error;

// Reducer
export default studentsSlice.reducer;