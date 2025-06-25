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