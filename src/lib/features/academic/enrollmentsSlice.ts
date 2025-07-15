import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  StudentEnrollment, 
  StudentEnrollmentCreatePayload, 
  BulkEnrollmentPayload,
  StudentEnrollmentUpdatePayload, 
  EnrollmentStats,
  EnrollmentListParams,
  createEnrollment as apiCreateEnrollment,
  createBulkEnrollments as apiCreateBulkEnrollments,
  getEnrollments as apiGetEnrollments,
  getEnrollmentsBySection as apiGetEnrollmentsBySection,
  getEnrollmentsByStudent as apiGetEnrollmentsByStudent,
  getEnrollmentById as apiGetEnrollmentById,
  updateEnrollment as apiUpdateEnrollment,
  deleteEnrollment as apiDeleteEnrollment,
  getEnrollmentStats as apiGetEnrollmentStats
} from '@/lib/api/enrollments';

// State interface
interface EnrollmentsState {
  enrollments: StudentEnrollment[];
  selectedEnrollment: StudentEnrollment | null;
  stats: EnrollmentStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: EnrollmentsState = {
  enrollments: [],
  selectedEnrollment: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createEnrollmentThunk = createAsyncThunk(
  'enrollments/create',
  async (payload: StudentEnrollmentCreatePayload, { rejectWithValue }) => {
    try {
      const enrollment = await apiCreateEnrollment(payload);
      return enrollment;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create enrollment';
      return rejectWithValue(message);
    }
  }
);

export const createBulkEnrollmentsThunk = createAsyncThunk(
  'enrollments/createBulk',
  async (payload: BulkEnrollmentPayload, { rejectWithValue }) => {
    try {
      const enrollments = await apiCreateBulkEnrollments(payload);
      return enrollments;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create bulk enrollments';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentsThunk = createAsyncThunk(
  'enrollments/fetchAll',
  async (params: EnrollmentListParams = {}, { rejectWithValue }) => {
    try {
      const enrollments = await apiGetEnrollments(params);
      return enrollments;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch enrollments';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentsBySectionThunk = createAsyncThunk(
  'enrollments/fetchBySection',
  async (sectionId: number, { rejectWithValue }) => {
    try {
      const enrollments = await apiGetEnrollmentsBySection(sectionId);
      return enrollments;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch enrollments by section';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentsByStudentThunk = createAsyncThunk(
  'enrollments/fetchByStudent',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const enrollments = await apiGetEnrollmentsByStudent(studentId);
      return enrollments;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch enrollments by student';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentByIdThunk = createAsyncThunk(
  'enrollments/fetchById',
  async (enrollmentId: number, { rejectWithValue }) => {
    try {
      const enrollment = await apiGetEnrollmentById(enrollmentId);
      return enrollment;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch enrollment';
      return rejectWithValue(message);
    }
  }
);

export const updateEnrollmentThunk = createAsyncThunk(
  'enrollments/update',
  async (
    { enrollmentId, payload }: { enrollmentId: number; payload: StudentEnrollmentUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const enrollment = await apiUpdateEnrollment(enrollmentId, payload);
      return enrollment;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update enrollment';
      return rejectWithValue(message);
    }
  }
);

export const deleteEnrollmentThunk = createAsyncThunk(
  'enrollments/delete',
  async (enrollmentId: number, { rejectWithValue }) => {
    try {
      await apiDeleteEnrollment(enrollmentId);
      return enrollmentId;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete enrollment';
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrollmentStatsThunk = createAsyncThunk(
  'enrollments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetEnrollmentStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch enrollment statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedEnrollment: (state) => {
      state.selectedEnrollment = null;
    },
    setSelectedEnrollment: (state, action: PayloadAction<StudentEnrollment>) => {
      state.selectedEnrollment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create enrollment
    builder
      .addCase(createEnrollmentThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createEnrollmentThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.enrollments.push(action.payload);
        // Update stats if available
        if (state.stats) {
          state.stats.total_enrollments += 1;
        }
      })
      .addCase(createEnrollmentThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Create bulk enrollments
    builder
      .addCase(createBulkEnrollmentsThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBulkEnrollmentsThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.enrollments.push(...action.payload);
        // Update stats if available
        if (state.stats) {
          state.stats.total_enrollments += action.payload.length;
        }
      })
      .addCase(createBulkEnrollmentsThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch enrollments
    builder
      .addCase(fetchEnrollmentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollmentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch enrollments by section
    builder
      .addCase(fetchEnrollmentsBySectionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentsBySectionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollmentsBySectionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch enrollments by student
    builder
      .addCase(fetchEnrollmentsByStudentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentsByStudentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollmentsByStudentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch enrollment by ID
    builder
      .addCase(fetchEnrollmentByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEnrollment = action.payload;
      })
      .addCase(fetchEnrollmentByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update enrollment
    builder
      .addCase(updateEnrollmentThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateEnrollmentThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.enrollments.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
        if (state.selectedEnrollment?.id === action.payload.id) {
          state.selectedEnrollment = action.payload;
        }
      })
      .addCase(updateEnrollmentThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete enrollment
    builder
      .addCase(deleteEnrollmentThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteEnrollmentThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.enrollments = state.enrollments.filter(e => e.id !== action.payload);
        if (state.selectedEnrollment?.id === action.payload) {
          state.selectedEnrollment = null;
        }
        // Update stats if available
        if (state.stats) {
          state.stats.total_enrollments -= 1;
        }
      })
      .addCase(deleteEnrollmentThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchEnrollmentStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchEnrollmentStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearSelectedEnrollment, setSelectedEnrollment } = enrollmentsSlice.actions;

// Selectors
export const selectEnrollments = (state: { enrollments: EnrollmentsState }) => state.enrollments.enrollments;
export const selectSelectedEnrollment = (state: { enrollments: EnrollmentsState }) => state.enrollments.selectedEnrollment;
export const selectEnrollmentStats = (state: { enrollments: EnrollmentsState }) => state.enrollments.stats;
export const selectEnrollmentsLoading = (state: { enrollments: EnrollmentsState }) => state.enrollments.isLoading;
export const selectEnrollmentsCreating = (state: { enrollments: EnrollmentsState }) => state.enrollments.isCreating;
export const selectEnrollmentsUpdating = (state: { enrollments: EnrollmentsState }) => state.enrollments.isUpdating;
export const selectEnrollmentsDeleting = (state: { enrollments: EnrollmentsState }) => state.enrollments.isDeleting;
export const selectEnrollmentsError = (state: { enrollments: EnrollmentsState }) => state.enrollments.error;

// Reducer
export default enrollmentsSlice.reducer;