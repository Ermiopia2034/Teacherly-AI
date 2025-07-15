import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Semester, 
  SemesterCreatePayload, 
  SemesterUpdatePayload, 
  SemesterStats,
  SemesterListParams,
  createSemester as apiCreateSemester,
  getSemesters as apiGetSemesters,
  getCurrentSemester as apiGetCurrentSemester,
  getSemestersByAcademicYear as apiGetSemestersByAcademicYear,
  getSemesterById as apiGetSemesterById,
  updateSemester as apiUpdateSemester,
  setCurrentSemester as apiSetCurrentSemester,
  deleteSemester as apiDeleteSemester,
  getSemesterStats as apiGetSemesterStats
} from '@/lib/api/semesters';

// State interface
interface SemestersState {
  semesters: Semester[];
  currentSemester: Semester | null;
  selectedSemester: Semester | null;
  stats: SemesterStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: SemestersState = {
  semesters: [],
  currentSemester: null,
  selectedSemester: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createSemesterThunk = createAsyncThunk(
  'semesters/create',
  async (payload: SemesterCreatePayload, { rejectWithValue }) => {
    try {
      const semester = await apiCreateSemester(payload);
      return semester;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create semester';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemestersThunk = createAsyncThunk(
  'semesters/fetchAll',
  async (params: SemesterListParams = {}, { rejectWithValue }) => {
    try {
      const semesters = await apiGetSemesters(params);
      return semesters;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch semesters';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentSemesterThunk = createAsyncThunk(
  'semesters/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const currentSemester = await apiGetCurrentSemester();
      return currentSemester;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch current semester';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemestersByAcademicYearThunk = createAsyncThunk(
  'semesters/fetchByAcademicYear',
  async (academicYearId: number, { rejectWithValue }) => {
    try {
      const semesters = await apiGetSemestersByAcademicYear(academicYearId);
      return semesters;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch semesters by academic year';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemesterByIdThunk = createAsyncThunk(
  'semesters/fetchById',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const semester = await apiGetSemesterById(semesterId);
      return semester;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch semester';
      return rejectWithValue(message);
    }
  }
);

export const updateSemesterThunk = createAsyncThunk(
  'semesters/update',
  async (
    { semesterId, payload }: { semesterId: number; payload: SemesterUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const semester = await apiUpdateSemester(semesterId, payload);
      return semester;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update semester';
      return rejectWithValue(message);
    }
  }
);

export const setCurrentSemesterThunk = createAsyncThunk(
  'semesters/setCurrent',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const semester = await apiSetCurrentSemester(semesterId);
      return semester;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to set current semester';
      return rejectWithValue(message);
    }
  }
);

export const deleteSemesterThunk = createAsyncThunk(
  'semesters/delete',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      await apiDeleteSemester(semesterId);
      return semesterId;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete semester';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemesterStatsThunk = createAsyncThunk(
  'semesters/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetSemesterStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch semester statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const semestersSlice = createSlice({
  name: 'semesters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSemester: (state) => {
      state.selectedSemester = null;
    },
    setSelectedSemester: (state, action: PayloadAction<Semester>) => {
      state.selectedSemester = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create semester
    builder
      .addCase(createSemesterThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSemesterThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.semesters.push(action.payload);
        // Update stats if available
        if (state.stats) {
          state.stats.total_semesters += 1;
        }
      })
      .addCase(createSemesterThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch semesters
    builder
      .addCase(fetchSemestersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemestersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.semesters = action.payload;
      })
      .addCase(fetchSemestersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current semester
    builder
      .addCase(fetchCurrentSemesterThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSemesterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSemester = action.payload;
      })
      .addCase(fetchCurrentSemesterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch semesters by academic year
    builder
      .addCase(fetchSemestersByAcademicYearThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemestersByAcademicYearThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.semesters = action.payload;
      })
      .addCase(fetchSemestersByAcademicYearThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch semester by ID
    builder
      .addCase(fetchSemesterByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemesterByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSemester = action.payload;
      })
      .addCase(fetchSemesterByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update semester
    builder
      .addCase(updateSemesterThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSemesterThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.semesters.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.semesters[index] = action.payload;
        }
        if (state.selectedSemester?.id === action.payload.id) {
          state.selectedSemester = action.payload;
        }
        if (state.currentSemester?.id === action.payload.id) {
          state.currentSemester = action.payload;
        }
      })
      .addCase(updateSemesterThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Set current semester
    builder
      .addCase(setCurrentSemesterThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(setCurrentSemesterThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update all semesters to set is_current appropriately
        state.semesters = state.semesters.map(s => ({
          ...s,
          is_current: s.id === action.payload.id
        }));
        state.currentSemester = action.payload;
        if (state.selectedSemester?.id === action.payload.id) {
          state.selectedSemester = action.payload;
        }
      })
      .addCase(setCurrentSemesterThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete semester
    builder
      .addCase(deleteSemesterThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSemesterThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.semesters = state.semesters.filter(s => s.id !== action.payload);
        if (state.selectedSemester?.id === action.payload) {
          state.selectedSemester = null;
        }
        if (state.currentSemester?.id === action.payload) {
          state.currentSemester = null;
        }
        // Update stats if available
        if (state.stats) {
          state.stats.total_semesters -= 1;
        }
      })
      .addCase(deleteSemesterThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchSemesterStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemesterStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        // Also set current semester if available in stats
        if (action.payload.current_semester) {
          state.currentSemester = action.payload.current_semester;
        }
      })
      .addCase(fetchSemesterStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearSelectedSemester, setSelectedSemester } = semestersSlice.actions;

// Selectors
export const selectSemesters = (state: { semesters: SemestersState }) => state.semesters.semesters;
export const selectCurrentSemester = (state: { semesters: SemestersState }) => state.semesters.currentSemester;
export const selectSelectedSemester = (state: { semesters: SemestersState }) => state.semesters.selectedSemester;
export const selectSemesterStats = (state: { semesters: SemestersState }) => state.semesters.stats;
export const selectSemestersLoading = (state: { semesters: SemestersState }) => state.semesters.isLoading;
export const selectSemestersCreating = (state: { semesters: SemestersState }) => state.semesters.isCreating;
export const selectSemestersUpdating = (state: { semesters: SemestersState }) => state.semesters.isUpdating;
export const selectSemestersDeleting = (state: { semesters: SemestersState }) => state.semesters.isDeleting;
export const selectSemestersError = (state: { semesters: SemestersState }) => state.semesters.error;

// Reducer
export default semestersSlice.reducer;