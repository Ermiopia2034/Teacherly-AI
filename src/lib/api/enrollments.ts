import apiClient from './client';

// TypeScript interfaces for Student Enrollment data structures
export interface StudentEnrollment {
  id: number;
  student_id: number;
  section_id: number;
  status?: string; // enrollment status (enrolled, dropped, etc.)
  enrollment_date: string;
  drop_date?: string;
  created_at: string;
  updated_at?: string;
  // Flat properties from backend
  student_name?: string;
  section_name?: string;
  section_subject?: string;
  semester_name?: string;
  // Legacy nested objects for backward compatibility
  student?: {
    id: number;
    full_name: string;
    grade_level?: string;
  };
  section?: {
    id: number;
    name: string;
    subject: string;
    semester?: {
      id: number;
      name: string;
      academic_year?: {
        id: number;
        name: string;
      };
    };
  };
}

export interface StudentEnrollmentCreatePayload {
  student_id: number;
  section_id: number;
  enrollment_date?: string;
}

export interface BulkEnrollmentPayload {
  student_ids: number[];
  section_id: number;
  enrollment_date?: string;
}

export interface StudentEnrollmentUpdatePayload {
  student_id?: number;
  section_id?: number;
  enrollment_date?: string;
}

export interface EnrollmentStats {
  total_enrollments: number;
  unique_students: number;
  unique_sections: number;
  teacher_id: number;
  teacher_name?: string;
}

export interface EnrollmentListParams {
  skip?: number;
  limit?: number;
  section_id?: number;
  student_id?: number;
}

// API functions for student enrollment operations
export const createEnrollment = async (payload: StudentEnrollmentCreatePayload): Promise<StudentEnrollment> => {
  const response = await apiClient.post('/enrollments/', payload);
  return response.data;
};

export const createBulkEnrollments = async (payload: BulkEnrollmentPayload): Promise<StudentEnrollment[]> => {
  const response = await apiClient.post('/enrollments/bulk', payload);
  return response.data;
};

export const getEnrollments = async (params: EnrollmentListParams = {}): Promise<StudentEnrollment[]> => {
  const { skip = 0, limit = 100, section_id, student_id } = params;
  const queryParams: Record<string, number> = { skip, limit };
  if (section_id) {
    queryParams.section_id = section_id;
  }
  if (student_id) {
    queryParams.student_id = student_id;
  }
  const response = await apiClient.get('/enrollments/', {
    params: queryParams
  });
  return response.data;
};

export const getEnrollmentsBySection = async (sectionId: number): Promise<StudentEnrollment[]> => {
  const response = await apiClient.get(`/enrollments/by-section/${sectionId}`);
  return response.data;
};

export const getEnrollmentsByStudent = async (studentId: number): Promise<StudentEnrollment[]> => {
  const response = await apiClient.get(`/enrollments/by-student/${studentId}`);
  return response.data;
};

export const getEnrollmentById = async (enrollmentId: number): Promise<StudentEnrollment> => {
  const response = await apiClient.get(`/enrollments/${enrollmentId}`);
  return response.data;
};

export const updateEnrollment = async (
  enrollmentId: number, 
  payload: StudentEnrollmentUpdatePayload
): Promise<StudentEnrollment> => {
  const response = await apiClient.put(`/enrollments/${enrollmentId}`, payload);
  return response.data;
};

export const deleteEnrollment = async (enrollmentId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/enrollments/${enrollmentId}`);
  return response.data;
};

export const getEnrollmentStats = async (): Promise<EnrollmentStats> => {
  const response = await apiClient.get('/enrollments/stats');
  return response.data;
};