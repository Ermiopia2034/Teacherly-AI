import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  AcademicYear, 
  AcademicYearCreatePayload, 
  AcademicYearUpdatePayload, 
  AcademicYearStats,
  AcademicYearListParams,
  createAcademicYear as apiCreateAcademicYear,
  getAcademicYears as apiGetAcademicYears,
  getCurrentAcademicYear as apiGetCurrentAcademicYear,
  getAcademicYearById as apiGetAcademicYearById,
  updateAcademicYear as apiUpdateAcademicYear,
  setCurrentAcademicYear as apiSetCurrentAcademicYear,
  deleteAcademicYear as apiDeleteAcademicYear,
  getAcademicYearStats as apiGetAcademicYearStats
} from '@/lib/api/academicYears';

// State interface
interface AcademicYearsState {
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear | null;
  selectedAcademicYear: AcademicYear | null;
  stats: AcademicYearStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: AcademicYearsState = {
  academicYears: [],
  currentAcademicYear: null,
  selectedAcademicYear: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createAcademicYearThunk = createAsyncThunk(
  'academicYears/create',
  async (payload: AcademicYearCreatePayload, { rejectWithValue }) => {
    try {
      const academicYear = await apiCreateAcademicYear(payload);
      return academicYear;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create academic year';
      return rejectWithValue(message);
    }
  }
);

export const fetchAcademicYearsThunk = createAsyncThunk(
  'academicYears/fetchAll',
  async (params: AcademicYearListParams = {}, { rejectWithValue }) => {
    try {
      const academicYears = await apiGetAcademicYears(params);
      return academicYears;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch academic years';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentAcademicYearThunk = createAsyncThunk(
  'academicYears/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const currentAcademicYear = await apiGetCurrentAcademicYear();
      return currentAcademicYear;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch current academic year';
      return rejectWithValue(message);
    }
  }
);

export const fetchAcademicYearByIdThunk = createAsyncThunk(
  'academicYears/fetchById',
  async (academicYearId: number, { rejectWithValue }) => {
    try {
      const academicYear = await apiGetAcademicYearById(academicYearId);
      return academicYear;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch academic year';
      return rejectWithValue(message);
    }
  }
);

export const updateAcademicYearThunk = createAsyncThunk(
  'academicYears/update',
  async (
    { academicYearId, payload }: { academicYearId: number; payload: AcademicYearUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const academicYear = await apiUpdateAcademicYear(academicYearId, payload);
      return academicYear;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update academic year';
      return rejectWithValue(message);
    }
  }
);

export const setCurrentAcademicYearThunk = createAsyncThunk(
  'academicYears/setCurrent',
  async (academicYearId: number, { rejectWithValue }) => {
    try {
      const academicYear = await apiSetCurrentAcademicYear(academicYearId);
      return academicYear;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to set current academic year';
      return rejectWithValue(message);
    }
  }
);

export const deleteAcademicYearThunk = createAsyncThunk(
  'academicYears/delete',
  async (academicYearId: number, { rejectWithValue }) => {
    try {
      await apiDeleteAcademicYear(academicYearId);
      return academicYearId;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete academic year';
      return rejectWithValue(message);
    }
  }
);

export const fetchAcademicYearStatsThunk = createAsyncThunk(
  'academicYears/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetAcademicYearStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch academic year statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const academicYearsSlice = createSlice({
  name: 'academicYears',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAcademicYear: (state) => {
      state.selectedAcademicYear = null;
    },
    setSelectedAcademicYear: (state, action: PayloadAction<AcademicYear>) => {
      state.selectedAcademicYear = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create academic year
    builder
      .addCase(createAcademicYearThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAcademicYearThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.academicYears.push(action.payload);
        // Update stats if available
        if (state.stats) {
          state.stats.total_academic_years += 1;
        }
      })
      .addCase(createAcademicYearThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch academic years
    builder
      .addCase(fetchAcademicYearsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYearsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.academicYears = action.payload;
      })
      .addCase(fetchAcademicYearsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current academic year
    builder
      .addCase(fetchCurrentAcademicYearThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentAcademicYearThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAcademicYear = action.payload;
      })
      .addCase(fetchCurrentAcademicYearThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch academic year by ID
    builder
      .addCase(fetchAcademicYearByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYearByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAcademicYear = action.payload;
      })
      .addCase(fetchAcademicYearByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update academic year
    builder
      .addCase(updateAcademicYearThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAcademicYearThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.academicYears.findIndex(ay => ay.id === action.payload.id);
        if (index !== -1) {
          state.academicYears[index] = action.payload;
        }
        if (state.selectedAcademicYear?.id === action.payload.id) {
          state.selectedAcademicYear = action.payload;
        }
        if (state.currentAcademicYear?.id === action.payload.id) {
          state.currentAcademicYear = action.payload;
        }
      })
      .addCase(updateAcademicYearThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Set current academic year
    builder
      .addCase(setCurrentAcademicYearThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(setCurrentAcademicYearThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update all academic years to set is_current appropriately
        state.academicYears = state.academicYears.map(ay => ({
          ...ay,
          is_current: ay.id === action.payload.id
        }));
        state.currentAcademicYear = action.payload;
        if (state.selectedAcademicYear?.id === action.payload.id) {
          state.selectedAcademicYear = action.payload;
        }
      })
      .addCase(setCurrentAcademicYearThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete academic year
    builder
      .addCase(deleteAcademicYearThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAcademicYearThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.academicYears = state.academicYears.filter(ay => ay.id !== action.payload);
        if (state.selectedAcademicYear?.id === action.payload) {
          state.selectedAcademicYear = null;
        }
        if (state.currentAcademicYear?.id === action.payload) {
          state.currentAcademicYear = null;
        }
        // Update stats if available
        if (state.stats) {
          state.stats.total_academic_years -= 1;
        }
      })
      .addCase(deleteAcademicYearThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchAcademicYearStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYearStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        // Also set current academic year if available in stats
        if (action.payload.current_academic_year) {
          state.currentAcademicYear = action.payload.current_academic_year;
        }
      })
      .addCase(fetchAcademicYearStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearSelectedAcademicYear, setSelectedAcademicYear } = academicYearsSlice.actions;

// Selectors
export const selectAcademicYears = (state: { academicYears: AcademicYearsState }) => state.academicYears.academicYears;
export const selectCurrentAcademicYear = (state: { academicYears: AcademicYearsState }) => state.academicYears.currentAcademicYear;
export const selectSelectedAcademicYear = (state: { academicYears: AcademicYearsState }) => state.academicYears.selectedAcademicYear;
export const selectAcademicYearStats = (state: { academicYears: AcademicYearsState }) => state.academicYears.stats;
export const selectAcademicYearsLoading = (state: { academicYears: AcademicYearsState }) => state.academicYears.isLoading;
export const selectAcademicYearsCreating = (state: { academicYears: AcademicYearsState }) => state.academicYears.isCreating;
export const selectAcademicYearsUpdating = (state: { academicYears: AcademicYearsState }) => state.academicYears.isUpdating;
export const selectAcademicYearsDeleting = (state: { academicYears: AcademicYearsState }) => state.academicYears.isDeleting;
export const selectAcademicYearsError = (state: { academicYears: AcademicYearsState }) => state.academicYears.error;

// Reducer
export default academicYearsSlice.reducer;