import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Assessment,
  AssessmentCreatePayload,
  AssessmentUpdatePayload,
  AssessmentWithSubmissions,
  Submission,
  SubmissionStatusResponse,
  AssessmentStats,
  AssessmentListParams,
  UnifiedGradingItem,
  UnifiedGradingListResponse,
  UnifiedGradingListParams,
  UnifiedSubmissionUpload,
  createAssessment as apiCreateAssessment,
  getAssessments as apiGetAssessments,
  getAssessmentById as apiGetAssessmentById,
  updateAssessment as apiUpdateAssessment,
  deleteAssessment as apiDeleteAssessment,
  uploadSubmission as apiUploadSubmission,
  uploadBatchSubmissions as apiUploadBatchSubmissions,
  getSubmissionStatus as apiGetSubmissionStatus,
  getAssessmentSubmissions as apiGetAssessmentSubmissions,
  getAssessmentStats as apiGetAssessmentStats,
  getGradingItems as apiGetGradingItems,
  uploadUnifiedSubmission as apiUploadUnifiedSubmission,
  pollSubmissionStatus,
  getUnifiedGradingItemById,
  getUnifiedItemSubmissions,
  getUnifiedItemStats
} from '@/lib/api/grading';

// Upload progress tracking
interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  submissionId?: number;
  error?: string;
}

// Batch upload state
interface BatchUpload {
  id: string;
  assessmentId: number;
  files: UploadProgress[];
  isActive: boolean;
  startedAt: string;
  completedAt?: string;
}

// Real-time submission tracking
interface SubmissionTracking {
  submissionId: number;
  status: SubmissionStatusResponse;
  lastUpdated: string;
}

// State interface
interface GradingState {
  // Assessments
  assessments: Assessment[];
  currentAssessment: AssessmentWithSubmissions | null;
  assessmentStats: AssessmentStats | null;
  
  // Unified grading items (both assessments and AI exams)
  gradingItems: UnifiedGradingItem[];
  gradingItemsStats: {
    total: number;
    manual_assessments_count: number;
    ai_exams_count: number;
  } | null;
  
  // Submissions
  submissions: Submission[];
  submissionTracking: Record<number, SubmissionTracking>;
  
  // File uploads
  uploads: BatchUpload[];
  activeUpload: BatchUpload | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isUploading: boolean;
  isPolling: boolean;
  
  // Error handling
  error: string | null;
  uploadError: string | null;
  
  // UI state
  selectedSubmissions: number[];
  viewMode: 'grid' | 'table';
  filters: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    studentId?: number;
    source_type?: 'manual_assessment' | 'ai_exam';
  };
}

// Initial state
const initialState: GradingState = {
  assessments: [],
  currentAssessment: null,
  assessmentStats: null,
  gradingItems: [],
  gradingItemsStats: null,
  submissions: [],
  submissionTracking: {},
  uploads: [],
  activeUpload: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isUploading: false,
  isPolling: false,
  error: null,
  uploadError: null,
  selectedSubmissions: [],
  viewMode: 'grid',
  filters: {},
};

// Async thunks for assessments
export const createAssessmentThunk = createAsyncThunk(
  'grading/createAssessment',
  async (payload: AssessmentCreatePayload, { rejectWithValue }) => {
    try {
      const assessment = await apiCreateAssessment(payload);
      return assessment;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create assessment';
      return rejectWithValue(message);
    }
  }
);

export const fetchAssessmentsThunk = createAsyncThunk(
  'grading/fetchAssessments',
  async (params: AssessmentListParams = {}, { rejectWithValue }) => {
    try {
      const assessments = await apiGetAssessments(params);
      return assessments;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch assessments';
      return rejectWithValue(message);
    }
  }
);

export const fetchAssessmentByIdThunk = createAsyncThunk(
  'grading/fetchAssessmentById',
  async (assessmentId: number, { rejectWithValue }) => {
    try {
      const assessment = await apiGetAssessmentById(assessmentId);
      return assessment;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch assessment';
      return rejectWithValue(message);
    }
  }
);

