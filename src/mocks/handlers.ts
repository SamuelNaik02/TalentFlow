import { http, HttpResponse, passthrough } from 'msw';
import type { Job, Candidate, Assessment, AssessmentResponse, PaginatedResponse } from '../types';
import { db } from '../db/database';

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate random errors
const shouldError = () => Math.random() < 0.1; // 10% error rate

// Utility function to generate unique IDs
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const handlers = [
  // Passthrough handler for external APIs (like Gemini)
  http.all('https://generativelanguage.googleapis.com/*', () => {
    return passthrough();
  }),
  
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000); // 200-1200ms delay
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    try {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
      const sort = url.searchParams.get('sort') || 'order';

      // Get all jobs from IndexedDB
      let jobs = await db.jobs.toArray();
      console.log('MSW: Fetched', jobs.length, 'jobs from IndexedDB');

      // Apply filters
      if (search) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description?.toLowerCase().includes(search.toLowerCase()) ||
          job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        );
      }

      if (status) {
        jobs = jobs.filter(job => job.status === status);
      }

      // Sort
      if (sort === 'title') {
        jobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'created') {
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        jobs.sort((a, b) => a.order - b.order);
      }

      // Pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedJobs = jobs.slice(startIndex, endIndex);

      const response: PaginatedResponse<Job> = {
        data: paginatedJobs,
        total: jobs.length,
        page,
        pageSize,
        totalPages: Math.ceil(jobs.length / pageSize)
      };

      console.log('MSW: Returning', paginatedJobs.length, 'jobs for page', page, 'of', Math.ceil(jobs.length / pageSize));
      console.log('MSW: Total jobs:', jobs.length);
      return HttpResponse.json(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return HttpResponse.json({ message: 'Failed to fetch jobs' }, { status: 500 });
    }
  }),

  // List all assessments
  http.get('/api/assessments', async () => {
    await delay(200 + Math.random() * 1000);
    try {
      const assessments = await db.assessments.toArray();
      return HttpResponse.json(assessments);
    } catch (error) {
      console.error('Error listing assessments:', error);
      return HttpResponse.json({ message: 'Failed to fetch assessments' }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to create job' }, { status: 500 });
    }

    try {
      const jobData = await request.json() as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;
      
      // Get the next order number
      const existingJobs = await db.jobs.toArray();
      const maxOrder = existingJobs.length > 0 ? Math.max(...existingJobs.map(j => j.order)) : 0;
      
      const newJob: Job = {
        id: generateId(),
        ...jobData,
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Write to IndexedDB
      await db.jobs.add(newJob);
      
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      console.error('Error creating job:', error);
      return HttpResponse.json({ message: 'Failed to create job' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to update job' }, { status: 500 });
    }

    try {
      const { id } = params;
      const updates = await request.json() as Partial<Job>;
      
      // Check if job exists
      const existingJob = await db.jobs.get(id as string);
      if (!existingJob) {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      }

      const updatedJob = { 
        ...existingJob, 
        ...updates, 
        updatedAt: new Date() 
      };

      // Write to IndexedDB
      await db.jobs.put(updatedJob);
      
      return HttpResponse.json(updatedJob);
    } catch (error) {
      console.error('Error updating job:', error);
      return HttpResponse.json({ message: 'Failed to update job' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to reorder jobs' }, { status: 500 });
    }

    try {
      const { id } = params;
      const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
      
      // Get the job to reorder
      const job = await db.jobs.get(id as string);
      if (!job) {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      }

      // Get all jobs and update their order
      const allJobs = await db.jobs.toArray();
      
      // Update the specific job's order
      job.order = toOrder;
      await db.jobs.put(job);

      // Reorder other jobs if necessary
      if (fromOrder !== toOrder) {
        const jobsToUpdate = allJobs.filter(j => j.id !== id);
        for (const j of jobsToUpdate) {
          if (fromOrder < toOrder && j.order > fromOrder && j.order <= toOrder) {
            j.order -= 1;
            await db.jobs.put(j);
          } else if (fromOrder > toOrder && j.order >= toOrder && j.order < fromOrder) {
            j.order += 1;
            await db.jobs.put(j);
          }
        }
      }
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error('Error reordering jobs:', error);
      return HttpResponse.json({ message: 'Failed to reorder jobs' }, { status: 500 });
    }
  }),

  http.delete('/api/jobs/:id', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to delete job' }, { status: 500 });
    }

    try {
      const { id } = params;
      
      // Check if job exists
      const existingJob = await db.jobs.get(id as string);
      if (!existingJob) {
        return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
      }

      // Delete from IndexedDB
      await db.jobs.delete(id as string);
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting job:', error);
      return HttpResponse.json({ message: 'Failed to delete job' }, { status: 500 });
    }
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    try {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const stage = url.searchParams.get('stage') || '';
      const jobId = url.searchParams.get('jobId') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

      // Get all candidates from IndexedDB
      let candidates = await db.candidates.toArray();
      console.log('MSW: Fetched', candidates.length, 'candidates from IndexedDB');

      // Apply filters
      if (search) {
        candidates = candidates.filter(candidate => 
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (stage) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }

      if (jobId) {
        candidates = candidates.filter(candidate => candidate.jobId === jobId);
      }

      // Pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCandidates = candidates.slice(startIndex, endIndex);

      const response: PaginatedResponse<Candidate> = {
        data: paginatedCandidates,
        total: candidates.length,
        page,
        pageSize,
        totalPages: Math.ceil(candidates.length / pageSize)
      };

      return HttpResponse.json(response);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return HttpResponse.json({ message: 'Failed to fetch candidates' }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    try {
      const { id } = params;
      const candidate = await db.candidates.get(id as string);
      
      if (!candidate) {
        return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
      }

      return HttpResponse.json(candidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      return HttpResponse.json({ message: 'Failed to fetch candidate' }, { status: 500 });
    }
  }),

  http.post('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to create candidate' }, { status: 500 });
    }

    try {
      const candidateData = await request.json() as Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt'>;
      
      const newCandidate: Candidate = {
        id: generateId(),
        ...candidateData,
        appliedAt: new Date(),
        updatedAt: new Date()
      };

      // Write to IndexedDB
      await db.candidates.add(newCandidate);
      
      return HttpResponse.json(newCandidate, { status: 201 });
    } catch (error) {
      console.error('Error creating candidate:', error);
      return HttpResponse.json({ message: 'Failed to create candidate' }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to update candidate' }, { status: 500 });
    }

    try {
      const { id } = params;
      const updates = await request.json() as Partial<Candidate>;
      
      // Check if candidate exists
      const existingCandidate = await db.candidates.get(id as string);
      if (!existingCandidate) {
        return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
      }

      const updatedCandidate = { 
        ...existingCandidate, 
        ...updates, 
        updatedAt: new Date() 
      };

      // Write to IndexedDB
      await db.candidates.put(updatedCandidate);
      
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      console.error('Error updating candidate:', error);
      return HttpResponse.json({ message: 'Failed to update candidate' }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    try {
      const { id } = params;
      const candidate = await db.candidates.get(id as string);
      
      if (!candidate) {
        return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
      }

      // Return the candidate's timeline
      return HttpResponse.json(candidate.timeline || []);
    } catch (error) {
      console.error('Error fetching candidate timeline:', error);
      return HttpResponse.json({ message: 'Failed to fetch timeline' }, { status: 500 });
    }
  }),

  // Assessments endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    try {
      const { jobId } = params;
      const assessment = await db.assessments.where('jobId').equals(jobId as string).first();
      
      if (!assessment) {
        return HttpResponse.json({ message: 'Assessment not found' }, { status: 404 });
      }

      return HttpResponse.json(assessment);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return HttpResponse.json({ message: 'Failed to fetch assessment' }, { status: 500 });
    }
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to save assessment' }, { status: 500 });
    }

    try {
      const { jobId } = params;
      const assessmentData = await request.json() as Assessment;
      
      // Check if assessment exists
      const existingAssessment = await db.assessments.where('jobId').equals(jobId as string).first();
      
      let savedAssessment: Assessment;
      
      if (existingAssessment) {
        // Update existing assessment
        savedAssessment = { 
          ...existingAssessment, 
          ...assessmentData, 
          updatedAt: new Date() 
        };
        await db.assessments.put(savedAssessment);
      } else {
        // Create new assessment
        savedAssessment = { 
          ...assessmentData, 
          id: generateId(),
          jobId: jobId as string,
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        await db.assessments.add(savedAssessment);
      }

      return HttpResponse.json(savedAssessment);
    } catch (error) {
      console.error('Error saving assessment:', error);
      return HttpResponse.json({ message: 'Failed to save assessment' }, { status: 500 });
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to submit assessment' }, { status: 500 });
    }

    try {
      const { jobId } = params;
      const responseData = await request.json() as Omit<AssessmentResponse, 'id' | 'createdAt'>;
      
      const newResponse: AssessmentResponse = {
        ...responseData,
        id: generateId(),
        createdAt: new Date()
      };

      // Write to IndexedDB
      await db.assessmentResponses.add(newResponse);
      
      return HttpResponse.json(newResponse, { status: 201 });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      return HttpResponse.json({ message: 'Failed to submit assessment' }, { status: 500 });
    }
  })
];