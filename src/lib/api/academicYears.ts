import apiClient from './client';

// TypeScript interfaces for Academic Year data structures
export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  teacher_id: number;
  created_at: string;
  updated_at?: string;
}

export interface AcademicYearCreatePayload {
  name: string;
  start_date: string;
  end_date: string;
}

export interface AcademicYearUpdatePayload {
  name?: string;
  start_date?: string;
  end_date?: string;
}

export interface AcademicYearStats {
  total_academic_years: number;
  current_academic_year?: AcademicYear;
  total_semesters: number;
  teacher_id: number;
  teacher_name?: string;
}

export interface AcademicYearListParams {
  skip?: number;
  limit?: number;
}

// API functions for academic year operations
export const createAcademicYear = async (payload: AcademicYearCreatePayload): Promise<AcademicYear> => {
  const response = await apiClient.post('/academic-years/', payload);
  return response.data;
};

export const getAcademicYears = async (params: AcademicYearListParams = {}): Promise<AcademicYear[]> => {
  const { skip = 0, limit = 100 } = params;
  const response = await apiClient.get('/academic-years/', {
    params: { skip, limit }
  });
  return response.data;
};

export const getCurrentAcademicYear = async (): Promise<AcademicYear | null> => {
  try {
    const response = await apiClient.get('/academic-years/current');
    return response.data;
  } catch {
    // Return null if no current academic year is set
    return null;
  }
};

export const getAcademicYearById = async (academicYearId: number): Promise<AcademicYear> => {
  const response = await apiClient.get(`/academic-years/${academicYearId}`);
  return response.data;
};

export const updateAcademicYear = async (
  academicYearId: number, 
  payload: AcademicYearUpdatePayload
): Promise<AcademicYear> => {
  const response = await apiClient.put(`/academic-years/${academicYearId}`, payload);
  return response.data;
};

export const setCurrentAcademicYear = async (academicYearId: number): Promise<AcademicYear> => {
  const response = await apiClient.put(`/academic-years/${academicYearId}/set-current`);
  return response.data;
};

export const deleteAcademicYear = async (academicYearId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/academic-years/${academicYearId}`);
  return response.data;
};

export const getAcademicYearStats = async (): Promise<AcademicYearStats> => {
  const response = await apiClient.get('/academic-years/stats');
  return response.data;
};