import apiClient from './client';

// TypeScript interfaces for Assessment and Grading data structures
export interface Assessment extends Record<string, unknown> {
  id: number;
  title: string;
  description?: string;
  answer_key: string;
  max_score: number;
  teacher_id: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  total_submissions?: number;
}

export interface AssessmentCreatePayload {
  title: string;
  description?: string;
  answer_key: string;
  max_score: number;
}

export interface AssessmentUpdatePayload {
  title?: string;
  description?: string;
  answer_key?: string;
  max_score?: number;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

export interface Submission extends Record<string, unknown> {
  id: number;
  assessment_id: number;
  student_id: number;
  teacher_id: number;
  file_path: string;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_text?: string;
  ocr_confidence?: number;
  submitted_at: string;
  processed_at?: string;
  student_name?: string;
  grading_result?: GradingResult;
}

export interface GradingResult {
  id: number;
  submission_id: number;
  total_score: number;
  max_score: number;
  percentage: number;
  feedback: string;
  question_scores: QuestionScore[];
  graded_at: string;
}

export interface QuestionScore {
  question_number: number;
  score: number;
  max_score: number;
  feedback?: string;
}

export interface FileUploadResponse {
  submission_id: number;
  message: string;
  status: string;
}

export interface SubmissionStatusResponse {
  submission_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_text?: string;
  ocr_confidence?: number;
  grading_result?: GradingResult;
  error_message?: string;
}

export interface AssessmentWithSubmissions extends Assessment {
  submissions: Submission[];
}

export interface AssessmentStats {
  assessment_id: number;
  total_submissions: number;
  completed_submissions: number;
  pending_submissions: number;
  failed_submissions: number;
  average_score?: number;
  highest_score?: number;
  lowest_score?: number;
}

export interface AssessmentListParams {
  skip?: number;
  limit?: number;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

// Unified grading interfaces
export interface UnifiedGradingItem extends Record<string, unknown> {
  id: number;
  title: string;
  description?: string;
  answer_key: Record<string, unknown>;
  source_type: 'manual_assessment' | 'ai_exam';
  status: string;
  max_score?: number;
  total_submissions: number;
  teacher_id: number;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

export interface UnifiedGradingListResponse {
  items: UnifiedGradingItem[];
  total: number;
  manual_assessments_count: number;
  ai_exams_count: number;
}

export interface UnifiedGradingListParams {
  skip?: number;
  limit?: number;
  item_type?: 'manual_assessment' | 'ai_exam';
}

export interface UnifiedSubmissionUpload {
  item_id: number;
  source_type: 'manual_assessment' | 'ai_exam';
  student_id: number;
  file: File;
}

// Assessment API functions
export const createAssessment = async (payload: AssessmentCreatePayload): Promise<Assessment> => {
  const response = await apiClient.post('/grading/assessments', payload);
  return response.data;
};

export const getAssessments = async (params: AssessmentListParams = {}): Promise<Assessment[]> => {
  const { skip = 0, limit = 100, status } = params;
  const queryParams: Record<string, number | string> = { skip, limit };
  if (status) queryParams.status = status;
  
  const response = await apiClient.get('/grading/assessments', {
    params: queryParams
  });
  return response.data;
};

export const getAssessmentById = async (assessmentId: number): Promise<AssessmentWithSubmissions> => {
  const response = await apiClient.get(`/grading/assessments/${assessmentId}`);
  return response.data;
};

export const updateAssessment = async (
  assessmentId: number, 
  payload: AssessmentUpdatePayload
): Promise<Assessment> => {
  const response = await apiClient.put(`/grading/assessments/${assessmentId}`, payload);
  return response.data;
};

export const deleteAssessment = async (assessmentId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/grading/assessments/${assessmentId}`);
  return response.data;
};

// Unified grading API functions
export const getGradingItems = async (params: UnifiedGradingListParams = {}): Promise<UnifiedGradingListResponse> => {
  const { skip = 0, limit = 100, item_type } = params;
  const queryParams: Record<string, number | string> = { skip, limit };
  if (item_type) queryParams.item_type = item_type;
  
  const response = await apiClient.get('/grading/grading-items', {
    params: queryParams
  });
  return response.data;
};

export const uploadUnifiedSubmission = async (
  submissionData: UnifiedSubmissionUpload
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', submissionData.file);
  formData.append('source_type', submissionData.source_type);
  formData.append('student_id', submissionData.student_id.toString());

  const response = await apiClient.post(
    `/grading/grading-items/${submissionData.item_id}/submissions`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const uploadUnifiedSubmissionWithProgress = async (
  submissionData: UnifiedSubmissionUpload,
  onProgress?: (progress: number) => void
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', submissionData.file);
  formData.append('source_type', submissionData.source_type);
  formData.append('student_id', submissionData.student_id.toString());

  const response = await apiClient.post(
    `/grading/grading-items/${submissionData.item_id}/submissions`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );
  return response.data;
};

// Submission API functions
export const uploadSubmission = async (
  assessmentId: number,
  studentId: number,
  file: File
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('student_id', studentId.toString());

  const response = await apiClient.post(
    `/grading/assessments/${assessmentId}/submissions`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const uploadMultipleSubmissions = async (
  assessmentId: number,
  submissions: { studentId: number; file: File }[]
): Promise<FileUploadResponse[]> => {
  const uploadPromises = submissions.map(({ studentId, file }) =>
    uploadSubmission(assessmentId, studentId, file)
  );
  
  return Promise.all(uploadPromises);
};

export const getSubmissionStatus = async (submissionId: number): Promise<SubmissionStatusResponse> => {
  const response = await apiClient.get(`/grading/submissions/${submissionId}/status`);
  return response.data;
};

export const getAssessmentSubmissions = async (
  assessmentId: number,
  params: { skip?: number; limit?: number } = {}
): Promise<Submission[]> => {
  const { skip = 0, limit = 100 } = params;
  const response = await apiClient.get(`/grading/assessments/${assessmentId}/submissions`, {
    params: { skip, limit }
  });
  return response.data;
};

export const getStudentSubmissions = async (
  studentId: number,
  params: { skip?: number; limit?: number } = {}
): Promise<Submission[]> => {
  const { skip = 0, limit = 100 } = params;
  const response = await apiClient.get(`/grading/students/${studentId}/submissions`, {
    params: { skip, limit }
  });
  return response.data;
};

// Statistics API functions
export const getAssessmentStats = async (assessmentId: number): Promise<AssessmentStats> => {
  const response = await apiClient.get(`/grading/assessments/${assessmentId}/stats`);
  return response.data;
};

// Utility functions for file upload with progress tracking
export const uploadSubmissionWithProgress = async (
  assessmentId: number,
  studentId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('student_id', studentId.toString());

  const response = await apiClient.post(
    `/grading/assessments/${assessmentId}/submissions`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );
  return response.data;
};

// Batch operations
export const uploadBatchSubmissions = async (
  assessmentId: number,
  submissions: { studentId: number; file: File; fileName?: string }[],
  onProgress?: (fileIndex: number, progress: number) => void,
  onComplete?: (fileIndex: number, result: FileUploadResponse) => void,
  onError?: (fileIndex: number, error: Error) => void
): Promise<{ successful: FileUploadResponse[]; failed: Error[] }> => {
  const results: { successful: FileUploadResponse[]; failed: Error[] } = { successful: [], failed: [] };
  
  for (let i = 0; i < submissions.length; i++) {
    try {
      const { studentId, file } = submissions[i];
      const result = await uploadSubmissionWithProgress(
        assessmentId,
        studentId,
        file,
        (progress) => onProgress?.(i, progress)
      );
      
      results.successful.push(result);
      onComplete?.(i, result);
    } catch (error) {
      results.failed.push(error as Error);
      onError?.(i, error as Error);
    }
  }
  
  return results;
};

// Unified batch upload for both manual assessments and AI exams
export const uploadBatchUnifiedSubmissions = async (
  itemId: number,
  sourceType: 'manual_assessment' | 'ai_exam',
  submissions: { studentId: number; file: File; fileName?: string }[],
  onProgress?: (fileIndex: number, progress: number) => void,
  onComplete?: (fileIndex: number, result: FileUploadResponse) => void,
  onError?: (fileIndex: number, error: Error) => void
): Promise<{ successful: FileUploadResponse[]; failed: Error[] }> => {
  const results: { successful: FileUploadResponse[]; failed: Error[] } = { successful: [], failed: [] };
  
  for (let i = 0; i < submissions.length; i++) {
    try {
      const { studentId, file } = submissions[i];
      const result = await uploadUnifiedSubmissionWithProgress(
        {
          item_id: itemId,
          source_type: sourceType,
          student_id: studentId,
          file: file
        },
        (progress) => onProgress?.(i, progress)
      );
      
      results.successful.push(result);
      onComplete?.(i, result);
    } catch (error) {
      results.failed.push(error as Error);
      onError?.(i, error as Error);
    }
  }
  
  return results;
};

// Polling function for submission status updates
export const pollSubmissionStatus = async (
  submissionIds: number[],
  onUpdate: (submissionId: number, status: SubmissionStatusResponse) => void,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<void> => {
  let attempts = 0;
  const pendingIds = new Set(submissionIds);

  const poll = async () => {
    if (pendingIds.size === 0 || attempts >= maxAttempts) {
      return;
    }

    attempts++;

    try {
      for (const submissionId of Array.from(pendingIds)) {
        const status = await getSubmissionStatus(submissionId);
        onUpdate(submissionId, status);

        if (status.status === 'completed' || status.status === 'failed') {
          pendingIds.delete(submissionId);
        }
      }

      if (pendingIds.size > 0) {
        setTimeout(poll, intervalMs);
      }
    } catch (error) {
      console.error('Error polling submission status:', error);
      setTimeout(poll, intervalMs);
    }
  };

  poll();
};

// Unified grading item APIs
export const getUnifiedGradingItemById = async (itemId: number): Promise<UnifiedGradingItem> => {
  // First, try to get it from the unified grading items list
  // This is a workaround since there's no specific unified endpoint yet
  const response = await getGradingItems({ skip: 0, limit: 1000 });
  const item = response.items.find(item => item.id === itemId);
  
  if (!item) {
    throw new Error('Grading item not found');
  }
  
  return item;
};

export const getUnifiedItemSubmissions = async (
  itemId: number,
  sourceType: 'manual_assessment' | 'ai_exam',
  params: { skip?: number; limit?: number } = {}
): Promise<Submission[]> => {
  if (sourceType === 'manual_assessment') {
    return getAssessmentSubmissions(itemId, params);
  } else {
    // For AI exams, we'll need to implement a different approach
    // For now, return empty array as AI exam submissions might be handled differently
    return [];
  }
};

export const getUnifiedItemStats = async (
  itemId: number,
  sourceType: 'manual_assessment' | 'ai_exam'
): Promise<AssessmentStats> => {
  if (sourceType === 'manual_assessment') {
    return getAssessmentStats(itemId);
  } else {
    // For AI exams, return basic stats structure
    return {
      assessment_id: itemId,
      total_submissions: 0,
      completed_submissions: 0,
      pending_submissions: 0,
      failed_submissions: 0
    };
  }
};