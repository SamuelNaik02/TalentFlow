import type { Job, Candidate, Assessment, AssessmentResponse, PaginatedResponse, JobFilters, CandidateFilters } from '../types';
import { offlineService } from './offlineService';
import { db } from '../db/database';

const API_BASE_URL = '/api';

// Generic API call function with offline support
export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isWriteOperation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(options.method || 'GET');
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('apiCall making request to:', url);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return response.json();
  } catch (error) {
    // If offline and it's a write operation, queue it
    if (!offlineService.isConnected() && isWriteOperation) {
      console.log(`Queuing offline operation: ${options.method} ${endpoint}`);
      await offlineService.addToOfflineQueue(
        options.method as 'POST' | 'PATCH' | 'DELETE',
        endpoint,
        options.body ? JSON.parse(options.body as string) : undefined
      );
      
      // For write operations, we can return a mock response or throw a specific error
      // The UI should handle this gracefully
      throw new Error('Operation queued for when online');
    }
    
    throw error;
  }
}

// Jobs API
export const jobsApi = {
  getAll: async (filters: JobFilters = {}): Promise<PaginatedResponse<Job>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sort) params.append('sort', filters.sort);

    return apiCall<PaginatedResponse<Job>>(`/jobs?${params.toString()}`);
  },

  getById: async (id: string): Promise<Job> => {
    return apiCall<Job>(`/jobs/${id}`);
  },

  create: async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
    return apiCall<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  update: async (id: string, updates: Partial<Job>): Promise<Job> => {
    return apiCall<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  reorder: async (id: string, fromOrder: number, toOrder: number): Promise<void> => {
    await apiCall(`/jobs/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ fromOrder, toOrder }),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiCall(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Candidates API
export const candidatesApi = {
  getAll: async (filters: CandidateFilters = {}): Promise<PaginatedResponse<Candidate>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    return apiCall<PaginatedResponse<Candidate>>(`/candidates?${params.toString()}`);
  },

  getById: async (id: string): Promise<Candidate> => {
    return apiCall<Candidate>(`/candidates/${id}`);
  },

  create: async (candidate: Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt'>): Promise<Candidate> => {
    return apiCall<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidate),
    });
  },

  update: async (id: string, updates: Partial<Candidate>): Promise<Candidate> => {
    return apiCall<Candidate>(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  getTimeline: async (id: string): Promise<Candidate['timeline']> => {
    return apiCall<Candidate['timeline']>(`/candidates/${id}/timeline`);
  },
};

// Assessments API
export const assessmentsApi = {
  getAll: async (): Promise<any[]> => {
    return apiCall<any[]>(`/assessments`);
  },

  getByJobId: async (jobId: string): Promise<any> => { // Changed to any
    return apiCall<any>(`/assessments/${jobId}`);
  },

  save: async (jobId: string, assessment: any): Promise<any> => { // Changed to any
    return apiCall<any>(`/assessments/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    });
  },

  submitResponse: async (jobId: string, response: Omit<AssessmentResponse, 'id' | 'submittedAt'>): Promise<AssessmentResponse> => {
    return apiCall<AssessmentResponse>(`/assessments/${jobId}/submit`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  },
};
