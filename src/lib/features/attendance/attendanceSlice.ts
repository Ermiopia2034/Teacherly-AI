import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Attendance, 
  AttendanceCreatePayload, 
  AttendanceUpdatePayload, 
  AttendanceBulkCreatePayload,
  AttendanceStats,
  AttendanceListParams,
  createAttendance as apiCreateAttendance,
  createBulkAttendance as apiCreateBulkAttendance,
  getAttendance as apiGetAttendance,
  getAttendanceById as apiGetAttendanceById,
  getStudentAttendance as apiGetStudentAttendance,
  getAttendanceByDate as apiGetAttendanceByDate,
  updateAttendance as apiUpdateAttendance,
  deleteAttendance as apiDeleteAttendance,
  getAttendanceStats as apiGetAttendanceStats
} from '@/lib/api/attendance';

// State interface
interface AttendanceState {
  attendance: Attendance[];
  currentAttendance: Attendance | null;
  stats: AttendanceStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: AttendanceState = {
  attendance: [],
  currentAttendance: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createAttendanceThunk = createAsyncThunk(
  'attendance/create',
  async (payload: AttendanceCreatePayload, { rejectWithValue }) => {
    try {
      const attendance = await apiCreateAttendance(payload);
      return attendance;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create attendance';
      return rejectWithValue(message);
    }
  }
);

export const createBulkAttendanceThunk = createAsyncThunk(
  'attendance/createBulk',
  async (payload: AttendanceBulkCreatePayload, { rejectWithValue }) => {
    try {
      const attendanceRecords = await apiCreateBulkAttendance(payload);
      return attendanceRecords;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create bulk attendance';
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceThunk = createAsyncThunk(
  'attendance/fetchAll',
  async (params: AttendanceListParams = {}, { rejectWithValue }) => {
    try {
      const attendance = await apiGetAttendance(params);
      return attendance;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch attendance';
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceByIdThunk = createAsyncThunk(
  'attendance/fetchById',
  async (attendanceId: number, { rejectWithValue }) => {
    try {
      const attendance = await apiGetAttendanceById(attendanceId);
      return attendance;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch attendance';
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentAttendanceThunk = createAsyncThunk(
  'attendance/fetchByStudent',
  async ({ studentId, params = {} }: { studentId: number; params?: AttendanceListParams }, { rejectWithValue }) => {
    try {
      const attendance = await apiGetStudentAttendance(studentId, params);
      return attendance;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch student attendance';
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceByDateThunk = createAsyncThunk(
  'attendance/fetchByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const attendance = await apiGetAttendanceByDate(date);
      return attendance;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch attendance by date';
      return rejectWithValue(message);
    }
  }
);

export const updateAttendanceThunk = createAsyncThunk(
  'attendance/update',
  async (
    { attendanceId, payload }: { attendanceId: number; payload: AttendanceUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const attendance = await apiUpdateAttendance(attendanceId, payload);
      return attendance;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update attendance';
      return rejectWithValue(message);
    }
  }
);

export const deleteAttendanceThunk = createAsyncThunk(
  'attendance/delete',
  async (attendanceId: number, { rejectWithValue }) => {
    try {
      await apiDeleteAttendance(attendanceId);
      return attendanceId;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete attendance';
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceStatsThunk = createAsyncThunk(
  'attendance/fetchStats',
  async ({ start_date, end_date }: { start_date?: string; end_date?: string } = {}, { rejectWithValue }) => {
    try {
      const stats = await apiGetAttendanceStats(start_date, end_date);
      return stats;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch attendance statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAttendance: (state) => {
      state.currentAttendance = null;
    },
    setCurrentAttendance: (state, action: PayloadAction<Attendance>) => {
      state.currentAttendance = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create attendance
    builder
      .addCase(createAttendanceThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAttendanceThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.attendance.unshift(action.payload); // Add to beginning of list
      })
      .addCase(createAttendanceThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Create bulk attendance
    builder
      .addCase(createBulkAttendanceThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBulkAttendanceThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        // Add new records to the beginning of the list
        state.attendance.unshift(...action.payload);
      })
      .addCase(createBulkAttendanceThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch attendance
    builder
      .addCase(fetchAttendanceThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendanceThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch attendance by ID
    builder
      .addCase(fetchAttendanceByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAttendance = action.payload;
      })
      .addCase(fetchAttendanceByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch student attendance
    builder
      .addCase(fetchStudentAttendanceThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendanceThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchStudentAttendanceThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch attendance by date
    builder
      .addCase(fetchAttendanceByDateThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByDateThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendanceByDateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update attendance
    builder
      .addCase(updateAttendanceThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAttendanceThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.attendance.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        if (state.currentAttendance?.id === action.payload.id) {
          state.currentAttendance = action.payload;
        }
      })
      .addCase(updateAttendanceThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete attendance
    builder
      .addCase(deleteAttendanceThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAttendanceThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.attendance = state.attendance.filter(a => a.id !== action.payload);
        if (state.currentAttendance?.id === action.payload) {
          state.currentAttendance = null;
        }
      })
      .addCase(deleteAttendanceThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchAttendanceStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAttendanceStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearCurrentAttendance, setCurrentAttendance } = attendanceSlice.actions;

// Selectors
export const selectAttendance = (state: { attendance: AttendanceState }) => state.attendance.attendance;
export const selectCurrentAttendance = (state: { attendance: AttendanceState }) => state.attendance.currentAttendance;
export const selectAttendanceStats = (state: { attendance: AttendanceState }) => state.attendance.stats;
export const selectAttendanceLoading = (state: { attendance: AttendanceState }) => state.attendance.isLoading;
export const selectAttendanceCreating = (state: { attendance: AttendanceState }) => state.attendance.isCreating;
export const selectAttendanceUpdating = (state: { attendance: AttendanceState }) => state.attendance.isUpdating;
export const selectAttendanceDeleting = (state: { attendance: AttendanceState }) => state.attendance.isDeleting;
export const selectAttendanceError = (state: { attendance: AttendanceState }) => state.attendance.error;

// Reducer
export default attendanceSlice.reducer;