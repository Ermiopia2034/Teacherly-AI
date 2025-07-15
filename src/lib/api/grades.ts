import apiClient from './client';

// TypeScript interfaces for Grade data structures
export interface Grade {
  id: number;
  score: number;
  max_score?: number;
  feedback?: string;
  student_id: number;
  content_id: number;
  semester_id?: number;
  section_id?: number;
  grading_date: string;
  created_at: string;
  student_name?: string;
  content_title?: string;
  content_type?: string;
  semester?: {
    id: number;
    name: string;
    academic_year?: {
      id: number;
      name: string;
    };
  };
  section?: {
    id: number;
    name: string;
    subject: string;
  };
}

export interface GradeCreatePayload {
  score: number;
  max_score?: number;
  feedback?: string;
  student_id: number;
  content_id: number;
}

export interface GradeUpdatePayload {
  score?: number;
  max_score?: number;
  feedback?: string;
}

export interface GradeStats {
  total_grades: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  teacher_id: number;
  teacher_name?: string;
}

export interface GradeListParams {
  skip?: number;
  limit?: number;
  semester_id?: number;
  section_id?: number;
}

// API functions for grade operations
export const createGrade = async (payload: GradeCreatePayload): Promise<Grade> => {
  const response = await apiClient.post('/grades/', payload);
  return response.data;
};

export const getGrades = async (params: GradeListParams = {}): Promise<Grade[]> => {
  const { skip = 0, limit = 100, semester_id, section_id } = params;
  const queryParams: Record<string, number> = { skip, limit };
  if (semester_id) {
    queryParams.semester_id = semester_id;
  }
  if (section_id) {
    queryParams.section_id = section_id;
  }
  const response = await apiClient.get('/grades/', {
    params: queryParams
  });
  return response.data;
};

export const getGradesBySemester = async (semesterId: number): Promise<Grade[]> => {
  const response = await apiClient.get(`/grades/by-semester/${semesterId}`);
  return response.data;
};

export const getGradesBySection = async (sectionId: number): Promise<Grade[]> => {
  const response = await apiClient.get(`/grades/by-section/${sectionId}`);
  return response.data;
};

export const getGradeById = async (gradeId: number): Promise<Grade> => {
  const response = await apiClient.get(`/grades/${gradeId}`);
  return response.data;
};

export const getStudentGrades = async (
  studentId: number, 
  params: GradeListParams = {}
): Promise<Grade[]> => {
  const { skip = 0, limit = 100 } = params;
  const response = await apiClient.get(`/grades/student/${studentId}`, {
    params: { skip, limit }
  });
  return response.data;
};

export const getContentGrades = async (
  contentId: number, 
  params: GradeListParams = {}
): Promise<Grade[]> => {
  const { skip = 0, limit = 100 } = params;
  const response = await apiClient.get(`/grades/content/${contentId}`, {
    params: { skip, limit }
  });
  return response.data;
};

export const updateGrade = async (
  gradeId: number, 
  payload: GradeUpdatePayload
): Promise<Grade> => {
  const response = await apiClient.put(`/grades/${gradeId}`, payload);
  return response.data;
};

export const deleteGrade = async (gradeId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/grades/${gradeId}`);
  return response.data;
};

export const getGradeStats = async (): Promise<GradeStats> => {
  const response = await apiClient.get('/grades/stats');
  return response.data;
};