import apiClient from './client';

// Semester types enum to match backend
export enum SemesterType {
  FALL = "FALL",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD"
}

export enum SemesterStatus {
  UPCOMING = "upcoming",
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

// TypeScript interfaces for Semester data structures
export interface Semester {
  id: number;
  name: string;
  semester_type: SemesterType;
  start_date: string;
  end_date: string;
  status: SemesterStatus;
  is_current: boolean;
  description?: string;
  academic_year_id: number;
  teacher_id: number;
  created_at: string;
  updated_at?: string;
  academic_year?: {
    id: number;
    name: string;
  };
}

export interface SemesterCreatePayload {
  name: string;
  semester_type: SemesterType;
  start_date: string;
  end_date: string;
  academic_year_id: number;
}

export interface SemesterUpdatePayload {
  name?: string;
  semester_type?: SemesterType;
  start_date?: string;
  end_date?: string;
  academic_year_id?: number;
}

export interface SemesterStats {
  total_semesters: number;
  current_semester?: Semester;
  total_sections: number;
  total_enrollments: number;
  teacher_id: number;
  teacher_name?: string;
}

export interface SemesterListParams {
  skip?: number;
  limit?: number;
  academic_year_id?: number;
}

// API functions for semester operations
export const createSemester = async (payload: SemesterCreatePayload): Promise<Semester> => {
  const response = await apiClient.post('/semesters/', payload);
  return response.data;
};

export const getSemesters = async (params: SemesterListParams = {}): Promise<Semester[]> => {
  const { skip = 0, limit = 100, academic_year_id } = params;
  const queryParams: Record<string, number> = { skip, limit };
  if (academic_year_id) {
    queryParams.academic_year_id = academic_year_id;
  }
  const response = await apiClient.get('/semesters/', {
    params: queryParams
  });
  return response.data;
};

export const getCurrentSemester = async (): Promise<Semester | null> => {
  try {
    const response = await apiClient.get('/semesters/current');
    return response.data;
  } catch {
    // Return null if no current semester is set
    return null;
  }
};

export const getSemestersByAcademicYear = async (academicYearId: number): Promise<Semester[]> => {
  const response = await apiClient.get(`/semesters/by-academic-year/${academicYearId}`);
  return response.data;
};

export const getSemesterById = async (semesterId: number): Promise<Semester> => {
  const response = await apiClient.get(`/semesters/${semesterId}`);
  return response.data;
};

export const updateSemester = async (
  semesterId: number, 
  payload: SemesterUpdatePayload
): Promise<Semester> => {
  const response = await apiClient.put(`/semesters/${semesterId}`, payload);
  return response.data;
};

export const setCurrentSemester = async (semesterId: number): Promise<Semester> => {
  const response = await apiClient.put(`/semesters/${semesterId}/set-current`);
  return response.data;
};

export const deleteSemester = async (semesterId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/semesters/${semesterId}`);
  return response.data;
};

export const getSemesterStats = async (): Promise<SemesterStats> => {
  const response = await apiClient.get('/semesters/stats');
  return response.data;
};