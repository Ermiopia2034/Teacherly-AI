import apiClient from './client';

// This should match the ContentType enum on the backend
export enum ContentType {
  MATERIAL = "material",
  EXAM = "exam",
  ASSIGNMENT = "assignment",
  NOTE = "note",
}

// This should match the backend schema for the data field
export interface ContentData {
  markdown: string;
  source_request: {
    subject: string;
    grade: string;
    unit: string;
    topic: string;
    content_type: string;
    additional_info: string;
  };
}

// This should match the ContentRead schema on the backend
export interface ContentRead {
id: number;
teacher_id: number;
title: string;
content_type: ContentType;
description: string | null;
data: ContentData;
}

/**
 * Fetches all content for the currently authenticated teacher.
 * @returns A promise that resolves to an array of content items.
 */
export const fetchMyContent = async (): Promise<ContentRead[]> => {
  try {
    const response = await apiClient.get<ContentRead[]>('/content/my-content');
    return response.data;
  } catch (error) {
    console.error("Error fetching user content:", error);
    // Re-throw the error to be handled by the calling thunk
    throw error;
  }
};

/**
 * Fetches a single content item by its ID.
 * @param contentId The ID of the content to fetch.
 * @returns A promise that resolves to the content item.
 */
export const fetchContentById = async (contentId: number): Promise<ContentRead> => {
    try {
        const response = await apiClient.get<ContentRead>(`/content/${contentId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching content with ID ${contentId}:`, error);
        throw error;
    }
};