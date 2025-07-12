import apiClient from './client';

// TypeScript interfaces for Attendance data structures
export interface Attendance {
  id: number;
  attendance_date: string; // Date in YYYY-MM-DD format
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  student_id: number;
  created_at: string;
  student_name?: string;
}

export interface AttendanceCreatePayload {
  attendance_date: string; // Date in YYYY-MM-DD format
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  student_id: number;
}

export interface AttendanceUpdatePayload {
  attendance_date?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceBulkCreatePayload {
  attendance_date: string; // Date in YYYY-MM-DD format
  attendance_records: AttendanceRecord[];
}

export interface AttendanceStats {
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
  teacher_id: number;
  teacher_name?: string;
  date_range: {
    start_date?: string;
    end_date?: string;
  };
}

export interface AttendanceListParams {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

// API functions for attendance operations
export const createAttendance = async (payload: AttendanceCreatePayload): Promise<Attendance> => {
  const response = await apiClient.post('/attendance/', payload);
  return response.data;
};

export const createBulkAttendance = async (payload: AttendanceBulkCreatePayload): Promise<Attendance[]> => {
  const response = await apiClient.post('/attendance/bulk', payload);
  return response.data;
};

export const getAttendance = async (params: AttendanceListParams = {}): Promise<Attendance[]> => {
  const { skip = 0, limit = 100, start_date, end_date } = params;
  const response = await apiClient.get('/attendance/', {
    params: { skip, limit, start_date, end_date }
  });
  return response.data;
};

export const getAttendanceById = async (attendanceId: number): Promise<Attendance> => {
  const response = await apiClient.get(`/attendance/${attendanceId}`);
  return response.data;
};

export const getStudentAttendance = async (
  studentId: number, 
  params: AttendanceListParams = {}
): Promise<Attendance[]> => {
  const { skip = 0, limit = 100, start_date, end_date } = params;
  const response = await apiClient.get(`/attendance/student/${studentId}`, {
    params: { skip, limit, start_date, end_date }
  });
  return response.data;
};

export const getAttendanceByDate = async (date: string): Promise<Attendance[]> => {
  const response = await apiClient.get(`/attendance/date/${date}`);
  return response.data;
};

export const updateAttendance = async (
  attendanceId: number, 
  payload: AttendanceUpdatePayload
): Promise<Attendance> => {
  const response = await apiClient.put(`/attendance/${attendanceId}`, payload);
  return response.data;
};

export const deleteAttendance = async (attendanceId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/attendance/${attendanceId}`);
  return response.data;
};

export const getAttendanceStats = async (
  start_date?: string, 
  end_date?: string
): Promise<AttendanceStats> => {
  const response = await apiClient.get('/attendance/stats', {
    params: { start_date, end_date }
  });
  return response.data;
};