export const updateAssessmentThunk = createAsyncThunk(
  'grading/updateAssessment',
  async (
    { assessmentId, payload }: { assessmentId: number; payload: AssessmentUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const assessment = await apiUpdateAssessment(assessmentId, payload);
      return assessment;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update assessment';
      return rejectWithValue(message);
    }
  }
);

export const deleteAssessmentThunk = createAsyncThunk(
  'grading/deleteAssessment',
  async (assessmentId: number, { rejectWithValue }) => {
    try {
      await apiDeleteAssessment(assessmentId);
      return assessmentId;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete assessment';
      return rejectWithValue(message);
    }
  }
);

// Async thunks for unified grading items
export const fetchGradingItemsThunk = createAsyncThunk(
  'grading/fetchGradingItems',
  async (params: UnifiedGradingListParams = {}, { rejectWithValue }) => {
    try {
      const response: UnifiedGradingListResponse = await apiGetGradingItems(params);
      return response;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch grading items';
      return rejectWithValue(message);
    }
  }
);

export const uploadUnifiedSubmissionThunk = createAsyncThunk(
  'grading/uploadUnifiedSubmission',
  async (submissionData: UnifiedSubmissionUpload, { rejectWithValue }) => {
    try {
      const result = await apiUploadUnifiedSubmission(submissionData);
      return result;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to upload submission';
      return rejectWithValue(message);
    }
  }
);

// Async thunks for submissions
export const uploadSubmissionThunk = createAsyncThunk(
  'grading/uploadSubmission',
  async (
    { assessmentId, studentId, file }: { assessmentId: number; studentId: number; file: File },
    { rejectWithValue }
  ) => {
    try {
      const result = await apiUploadSubmission(assessmentId, studentId, file);
      return result;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to upload submission';
      return rejectWithValue(message);
    }
  }
);

export const uploadBatchSubmissionsThunk = createAsyncThunk(
  'grading/uploadBatchSubmissions',
  async (
    { 
      assessmentId, 
      submissions 
    }: { 
      assessmentId: number; 
      submissions: { studentId: number; file: File; fileName?: string }[] 
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const batchId = `batch_${Date.now()}`;
      
      // Initialize batch upload
      dispatch(initializeBatchUpload({
        id: batchId,
        assessmentId,
        files: submissions.map((sub, index) => ({
          fileIndex: index,
          fileName: sub.fileName || sub.file.name,
          progress: 0,
          status: 'pending'
        }))
      }));

      const result = await apiUploadBatchSubmissions(
        assessmentId,
        submissions,
        (fileIndex, progress) => {
          dispatch(updateUploadProgress({ batchId, fileIndex, progress }));
        },
        (fileIndex, result) => {
          dispatch(updateUploadComplete({ batchId, fileIndex, submissionId: result.submission_id }));
        },
        (fileIndex, error) => {
          dispatch(updateUploadError({ batchId, fileIndex, error: String(error) }));
        }
      );

      dispatch(completeBatchUpload(batchId));
      return result;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to upload batch submissions';
      return rejectWithValue(message);
    }
  }
);

export const fetchSubmissionStatusThunk = createAsyncThunk(
  'grading/fetchSubmissionStatus',
  async (submissionId: number, { rejectWithValue }) => {
    try {
      const status = await apiGetSubmissionStatus(submissionId);
      return { submissionId, status };
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch submission status';
      return rejectWithValue(message);
    }
  }
);

export const fetchAssessmentSubmissionsThunk = createAsyncThunk(
  'grading/fetchAssessmentSubmissions',
  async (
    { assessmentId, params = {} }: { assessmentId: number; params?: { skip?: number; limit?: number } },
    { rejectWithValue }
  ) => {
    try {
      const submissions = await apiGetAssessmentSubmissions(assessmentId, params);
      return submissions;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch submissions';
      return rejectWithValue(message);
    }
  }
);

