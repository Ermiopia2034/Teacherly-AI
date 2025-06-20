import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { generateMaterial } from '@/lib/api/generation';
import { MaterialGenerationRequest } from '@/lib/api/generation'; // Corrected import
import { RootState } from '@/lib/store';

// 1. Define the Slice's State
interface GenerationState {
  generatedContent: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GenerationState = {
  generatedContent: null,
  isLoading: false,
  error: null,
};

// 2. Create the Async Thunk
export const generateMaterialThunk = createAsyncThunk(
  'generation/generateMaterial',
  async (data: MaterialGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await generateMaterial(data);
      return response.content;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// 3. Create the Slice
const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    resetGenerationState: (state) => {
      state.generatedContent = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateMaterialThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.generatedContent = null;
      })
      .addCase(generateMaterialThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.generatedContent = action.payload;
      })
      .addCase(generateMaterialThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 4. Export Actions and Selectors
export const { resetGenerationState } = generationSlice.actions;

export const selectGeneratedContent = (state: RootState) => state.generation.generatedContent;
export const selectGenerationIsLoading = (state: RootState) => state.generation.isLoading;
export const selectGenerationError = (state: RootState) => state.generation.error;

// 5. Export the Reducer
export default generationSlice.reducer;