import apiClient from './client';

// TypeScript interfaces for Report data structures
export enum ReportType {
  SINGLE_STUDENT = 'single_student',
  SCHOOL_ADMINISTRATIVE = 'school_administrative'
}

export enum ReportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export interface ReportRequest {
  report_type: ReportType;
  semester_id: number; // Required for all reports
  student_ids?: number[]; // Required for single student (exactly one), optional for administrative
  format?: ReportFormat;
  recipient_email?: string; // Required for school administrative reports
}

export interface StudentReportData {
  student_id: number;
  student_name: string;
  grade_level: string;
  parent_email?: string;
  
  // Grades data
  total_grades: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  grade_trend: 'improving' | 'declining' | 'stable';
  
  // Attendance data
  total_attendance_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
  
  // Detailed records
  grades: Array<{
    id: number;
    score: number;
    max_score?: number;
    content_title: string;
    grading_date: string;
    feedback?: string;
  }>;
  attendance_records: Array<{
    id: number;
    date: string;
    status: string;
    notes?: string;
  }>;
}

export interface ReportSummary {
  total_students: number;
  date_range: string;
  
  // Overall grade statistics
  total_grades_recorded: number;
  class_average_score: number;
  highest_class_score: number;
  lowest_class_score: number;
  
  // Overall attendance statistics
  total_attendance_records: number;
  overall_attendance_rate: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_excused: number;
  
  // Top performers
  top_performing_students: Array<{
    name: string;
    average_score: number;
    total_grades: number;
  }>;
  students_needing_attention: Array<{
    name: string;
    average_score: number;
    trend: string;
    attendance_rate: number;
  }>;
}

export interface ReportResponse {
  report_id: string;
  report_type: ReportType;
  generated_at: string;
  teacher_id: number;
  file_path?: string;
  
  summary: ReportSummary;
  student_data: StudentReportData[];
  
  total_students_included: number;
  date_range_start: string;
  date_range_end: string;
}

export interface ReportHistoryItem {
  report_id: string;
  report_type: ReportType;
  generated_at: string;
  date_range_start: string;
  date_range_end: string;
  total_students: number;
  file_path?: string;
  status: string;
}

export interface ReportHistoryResponse {
  reports: ReportHistoryItem[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface EmailReportRequest {
  report_id: string;
  recipient_emails: string[];
  subject: string;
  message?: string;
  include_attachment?: boolean;
}

export interface EmailReportResponse {
  message: string;
  emails_sent: number;
  failed_emails: number;
  details?: string[];
}

export interface ReportStats {
  total_reports: number;
  report_types: Record<string, number>;
  recent_reports: number;
  most_common_type?: string;
}

export interface ReportHistoryParams {
  page?: number;
  page_size?: number;
}

export interface Semester {
  id: number;
  name: string;
  semester_type: string;
  start_date: string;
  end_date: string;
  status: string;
  is_current: boolean;
  description?: string;
  teacher_id?: number;
  created_at?: string;
  updated_at?: string;
  academic_year_name?: string;
  academic_year_id?: number;
}

// API functions for report operations
export const generateReport = async (payload: ReportRequest): Promise<ReportResponse> => {
  const response = await apiClient.post('/reports/generate', payload);
  return response.data;
};

export const getReport = async (reportId: string): Promise<ReportResponse> => {
  const response = await apiClient.get(`/reports/${reportId}`);
  return response.data;
};

export const getReportHistory = async (params: ReportHistoryParams = {}): Promise<ReportHistoryResponse> => {
  const { page = 1, page_size = 10 } = params;
  const response = await apiClient.get('/reports/history/list', {
    params: { page, page_size }
  });
  return response.data;
};

export const emailReport = async (payload: EmailReportRequest): Promise<EmailReportResponse> => {
  const response = await apiClient.post('/reports/email', payload);
  return response.data;
};

export const getReportStats = async (): Promise<ReportStats> => {
  const response = await apiClient.get('/reports/stats/summary');
  return response.data;
};

export const getSemesters = async (): Promise<Semester[]> => {
  const response = await apiClient.get('/semesters/');
  return response.data;
};

// Helper functions for report configuration
export const getAvailableReportTypes = (): Array<{ value: ReportType; label: string }> => [
  { value: ReportType.SINGLE_STUDENT, label: 'Single Student Report (Sent to Parent)' },
  { value: ReportType.SCHOOL_ADMINISTRATIVE, label: 'School Administrative Report (Sent to Administrator)' }
];

export const getAvailableFormats = (): Array<{ value: ReportFormat; label: string }> => [
  { value: ReportFormat.EXCEL, label: 'Excel (.xlsx)' },
  { value: ReportFormat.PDF, label: 'PDF (Coming Soon)' }
];

// Date helpers for report configuration
export const getDateRangePresets = () => [
  {
    label: 'Last 7 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
  },
  {
    label: 'Current Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
  },
  {
    label: 'Previous Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
  },
  {
    label: 'Current Quarter',
    getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
  }
];