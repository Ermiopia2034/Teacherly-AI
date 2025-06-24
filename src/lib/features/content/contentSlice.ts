import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchMyContent, fetchContentById, ContentRead } from '@/lib/api/content';
import { RootState } from '@/lib/store';

interface ContentState {
  contents: ContentRead[];
  selectedContent: ContentRead | null;
  isLoading: boolean;
  isLoadingSelected: boolean;
  error: string | null;
}

const initialState: ContentState = {
  contents: [],
  selectedContent: null,
  isLoading: false,
  isLoadingSelected: false,
  error: null,
};

export const fetchMyContentThunk = createAsyncThunk(
  'content/fetchMyContent',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchMyContent();
      return data;
    } catch (error: unknown) {
    const err = error as { response?: { data?: { detail?: string } } };
    return rejectWithValue(err.response?.data?.detail || 'An unexpected error occurred while fetching content.');
    }
  }
);

export const fetchContentByIdThunk = createAsyncThunk(
  'content/fetchContentById',
  async (contentId: number, { rejectWithValue }) => {
    try {
      const data = await fetchContentById(contentId);
      return data;
    } catch (error: unknown) {
    const err = error as { response?: { data?: { detail?: string } } };
    return rejectWithValue(err.response?.data?.detail || `Failed to fetch content (ID: ${contentId}).`);
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyContentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyContentThunk.fulfilled, (state, action: PayloadAction<ContentRead[]>) => {
        state.isLoading = false;
        state.contents = action.payload;
        state.error = null;
      })
      .addCase(fetchMyContentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Reducers for fetching a single content item
      .addCase(fetchContentByIdThunk.pending, (state) => {
        state.isLoadingSelected = true;
        state.selectedContent = null;
        state.error = null;
      })
      .addCase(fetchContentByIdThunk.fulfilled, (state, action: PayloadAction<ContentRead>) => {
        state.isLoadingSelected = false;
        state.selectedContent = action.payload;
      })
      .addCase(fetchContentByIdThunk.rejected, (state, action) => {
        state.isLoadingSelected = false;
        state.error = action.payload as string;
      });
  },
});

export const selectMyContents = (state: RootState) => state.content.contents;
export const selectContentIsLoading = (state: RootState) => state.content.isLoading;
export const selectSelectedContent = (state: RootState) => state.content.selectedContent;
export const selectSelectedContentIsLoading = (state: RootState) => state.content.isLoadingSelected;
export const selectContentError = (state: RootState) => state.content.error;

export default contentSlice.reducer;