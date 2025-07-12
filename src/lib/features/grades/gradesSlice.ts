import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Grade, 
  GradeCreatePayload, 
  GradeUpdatePayload, 
  GradeStats,
  GradeListParams,
  createGrade as apiCreateGrade,
  getGrades as apiGetGrades,
  getGradeById as apiGetGradeById,
  getStudentGrades as apiGetStudentGrades,
  getContentGrades as apiGetContentGrades,
  updateGrade as apiUpdateGrade,
  deleteGrade as apiDeleteGrade,
  getGradeStats as apiGetGradeStats
} from '@/lib/api/grades';

// State interface
interface GradesState {
  grades: Grade[];
  currentGrade: Grade | null;
  stats: GradeStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: GradesState = {
  grades: [],
  currentGrade: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createGradeThunk = createAsyncThunk(
  'grades/create',
  async (payload: GradeCreatePayload, { rejectWithValue }) => {
    try {
      const grade = await apiCreateGrade(payload);
      return grade;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create grade';
      return rejectWithValue(message);
    }
  }
);

export const fetchGradesThunk = createAsyncThunk(
  'grades/fetchAll',
  async (params: GradeListParams = {}, { rejectWithValue }) => {
    try {
      const grades = await apiGetGrades(params);
      return grades;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch grades';
      return rejectWithValue(message);
    }
  }
);

export const fetchGradeByIdThunk = createAsyncThunk(
  'grades/fetchById',
  async (gradeId: number, { rejectWithValue }) => {
    try {
      const grade = await apiGetGradeById(gradeId);
      return grade;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch grade';
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentGradesThunk = createAsyncThunk(
  'grades/fetchByStudent',
  async ({ studentId, params = {} }: { studentId: number; params?: GradeListParams }, { rejectWithValue }) => {
    try {
      const grades = await apiGetStudentGrades(studentId, params);
      return grades;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch student grades';
      return rejectWithValue(message);
    }
  }
);

export const fetchContentGradesThunk = createAsyncThunk(
  'grades/fetchByContent',
  async ({ contentId, params = {} }: { contentId: number; params?: GradeListParams }, { rejectWithValue }) => {
    try {
      const grades = await apiGetContentGrades(contentId, params);
      return grades;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch content grades';
      return rejectWithValue(message);
    }
  }
);

export const updateGradeThunk = createAsyncThunk(
  'grades/update',
  async (
    { gradeId, payload }: { gradeId: number; payload: GradeUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const grade = await apiUpdateGrade(gradeId, payload);
      return grade;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update grade';
      return rejectWithValue(message);
    }
  }
);

export const deleteGradeThunk = createAsyncThunk(
  'grades/delete',
  async (gradeId: number, { rejectWithValue }) => {
    try {
      await apiDeleteGrade(gradeId);
      return gradeId;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete grade';
      return rejectWithValue(message);
    }
  }
);

export const fetchGradeStatsThunk = createAsyncThunk(
  'grades/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetGradeStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch grade statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGrade: (state) => {
      state.currentGrade = null;
    },
    setCurrentGrade: (state, action: PayloadAction<Grade>) => {
      state.currentGrade = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create grade
    builder
      .addCase(createGradeThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createGradeThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.grades.unshift(action.payload); // Add to beginning of list
      })
      .addCase(createGradeThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch grades
    builder
      .addCase(fetchGradesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGradesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.grades = action.payload;
      })
      .addCase(fetchGradesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch grade by ID
    builder
      .addCase(fetchGradeByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGradeByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGrade = action.payload;
      })
      .addCase(fetchGradeByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch student grades
    builder
      .addCase(fetchStudentGradesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentGradesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.grades = action.payload;
      })
      .addCase(fetchStudentGradesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch content grades
    builder
      .addCase(fetchContentGradesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContentGradesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.grades = action.payload;
      })
      .addCase(fetchContentGradesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update grade
    builder
      .addCase(updateGradeThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateGradeThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.grades.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.grades[index] = action.payload;
        }
        if (state.currentGrade?.id === action.payload.id) {
          state.currentGrade = action.payload;
        }
      })
      .addCase(updateGradeThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete grade
    builder
      .addCase(deleteGradeThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteGradeThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.grades = state.grades.filter(g => g.id !== action.payload);
        if (state.currentGrade?.id === action.payload) {
          state.currentGrade = null;
        }
      })
      .addCase(deleteGradeThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchGradeStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGradeStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchGradeStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearCurrentGrade, setCurrentGrade } = gradesSlice.actions;

// Selectors
export const selectGrades = (state: { grades: GradesState }) => state.grades.grades;
export const selectCurrentGrade = (state: { grades: GradesState }) => state.grades.currentGrade;
export const selectGradeStats = (state: { grades: GradesState }) => state.grades.stats;
export const selectGradesLoading = (state: { grades: GradesState }) => state.grades.isLoading;
export const selectGradesCreating = (state: { grades: GradesState }) => state.grades.isCreating;
export const selectGradesUpdating = (state: { grades: GradesState }) => state.grades.isUpdating;
export const selectGradesDeleting = (state: { grades: GradesState }) => state.grades.isDeleting;
export const selectGradesError = (state: { grades: GradesState }) => state.grades.error;

// Reducer
export default gradesSlice.reducer;