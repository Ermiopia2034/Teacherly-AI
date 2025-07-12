import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ReportResponse,
  ReportRequest,
  ReportHistoryResponse,
  ReportHistoryParams,
  EmailReportRequest,
  EmailReportResponse,
  ReportStats,
  generateReport as apiGenerateReport,
  getReport as apiGetReport,
  getReportHistory as apiGetReportHistory,
  emailReport as apiEmailReport,
  getReportStats as apiGetReportStats
} from '@/lib/api/reports';

// State interface
interface ReportsState {
  reports: ReportResponse[];
  currentReport: ReportResponse | null;
  reportHistory: ReportHistoryResponse | null;
  stats: ReportStats | null;
  isGenerating: boolean;
  isLoading: boolean;
  isEmailSending: boolean;
  isFetchingHistory: boolean;
  error: string | null;
  emailResult: EmailReportResponse | null;
}

// Initial state
const initialState: ReportsState = {
  reports: [],
  currentReport: null,
  reportHistory: null,
  stats: null,
  isGenerating: false,
  isLoading: false,
  isEmailSending: false,
  isFetchingHistory: false,
  error: null,
  emailResult: null,
};

// Async thunks
export const generateReportThunk = createAsyncThunk(
  'reports/generate',
  async (payload: ReportRequest, { rejectWithValue }) => {
    try {
      const report = await apiGenerateReport(payload);
      return report;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to generate report';
      return rejectWithValue(message);
    }
  }
);

export const fetchReportThunk = createAsyncThunk(
  'reports/fetchById',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const report = await apiGetReport(reportId);
      return report;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch report';
      return rejectWithValue(message);
    }
  }
);

export const fetchReportHistoryThunk = createAsyncThunk(
  'reports/fetchHistory',
  async (params: ReportHistoryParams = {}, { rejectWithValue }) => {
    try {
      const history = await apiGetReportHistory(params);
      return history;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch report history';
      return rejectWithValue(message);
    }
  }
);

export const emailReportThunk = createAsyncThunk(
  'reports/email',
  async (payload: EmailReportRequest, { rejectWithValue }) => {
    try {
      const result = await apiEmailReport(payload);
      return result;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to email report';
      return rejectWithValue(message);
    }
  }
);

export const fetchReportStatsThunk = createAsyncThunk(
  'reports/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetReportStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch report statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearEmailResult: (state) => {
      state.emailResult = null;
    },
    setCurrentReport: (state, action: PayloadAction<ReportResponse>) => {
      state.currentReport = action.payload;
    },
    addGeneratedReport: (state, action: PayloadAction<ReportResponse>) => {
      // Add the new report to the beginning of the list
      state.reports.unshift(action.payload);
      // Keep only the most recent 50 reports in memory
      if (state.reports.length > 50) {
        state.reports = state.reports.slice(0, 50);
      }
    },
  },
  extraReducers: (builder) => {
    // Generate report
    builder
      .addCase(generateReportThunk.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateReportThunk.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentReport = action.payload;
        // Add to reports list
        state.reports.unshift(action.payload);
        if (state.reports.length > 50) {
          state.reports = state.reports.slice(0, 50);
        }
      })
      .addCase(generateReportThunk.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      });

    // Fetch report by ID
    builder
      .addCase(fetchReportThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
        // Update in reports list if it exists
        const index = state.reports.findIndex(r => r.report_id === action.payload.report_id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        } else {
          // Add to list if not found
          state.reports.unshift(action.payload);
        }
      })
      .addCase(fetchReportThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch report history
    builder
      .addCase(fetchReportHistoryThunk.pending, (state) => {
        state.isFetchingHistory = true;
        state.error = null;
      })
      .addCase(fetchReportHistoryThunk.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        state.reportHistory = action.payload;
      })
      .addCase(fetchReportHistoryThunk.rejected, (state, action) => {
        state.isFetchingHistory = false;
        state.error = action.payload as string;
      });

    // Email report
    builder
      .addCase(emailReportThunk.pending, (state) => {
        state.isEmailSending = true;
        state.error = null;
        state.emailResult = null;
      })
      .addCase(emailReportThunk.fulfilled, (state, action) => {
        state.isEmailSending = false;
        state.emailResult = action.payload;
      })
      .addCase(emailReportThunk.rejected, (state, action) => {
        state.isEmailSending = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchReportStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchReportStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { 
  clearError, 
  clearCurrentReport, 
  clearEmailResult, 
  setCurrentReport, 
  addGeneratedReport 
} = reportsSlice.actions;

// Selectors
export const selectReports = (state: { reports: ReportsState }) => state.reports.reports;
export const selectCurrentReport = (state: { reports: ReportsState }) => state.reports.currentReport;
export const selectReportHistory = (state: { reports: ReportsState }) => state.reports.reportHistory;
export const selectReportStats = (state: { reports: ReportsState }) => state.reports.stats;
export const selectEmailResult = (state: { reports: ReportsState }) => state.reports.emailResult;

// Loading states
export const selectReportsGenerating = (state: { reports: ReportsState }) => state.reports.isGenerating;
export const selectReportsLoading = (state: { reports: ReportsState }) => state.reports.isLoading;
export const selectEmailSending = (state: { reports: ReportsState }) => state.reports.isEmailSending;
export const selectFetchingHistory = (state: { reports: ReportsState }) => state.reports.isFetchingHistory;
export const selectReportsError = (state: { reports: ReportsState }) => state.reports.error;

// Derived selectors
export const selectRecentReports = (state: { reports: ReportsState }) => {
  return state.reports.reports.slice(0, 10); // Most recent 10 reports
};

export const selectReportsByType = (state: { reports: ReportsState }, reportType: string) => {
  return state.reports.reports.filter(report => report.report_type === reportType);
};

export const selectReportById = (state: { reports: ReportsState }, reportId: string) => {
  return state.reports.reports.find(report => report.report_id === reportId);
};

// Helper selectors for UI components
export const selectIsAnyReportLoading = (state: { reports: ReportsState }) => {
  return state.reports.isGenerating || 
         state.reports.isLoading || 
         state.reports.isEmailSending || 
         state.reports.isFetchingHistory;
};

export const selectCanGenerateReport = (state: { reports: ReportsState }) => {
  return !state.reports.isGenerating;
};

export const selectCanEmailReport = (state: { reports: ReportsState }) => {
  return !state.reports.isEmailSending && state.reports.currentReport !== null;
};

// Reducer
export default reportsSlice.reducer;