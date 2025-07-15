import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Section, 
  SectionCreatePayload, 
  SectionUpdatePayload, 
  SectionStats,
  SectionListParams,
  createSection as apiCreateSection,
  getSections as apiGetSections,
  getSectionsBySemester as apiGetSectionsBySemester,
  getSectionsBySubject as apiGetSectionsBySubject,
  getSectionById as apiGetSectionById,
  updateSection as apiUpdateSection,
  deleteSection as apiDeleteSection,
  getSectionStats as apiGetSectionStats
} from '@/lib/api/sections';

// State interface
interface SectionsState {
  sections: Section[];
  selectedSection: Section | null;
  stats: SectionStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// Initial state
const initialState: SectionsState = {
  sections: [],
  selectedSection: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const createSectionThunk = createAsyncThunk(
  'sections/create',
  async (payload: SectionCreatePayload, { rejectWithValue }) => {
    try {
      const section = await apiCreateSection(payload);
      return section;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create section';
      return rejectWithValue(message);
    }
  }
);

export const fetchSectionsThunk = createAsyncThunk(
  'sections/fetchAll',
  async (params: SectionListParams = {}, { rejectWithValue }) => {
    try {
      const sections = await apiGetSections(params);
      return sections;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch sections';
      return rejectWithValue(message);
    }
  }
);

export const fetchSectionsBySemesterThunk = createAsyncThunk(
  'sections/fetchBySemester',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const sections = await apiGetSectionsBySemester(semesterId);
      return sections;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch sections by semester';
      return rejectWithValue(message);
    }
  }
);

export const fetchSectionsBySubjectThunk = createAsyncThunk(
  'sections/fetchBySubject',
  async (subject: string, { rejectWithValue }) => {
    try {
      const sections = await apiGetSectionsBySubject(subject);
      return sections;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch sections by subject';
      return rejectWithValue(message);
    }
  }
);

export const fetchSectionByIdThunk = createAsyncThunk(
  'sections/fetchById',
  async (sectionId: number, { rejectWithValue }) => {
    try {
      const section = await apiGetSectionById(sectionId);
      return section;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch section';
      return rejectWithValue(message);
    }
  }
);

export const updateSectionThunk = createAsyncThunk(
  'sections/update',
  async (
    { sectionId, payload }: { sectionId: number; payload: SectionUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const section = await apiUpdateSection(sectionId, payload);
      return section;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update section';
      return rejectWithValue(message);
    }
  }
);

export const deleteSectionThunk = createAsyncThunk(
  'sections/delete',
  async (sectionId: number, { rejectWithValue }) => {
    try {
      await apiDeleteSection(sectionId);
      return sectionId;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete section';
      return rejectWithValue(message);
    }
  }
);

export const fetchSectionStatsThunk = createAsyncThunk(
  'sections/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiGetSectionStats();
      return stats;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch section statistics';
      return rejectWithValue(message);
    }
  }
);

// Slice
const sectionsSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSection: (state) => {
      state.selectedSection = null;
    },
    setSelectedSection: (state, action: PayloadAction<Section>) => {
      state.selectedSection = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create section
    builder
      .addCase(createSectionThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSectionThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.sections.push(action.payload);
        // Update stats if available
        if (state.stats) {
          state.stats.total_sections += 1;
        }
      })
      .addCase(createSectionThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch sections
    builder
      .addCase(fetchSectionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSectionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch sections by semester
    builder
      .addCase(fetchSectionsBySemesterThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectionsBySemesterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSectionsBySemesterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch sections by subject
    builder
      .addCase(fetchSectionsBySubjectThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectionsBySubjectThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSectionsBySubjectThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch section by ID
    builder
      .addCase(fetchSectionByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectionByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSection = action.payload;
      })
      .addCase(fetchSectionByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update section
    builder
      .addCase(updateSectionThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSectionThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.sections.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
        if (state.selectedSection?.id === action.payload.id) {
          state.selectedSection = action.payload;
        }
      })
      .addCase(updateSectionThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete section
    builder
      .addCase(deleteSectionThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSectionThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.sections = state.sections.filter(s => s.id !== action.payload);
        if (state.selectedSection?.id === action.payload) {
          state.selectedSection = null;
        }
        // Update stats if available
        if (state.stats) {
          state.stats.total_sections -= 1;
        }
      })
      .addCase(deleteSectionThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchSectionStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSectionStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSectionStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearSelectedSection, setSelectedSection } = sectionsSlice.actions;

// Selectors
export const selectSections = (state: { sections: SectionsState }) => state.sections.sections;
export const selectSelectedSection = (state: { sections: SectionsState }) => state.sections.selectedSection;
export const selectSectionStats = (state: { sections: SectionsState }) => state.sections.stats;
export const selectSectionsLoading = (state: { sections: SectionsState }) => state.sections.isLoading;
export const selectSectionsCreating = (state: { sections: SectionsState }) => state.sections.isCreating;
export const selectSectionsUpdating = (state: { sections: SectionsState }) => state.sections.isUpdating;
export const selectSectionsDeleting = (state: { sections: SectionsState }) => state.sections.isDeleting;
export const selectSectionsError = (state: { sections: SectionsState }) => state.sections.error;

// Reducer
export default sectionsSlice.reducer;