import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { generateMaterial, generateExam, submitMaterialGeneration, submitExamGeneration } from '@/lib/api/generation';
import { MaterialGenerationRequest, ExamGenerationRequest, AsyncGenerationResponse } from '@/lib/api/generation'; // Corrected import
import { RootState } from '@/lib/store';

// 1. Define the Slice's State
interface GenerationState {
  generatedContent: string | null;
  isLoading: boolean;
  error: string | null;
  // New async submission state
  isSubmitting: boolean;
  submitError: string | null;
  lastSubmissionResponse: AsyncGenerationResponse | null;
  showSuccessMessage: boolean;
}

const initialState: GenerationState = {
  generatedContent: null,
  isLoading: false,
  error: null,
  isSubmitting: false,
  submitError: null,
  lastSubmissionResponse: null,
  showSuccessMessage: false,
};

// 2. Create the Async Thunk
export const generateMaterialThunk = createAsyncThunk<
string,
MaterialGenerationRequest,
{ rejectValue: string }
>('generation/generateMaterial', async (data, { rejectWithValue }) => {
try {
const response = await generateMaterial(data);
return response.content;
} catch (error) {
let errorMessage = 'An unknown error occurred';
if (typeof error === 'object' && error !== null && 'response' in error) {
const response = (error as { response?: { data?: { detail?: string } } })
.response;
if (response?.data?.detail) {
errorMessage = response.data.detail;
}
} else if (error instanceof Error) {
errorMessage = error.message;
}
return rejectWithValue(errorMessage);
}
});

export const generateExamThunk = createAsyncThunk<
  string,
  ExamGenerationRequest,
  { rejectValue: string }
>('generation/generateExam', async (data, { rejectWithValue }) => {
  try {
    const response = await generateExam(data);
    return response.content;
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { detail?: string } } })
        .response;
      if (response?.data?.detail) {
        errorMessage = response.data.detail;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// New async submission thunks
export const submitMaterialGenerationThunk = createAsyncThunk<
  AsyncGenerationResponse,
  MaterialGenerationRequest,
  { rejectValue: string }
>('generation/submitMaterial', async (data, { rejectWithValue }) => {
  try {
    const response = await submitMaterialGeneration(data);
    return response;
  } catch (error) {
    let errorMessage = 'An unknown error occurred while submitting the request';
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { detail?: string } } })
        .response;
      if (response?.data?.detail) {
        errorMessage = response.data.detail;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

export const submitExamGenerationThunk = createAsyncThunk<
  AsyncGenerationResponse,
  ExamGenerationRequest,
  { rejectValue: string }
>('generation/submitExam', async (data, { rejectWithValue }) => {
  try {
    const response = await submitExamGeneration(data);
    return response;
  } catch (error) {
    let errorMessage = 'An unknown error occurred while submitting the request';
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { detail?: string } } })
        .response;
      if (response?.data?.detail) {
        errorMessage = response.data.detail;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// 3. Create the Slice
const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    resetGenerationState: (state) => {
      state.generatedContent = null;
      state.isLoading = false;
      state.error = null;
      state.isSubmitting = false;
      state.submitError = null;
      state.lastSubmissionResponse = null;
      state.showSuccessMessage = false;
    },
    clearSuccessMessage: (state) => {
      state.showSuccessMessage = false;
      state.lastSubmissionResponse = null;
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
      state.error = action.payload ?? 'An unknown error occurred';
    })
    .addCase(generateExamThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.generatedContent = null;
    })
    .addCase(generateExamThunk.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.generatedContent = action.payload;
    })
    .addCase(generateExamThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? 'An unknown error occurred';
    })
    // Async submission cases
    .addCase(submitMaterialGenerationThunk.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
      state.lastSubmissionResponse = null;
    })
    .addCase(submitMaterialGenerationThunk.fulfilled, (state, action: PayloadAction<AsyncGenerationResponse>) => {
      state.isSubmitting = false;
      state.lastSubmissionResponse = action.payload;
      state.showSuccessMessage = true;
    })
    .addCase(submitMaterialGenerationThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload ?? 'An unknown error occurred';
    })
    .addCase(submitExamGenerationThunk.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
      state.lastSubmissionResponse = null;
    })
    .addCase(submitExamGenerationThunk.fulfilled, (state, action: PayloadAction<AsyncGenerationResponse>) => {
      state.isSubmitting = false;
      state.lastSubmissionResponse = action.payload;
      state.showSuccessMessage = true;
    })
    .addCase(submitExamGenerationThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload ?? 'An unknown error occurred';
    });
},
});

// 4. Export Actions and Selectors
export const { resetGenerationState, clearSuccessMessage } = generationSlice.actions;

export const selectGeneratedContent = (state: RootState) => state.generation.generatedContent;
export const selectGenerationIsLoading = (state: RootState) => state.generation.isLoading;
export const selectGenerationError = (state: RootState) => state.generation.error;

// New async submission selectors
export const selectGenerationIsSubmitting = (state: RootState) => state.generation.isSubmitting;
export const selectGenerationSubmitError = (state: RootState) => state.generation.submitError;
export const selectLastSubmissionResponse = (state: RootState) => state.generation.lastSubmissionResponse;
export const selectShowSuccessMessage = (state: RootState) => state.generation.showSuccessMessage;

// 5. Export the Reducer
export default generationSlice.reducer;