export const fetchAssessmentStatsThunk = createAsyncThunk(
  'grading/fetchAssessmentStats',
  async (assessmentId: number, { rejectWithValue }) => {
    try {
      const stats = await apiGetAssessmentStats(assessmentId);
      return stats;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch assessment stats';
      return rejectWithValue(message);
    }
  }
);

// Polling thunk for real-time updates
export const startPollingSubmissionsThunk = createAsyncThunk(
  'grading/startPolling',
  async (submissionIds: number[], { dispatch, rejectWithValue }) => {
    try {
      dispatch(setPolling(true));
      
      await pollSubmissionStatus(
        submissionIds,
        (submissionId, status) => {
          dispatch(updateSubmissionTracking({ submissionId, status }));
        }
      );
      
      dispatch(setPolling(false));
      return submissionIds;
    } catch (error) {
      dispatch(setPolling(false));
      const message = error instanceof Error ? error.message : 'Polling failed';
      return rejectWithValue(message);
    }
  }
);

// Unified grading item thunks
export const fetchUnifiedGradingItemByIdThunk = createAsyncThunk(
  'grading/fetchUnifiedGradingItemById',
  async (itemId: number, { rejectWithValue }) => {
    try {
      const item = await getUnifiedGradingItemById(itemId);
      
      // Convert to AssessmentWithSubmissions format for compatibility
      const submissions = await getUnifiedItemSubmissions(
        itemId,
        item.source_type,
        { skip: 0, limit: 1000 }
      );
      
      const assessment: AssessmentWithSubmissions = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        answer_key: JSON.stringify(item.answer_key),
        max_score: item.max_score || 0,
        teacher_id: item.teacher_id,
        status: item.status as 'draft' | 'active' | 'completed' | 'archived',
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
        submissions
      };
      
      return assessment;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch grading item';
      return rejectWithValue(message);
    }
  }
);

export const fetchUnifiedItemSubmissionsThunk = createAsyncThunk(
  'grading/fetchUnifiedItemSubmissions',
  async (
    { itemId, sourceType, params = {} }: {
      itemId: number;
      sourceType: 'manual_assessment' | 'ai_exam';
      params?: { skip?: number; limit?: number }
    },
    { rejectWithValue }
  ) => {
    try {
      const submissions = await getUnifiedItemSubmissions(itemId, sourceType, params);
      return submissions;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch submissions';
      return rejectWithValue(message);
    }
  }
);

