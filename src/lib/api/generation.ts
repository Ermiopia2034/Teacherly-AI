import apiClient from './client';

/**
 * Defines the structure for the request payload when generating teaching material.
 * This corresponds to the `MaterialGenerationRequest` Pydantic schema on the backend.
 */
export interface MaterialGenerationRequest {
  subject: string;
  grade: string;
  unit: string;
  topics: string[];
  contentType: string;
  additionalInfo: string;
}

/**
 * Calls the backend API to generate teaching material.
 * @param data - The material generation request payload.
 * @returns The backend response, which includes the generated content.
 */
export const generateMaterial = async (data: MaterialGenerationRequest): Promise<{ content: string }> => {
  const response = await apiClient.post('/content/generate/material', data);
  return response.data;
};

/**
 * Defines the structure for the request payload when generating an exam.
 */
export interface ExamGenerationRequest {
  subject: string;
  grade: string;
  unit: string;
  topics: string[];
  examType: string;
  difficulty: string;
  questionCount: string;
  additionalInfo: string;
}

/**
 * Calls the backend API to generate an exam.
 * @param data - The exam generation request payload.
 * @returns The backend response, which includes the generated content.
 */
export const generateExam = async (data: ExamGenerationRequest): Promise<{ content: string }> => {
  const response = await apiClient.post('/content/generate/exam', data);
  return response.data;
};

/**
 * Response structure for async generation requests
 */
export interface AsyncGenerationResponse {
  message: string;
  task_id: string;
  status: string;
}

/**
 * Submits a material generation request asynchronously.
 * Returns immediately with task info while generation runs in background.
 * @param data - The material generation request payload.
 * @returns Promise with task submission response.
 */
export const submitMaterialGeneration = async (data: MaterialGenerationRequest): Promise<AsyncGenerationResponse> => {
  const response = await apiClient.post('/content/generate/material/async', data);
  return response.data;
};

/**
 * Submits an exam generation request asynchronously.
 * Returns immediately with task info while generation runs in background.
 * @param data - The exam generation request payload.
 * @returns Promise with task submission response.
 */
export const submitExamGeneration = async (data: ExamGenerationRequest): Promise<AsyncGenerationResponse> => {
  const response = await apiClient.post('/content/generate/exam/async', data);
  return response.data;
};