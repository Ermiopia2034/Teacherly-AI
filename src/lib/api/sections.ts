import apiClient from './client';

// TypeScript interfaces for Section data structures
export interface Section {
  id: number;
  name: string;
  code: string;
  subject: string;
  grade_level: string;
  capacity: number;
  semester_id: number;
  teacher_id: number;
  created_at: string;
  updated_at?: string;
  semester?: {
    id: number;
    name: string;
    academic_year?: {
      id: number;
      name: string;
    };
  };
  enrollment_count?: number;
}

export interface SectionCreatePayload {
  name: string;
  code: string;
  subject: string;
  grade_level: string;
  capacity: number;
  semester_id: number;
}

export interface SectionUpdatePayload {
  name?: string;
  code?: string;
  subject?: string;
  grade_level?: string;
  capacity?: number;
  semester_id?: number;
}

export interface SectionStats {
  total_sections: number;
  total_enrollments: number;
  subjects: string[];
  teacher_id: number;
  teacher_name?: string;
}

export interface SectionListParams {
  skip?: number;
  limit?: number;
  semester_id?: number;
  subject?: string;
}

// API functions for section operations
export const createSection = async (payload: SectionCreatePayload): Promise<Section> => {
  const response = await apiClient.post('/sections/', payload);
  return response.data;
};

export const getSections = async (params: SectionListParams = {}): Promise<Section[]> => {
  const { skip = 0, limit = 100, semester_id, subject } = params;
  const queryParams: Record<string, string | number> = { skip, limit };
  if (semester_id) {
    queryParams.semester_id = semester_id;
  }
  if (subject) {
    queryParams.subject = subject;
  }
  const response = await apiClient.get('/sections/', {
    params: queryParams
  });
  return response.data;
};

export const getSectionsBySemester = async (semesterId: number): Promise<Section[]> => {
  const response = await apiClient.get(`/sections/by-semester/${semesterId}`);
  return response.data;
};

export const getSectionsBySubject = async (subject: string): Promise<Section[]> => {
  const response = await apiClient.get(`/sections/by-subject/${subject}`);
  return response.data;
};

export const getSectionById = async (sectionId: number): Promise<Section> => {
  const response = await apiClient.get(`/sections/${sectionId}`);
  return response.data;
};

export const updateSection = async (
  sectionId: number, 
  payload: SectionUpdatePayload
): Promise<Section> => {
  const response = await apiClient.put(`/sections/${sectionId}`, payload);
  return response.data;
};

export const deleteSection = async (sectionId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/sections/${sectionId}`);
  return response.data;
};

export const getSectionStats = async (): Promise<SectionStats> => {
  const response = await apiClient.get('/sections/stats');
  return response.data;
};