import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  MarkAllocationSummary,
  SemesterMarkLimit,
  AllocatedMarks,
  RemainingMarks,
  MarkValidationPayload,
  MarkValidationResult,
  getSemesterAllocationSummary as apiGetSemesterAllocationSummary,
  getSemesterMarkLimit as apiGetSemesterMarkLimit,
  getSemesterAllocatedMarks as apiGetSemesterAllocatedMarks,
  getSemesterRemainingMarks as apiGetSemesterRemainingMarks,
  validateMarkAllocation as apiValidateMarkAllocation,
  getCurrentSemesterAllocation as apiGetCurrentSemesterAllocation
} from '@/lib/api/markAllocation';

// State interface
interface MarkAllocationState {
  currentSemesterAllocation: MarkAllocationSummary | null;
  selectedSemesterAllocation: MarkAllocationSummary | null;
  semesterMarkLimit: SemesterMarkLimit | null;
  allocatedMarks: AllocatedMarks | null;
  remainingMarks: RemainingMarks | null;
  lastValidationResult: MarkValidationResult | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
}

// Initial state
const initialState: MarkAllocationState = {
  currentSemesterAllocation: null,
  selectedSemesterAllocation: null,
  semesterMarkLimit: null,
  allocatedMarks: null,
  remainingMarks: null,
  lastValidationResult: null,
  isLoading: false,
  isValidating: false,
  error: null,
};

// Async thunks
export const fetchCurrentSemesterAllocationThunk = createAsyncThunk(
  'markAllocation/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const allocation = await apiGetCurrentSemesterAllocation();
      return allocation;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch current semester allocation';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemesterAllocationSummaryThunk = createAsyncThunk(
  'markAllocation/fetchSummary',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const allocation = await apiGetSemesterAllocationSummary(semesterId);
      return allocation;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch semester allocation summary';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemesterMarkLimitThunk = createAsyncThunk(
  'markAllocation/fetchLimit',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const limit = await apiGetSemesterMarkLimit(semesterId);
      return limit;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch semester mark limit';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemesterAllocatedMarksThunk = createAsyncThunk(
  'markAllocation/fetchAllocated',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const allocated = await apiGetSemesterAllocatedMarks(semesterId);
      return allocated;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch allocated marks';
      return rejectWithValue(message);
    }
  }
);

export const fetchSemesterRemainingMarksThunk = createAsyncThunk(
  'markAllocation/fetchRemaining',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const remaining = await apiGetSemesterRemainingMarks(semesterId);
      return remaining;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch remaining marks';
      return rejectWithValue(message);
    }
  }
);

export const validateMarkAllocationThunk = createAsyncThunk(
  'markAllocation/validate',
  async (
    { semesterId, payload }: { semesterId: number; payload: MarkValidationPayload },
    { rejectWithValue }
  ) => {
    try {
      const result = await apiValidateMarkAllocation(semesterId, payload);
      return result;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to validate mark allocation';
      return rejectWithValue(message);
    }
  }
);

// Slice
const markAllocationSlice = createSlice({
  name: 'markAllocation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearValidationResult: (state) => {
      state.lastValidationResult = null;
    },
    setSelectedSemesterAllocation: (state, action: PayloadAction<MarkAllocationSummary>) => {
      state.selectedSemesterAllocation = action.payload;
    },
    clearSelectedSemesterAllocation: (state) => {
      state.selectedSemesterAllocation = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch current semester allocation
    builder
      .addCase(fetchCurrentSemesterAllocationThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSemesterAllocationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSemesterAllocation = action.payload;
      })
      .addCase(fetchCurrentSemesterAllocationThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch semester allocation summary
    builder
      .addCase(fetchSemesterAllocationSummaryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemesterAllocationSummaryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSemesterAllocation = action.payload;
      })
      .addCase(fetchSemesterAllocationSummaryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch semester mark limit
    builder
      .addCase(fetchSemesterMarkLimitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemesterMarkLimitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.semesterMarkLimit = action.payload;
      })
      .addCase(fetchSemesterMarkLimitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch allocated marks
    builder
      .addCase(fetchSemesterAllocatedMarksThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemesterAllocatedMarksThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allocatedMarks = action.payload;
      })
      .addCase(fetchSemesterAllocatedMarksThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch remaining marks
    builder
      .addCase(fetchSemesterRemainingMarksThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSemesterRemainingMarksThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.remainingMarks = action.payload;
      })
      .addCase(fetchSemesterRemainingMarksThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate mark allocation
    builder
      .addCase(validateMarkAllocationThunk.pending, (state) => {
        state.isValidating = true;
        state.error = null;
      })
      .addCase(validateMarkAllocationThunk.fulfilled, (state, action) => {
        state.isValidating = false;
        state.lastValidationResult = action.payload;
      })
      .addCase(validateMarkAllocationThunk.rejected, (state, action) => {
        state.isValidating = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { 
  clearError, 
  clearValidationResult, 
  setSelectedSemesterAllocation, 
  clearSelectedSemesterAllocation 
} = markAllocationSlice.actions;

// Selectors
export const selectCurrentSemesterAllocation = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.currentSemesterAllocation;
export const selectSelectedSemesterAllocation = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.selectedSemesterAllocation;
export const selectSemesterMarkLimit = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.semesterMarkLimit;
export const selectAllocatedMarks = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.allocatedMarks;
export const selectRemainingMarks = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.remainingMarks;
export const selectLastValidationResult = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.lastValidationResult;
export const selectMarkAllocationLoading = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.isLoading;
export const selectMarkAllocationValidating = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.isValidating;
export const selectMarkAllocationError = (state: { markAllocation: MarkAllocationState }) => state.markAllocation.error;

// Reducer
export default markAllocationSlice.reducer;