// Job types
export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  location?: string;
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

// Candidate types
export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  phone?: string;
  resume?: string;
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
}

// Assessment types
export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  question: string;
  required: boolean;
  options?: string[]; // For single-choice and multi-choice
  min?: number; // For numeric
  max?: number; // For numeric
  maxLength?: number; // For text fields
  conditional?: {
    dependsOn: string; // Question ID
    condition: string; // Value to check
  };
  order: number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: QuestionResponse[];
  submittedAt: string;
  score?: number;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | string[] | number | File;
}

// Timeline types
export interface TimelineEvent {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note' | 'assessment_completed' | 'interview_scheduled';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Filter and search types
export interface JobFilters {
  search?: string;
  status?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface CandidateFilters {
  search?: string;
  stage?: string;
  jobId?: string;
  page?: number;
  pageSize?: number;
}

// Activity types
export interface Activity {
  id: string;
  type: 'job_created' | 'job_updated' | 'job_archived' | 'job_activated' | 'candidate_added' | 'candidate_stage_changed' | 'assessment_created' | 'assessment_updated' | 'assessment_question_added';
  title: string;
  description: string;
  entityId: string;
  entityType: 'job' | 'candidate' | 'assessment';
  timestamp: string;
  userId?: string;
}

export interface ActivityFilters {
  type?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}
