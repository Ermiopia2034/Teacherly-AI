import apiClient from './client';

// TypeScript interfaces for Mark Allocation data structures
export interface MarkAllocationSummary {
  semester_id: number;
  semester_name: string;
  total_limit: number;
  total_allocated: number;
  remaining_marks: number;
  allocation_percentage: number;
  content_allocations: ContentAllocation[];
}

export interface ContentAllocation {
  content_id: number;
  content_title: string;
  content_type: string;
  allocated_marks: number;
  created_at: string;
}

export interface SemesterMarkLimit {
  semester_id: number;
  semester_name: string;
  total_limit: number;
  academic_year_name: string;
}

export interface AllocatedMarks {
  semester_id: number;
  total_allocated: number;
  content_count: number;
  content_allocations: ContentAllocation[];
}

export interface RemainingMarks {
  semester_id: number;
  total_limit: number;
  total_allocated: number;
  remaining_marks: number;
  allocation_percentage: number;
}

export interface MarkValidationPayload {
  marks: number;
  content_type?: string;
  exclude_content_id?: number;
}

export interface MarkValidationResult {
  is_valid: boolean;
  remaining_marks: number;
  would_exceed_limit: boolean;
  message: string;
}

// API functions for mark allocation operations
export const getSemesterAllocationSummary = async (semesterId: number): Promise<MarkAllocationSummary> => {
  const response = await apiClient.get(`/mark-allocation/semester/${semesterId}/summary`);
  return response.data;
};

export const getSemesterMarkLimit = async (semesterId: number): Promise<SemesterMarkLimit> => {
  const response = await apiClient.get(`/mark-allocation/semester/${semesterId}/limit`);
  return response.data;
};

export const getSemesterAllocatedMarks = async (semesterId: number): Promise<AllocatedMarks> => {
  const response = await apiClient.get(`/mark-allocation/semester/${semesterId}/allocated`);
  return response.data;
};

export const getSemesterRemainingMarks = async (semesterId: number): Promise<RemainingMarks> => {
  const response = await apiClient.get(`/mark-allocation/semester/${semesterId}/remaining`);
  return response.data;
};

export const validateMarkAllocation = async (
  semesterId: number,
  payload: MarkValidationPayload
): Promise<MarkValidationResult> => {
  // Convert payload to query parameters to match backend expectations
  const params = new URLSearchParams();
  params.append('requested_marks', payload.marks.toString());
  
  if (payload.exclude_content_id !== undefined) {
    params.append('exclude_content_id', payload.exclude_content_id.toString());
  }
  
  const response = await apiClient.post(`/mark-allocation/semester/${semesterId}/validate?${params.toString()}`);
  return response.data;
};

export const getCurrentSemesterAllocation = async (): Promise<MarkAllocationSummary | null> => {
  try {
    const response = await apiClient.get('/mark-allocation/current-semester');
    return response.data;
  } catch {
    // Return null if no current semester allocation
    return null;
  }
};