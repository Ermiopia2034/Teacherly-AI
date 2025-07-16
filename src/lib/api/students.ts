import apiClient from './client';

// This file will contain API service functions related to student data management.

// For example, functions to:

// - Fetch a list of students

// - Get details for a specific student

// - Add a new student

// - Update student information

// - Delete a student

// Example placeholder structure:

// TypeScript interfaces for Student data structures
export interface Student {
  id: number;
  full_name: string;
  grade_level: string; // Now required, set from section
  parent_email?: string;
  teacher_id: number;
  created_at: string;
  updated_at?: string;
}

export interface StudentCreatePayload {
  full_name: string;
  grade_level: string; // Will be automatically set from selected section
  section_id: number;
  parent_email?: string;
}

export interface StudentUpdatePayload {
  full_name?: string;
  grade_level?: string;
  parent_email?: string;
}

export interface StudentStats {
  total_students: number;
  teacher_id: number;
  teacher_name?: string;
}

export interface StudentListParams {
  skip?: number;
  limit?: number;
}

// API functions for student operations
export const createStudent = async (payload: StudentCreatePayload): Promise<Student> => {
  const response = await apiClient.post('/students/', payload);
  return response.data;
};

export const getStudents = async (params: StudentListParams = {}): Promise<Student[]> => {
  const { skip = 0, limit = 100 } = params;
  const response = await apiClient.get('/students/', {
    params: { skip, limit }
  });
  return response.data;
};

export const getStudentById = async (studentId: number): Promise<Student> => {
  const response = await apiClient.get(`/students/${studentId}`);
  return response.data;
};

export const updateStudent = async (
  studentId: number, 
  payload: StudentUpdatePayload
): Promise<Student> => {
  const response = await apiClient.put(`/students/${studentId}`, payload);
  return response.data;
};

export const deleteStudent = async (studentId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/students/${studentId}`);
  return response.data;
};

export const getStudentStats = async (): Promise<StudentStats> => {
  const response = await apiClient.get('/students/stats');
  return response.data;
};