export const fetchUnifiedItemStatsThunk = createAsyncThunk(
  'grading/fetchUnifiedItemStats',
  async (
    { itemId, sourceType }: { itemId: number; sourceType: 'manual_assessment' | 'ai_exam' },
    { rejectWithValue }
  ) => {
    try {
      const stats = await getUnifiedItemStats(itemId, sourceType);
      return stats;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

// Slice
const gradingSlice = createSlice({
  name: 'grading',
  initialState,
  reducers: {
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    
    // Assessment management
    clearCurrentAssessment: (state) => {
      state.currentAssessment = null;
    },
    
    // Batch upload management
    initializeBatchUpload: (state, action: PayloadAction<{
      id: string;
      assessmentId: number;
      files: UploadProgress[];
    }>) => {
      const batchUpload: BatchUpload = {
        id: action.payload.id,
        assessmentId: action.payload.assessmentId,
        files: action.payload.files,
        isActive: true,
        startedAt: new Date().toISOString()
      };
      
      state.uploads.push(batchUpload);
      state.activeUpload = batchUpload;
      state.isUploading = true;
    },
    
    updateUploadProgress: (state, action: PayloadAction<{
      batchId: string;
      fileIndex: number;
      progress: number;
    }>) => {
      const upload = state.uploads.find(u => u.id === action.payload.batchId);
      if (upload) {
        const file = upload.files[action.payload.fileIndex];
        if (file) {
          file.progress = action.payload.progress;
          file.status = 'uploading';
        }
      }
    },
    
    updateUploadComplete: (state, action: PayloadAction<{
      batchId: string;
      fileIndex: number;
      submissionId: number;
    }>) => {
      const upload = state.uploads.find(u => u.id === action.payload.batchId);
      if (upload) {
        const file = upload.files[action.payload.fileIndex];
        if (file) {
          file.status = 'completed';
          file.progress = 100;
          file.submissionId = action.payload.submissionId;
        }
      }
    },
    
    updateUploadError: (state, action: PayloadAction<{
      batchId: string;
      fileIndex: number;
      error: string;
    }>) => {
      const upload = state.uploads.find(u => u.id === action.payload.batchId);
      if (upload) {
        const file = upload.files[action.payload.fileIndex];
        if (file) {
          file.status = 'failed';
          file.error = action.payload.error;
        }
      }
    },
    
    completeBatchUpload: (state, action: PayloadAction<string>) => {
      const upload = state.uploads.find(u => u.id === action.payload);
      if (upload) {
        upload.isActive = false;
        upload.completedAt = new Date().toISOString();
      }
      state.activeUpload = null;
      state.isUploading = false;
    },
    
    // Submission tracking
    updateSubmissionTracking: (state, action: PayloadAction<{
      submissionId: number;
      status: SubmissionStatusResponse;
    }>) => {
      state.submissionTracking[action.payload.submissionId] = {
        submissionId: action.payload.submissionId,
        status: action.payload.status,
        lastUpdated: new Date().toISOString()
      };
    },
    
    // UI state management
    setSelectedSubmissions: (state, action: PayloadAction<number[]>) => {
      state.selectedSubmissions = action.payload;
    },
    
    toggleSubmissionSelection: (state, action: PayloadAction<number>) => {
      const submissionId = action.payload;
      const index = state.selectedSubmissions.indexOf(submissionId);
      if (index === -1) {
        state.selectedSubmissions.push(submissionId);
      } else {
        state.selectedSubmissions.splice(index, 1);
      }
    },
    
    setViewMode: (state, action: PayloadAction<'grid' | 'table'>) => {
      state.viewMode = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<GradingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Polling state
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create assessment
    builder
      .addCase(createAssessmentThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAssessmentThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.assessments.unshift(action.payload);
      })
      .addCase(createAssessmentThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch assessments
    builder
      .addCase(fetchAssessmentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessmentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch assessment by ID
    builder
      .addCase(fetchAssessmentByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssessment = action.payload;
        state.submissions = action.payload.submissions;
      })
      .addCase(fetchAssessmentByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update assessment
    builder
      .addCase(updateAssessmentThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAssessmentThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.assessments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assessments[index] = action.payload;
        }
        if (state.currentAssessment?.id === action.payload.id) {
          state.currentAssessment = { ...state.currentAssessment, ...action.payload };
        }
      })
      .addCase(updateAssessmentThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete assessment
    builder
      .addCase(deleteAssessmentThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAssessmentThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.assessments = state.assessments.filter(a => a.id !== action.payload);
        if (state.currentAssessment?.id === action.payload) {
          state.currentAssessment = null;
        }
      })
      .addCase(deleteAssessmentThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Upload submission
    builder
      .addCase(uploadSubmissionThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadError = null;
      })
      .addCase(uploadSubmissionThunk.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(uploadSubmissionThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadError = action.payload as string;
      });

    // Fetch submission status
    builder
      .addCase(fetchSubmissionStatusThunk.fulfilled, (state, action) => {
        const { submissionId, status } = action.payload;
        state.submissionTracking[submissionId] = {
          submissionId,
          status,
          lastUpdated: new Date().toISOString()
        };
      });

    // Fetch assessment submissions
    builder
      .addCase(fetchAssessmentSubmissionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentSubmissionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchAssessmentSubmissionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch assessment stats
    builder
      .addCase(fetchAssessmentStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessmentStats = action.payload;
      })
      .addCase(fetchAssessmentStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unified grading items
    builder
      .addCase(fetchGradingItemsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGradingItemsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gradingItems = action.payload.items;
        state.gradingItemsStats = {
          total: action.payload.total,
          manual_assessments_count: action.payload.manual_assessments_count,
          ai_exams_count: action.payload.ai_exams_count
        };
      })
      .addCase(fetchGradingItemsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload unified submission
    builder
      .addCase(uploadUnifiedSubmissionThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadError = null;
      })
      .addCase(uploadUnifiedSubmissionThunk.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(uploadUnifiedSubmissionThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadError = action.payload as string;
      });

    // Fetch unified grading item by ID
    builder
      .addCase(fetchUnifiedGradingItemByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnifiedGradingItemByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssessment = action.payload;
        state.submissions = action.payload.submissions;
      })
      .addCase(fetchUnifiedGradingItemByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unified item submissions
    builder
      .addCase(fetchUnifiedItemSubmissionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnifiedItemSubmissionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchUnifiedItemSubmissionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unified item stats
    builder
      .addCase(fetchUnifiedItemStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnifiedItemStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessmentStats = action.payload;
      })
      .addCase(fetchUnifiedItemStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  clearError,
  clearUploadError,
  clearCurrentAssessment,
  initializeBatchUpload,
  updateUploadProgress,
  updateUploadComplete,
  updateUploadError,
  completeBatchUpload,
  updateSubmissionTracking,
  setSelectedSubmissions,
  toggleSubmissionSelection,
  setViewMode,
  setFilters,
  clearFilters,
  setPolling,
} = gradingSlice.actions;

// Selectors
export const selectAssessments = (state: { grading: GradingState }) => state.grading.assessments;
export const selectCurrentAssessment = (state: { grading: GradingState }) => state.grading.currentAssessment;
export const selectAssessmentStats = (state: { grading: GradingState }) => state.grading.assessmentStats;
export const selectGradingItems = (state: { grading: GradingState }) => state.grading.gradingItems;
export const selectGradingItemsStats = (state: { grading: GradingState }) => state.grading.gradingItemsStats;
export const selectSubmissions = (state: { grading: GradingState }) => state.grading.submissions;
export const selectSubmissionTracking = (state: { grading: GradingState }) => state.grading.submissionTracking;
export const selectUploads = (state: { grading: GradingState }) => state.grading.uploads;
export const selectActiveUpload = (state: { grading: GradingState }) => state.grading.activeUpload;
export const selectSelectedSubmissions = (state: { grading: GradingState }) => state.grading.selectedSubmissions;
export const selectViewMode = (state: { grading: GradingState }) => state.grading.viewMode;
export const selectFilters = (state: { grading: GradingState }) => state.grading.filters;

// Loading selectors
export const selectGradingLoading = (state: { grading: GradingState }) => state.grading.isLoading;
export const selectGradingCreating = (state: { grading: GradingState }) => state.grading.isCreating;
export const selectGradingUpdating = (state: { grading: GradingState }) => state.grading.isUpdating;
export const selectGradingDeleting = (state: { grading: GradingState }) => state.grading.isDeleting;
export const selectGradingUploading = (state: { grading: GradingState }) => state.grading.isUploading;
export const selectGradingPolling = (state: { grading: GradingState }) => state.grading.isPolling;

// Error selectors
export const selectGradingError = (state: { grading: GradingState }) => state.grading.error;
export const selectUploadError = (state: { grading: GradingState }) => state.grading.uploadError;

// Filtered data selectors
export const selectFilteredSubmissions = (state: { grading: GradingState }) => {
  const { submissions, filters } = state.grading;
  
  return submissions.filter(submission => {
    if (filters.status && submission.status !== filters.status) {
      return false;
    }
    if (filters.studentId && submission.student_id !== filters.studentId) {
      return false;
    }
    return true;
  });
};

// Reducer
export default gradingSlice.reducer;