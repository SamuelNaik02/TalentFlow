import { http, HttpResponse } from 'msw';
import { Job, Candidate, Assessment, AssessmentResponse, TimelineEvent, PaginatedResponse } from '../types';

// Mock data storage
let jobs: Job[] = [];
let candidates: Candidate[] = [];
let assessments: Assessment[] = [];
let responses: AssessmentResponse[] = [];
let timelineEvents: TimelineEvent[] = [];

// Initialize with seed data
const initializeData = () => {
  // Generate 25 jobs
  const jobTitles = [
    'Senior React Developer', 'Frontend Engineer', 'Full Stack Developer',
    'UI/UX Designer', 'Product Manager', 'DevOps Engineer', 'Backend Developer',
    'Mobile App Developer', 'Data Scientist', 'QA Engineer', 'Tech Lead',
    'Software Architect', 'Cloud Engineer', 'Security Engineer', 'AI/ML Engineer',
    'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer',
    'Database Administrator', 'System Administrator', 'Network Engineer',
    'Cybersecurity Analyst', 'Business Analyst', 'Project Manager', 'Scrum Master'
  ];

  const tags = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis'];

  jobs = jobTitles.map((title, index) => ({
    id: `job-${index + 1}`,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    status: Math.random() > 0.2 ? 'active' : 'archived',
    tags: tags.slice(0, Math.floor(Math.random() * 4) + 1),
    order: index + 1,
    description: `We are looking for a ${title} to join our team...`,
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience in relevant technologies',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ],
    location: ['Remote', 'New York', 'San Francisco', 'London', 'Berlin'][Math.floor(Math.random() * 5)],
    salary: `$${Math.floor(Math.random() * 100000) + 50000} - $${Math.floor(Math.random() * 100000) + 150000}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Generate 1000 candidates
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria', 'James', 'Anna', 'Robert', 'Julia', 'Michael', 'Sophia', 'William', 'Olivia', 'Richard', 'Ava'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  candidates = Array.from({ length: 1000 }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const jobId = jobs[Math.floor(Math.random() * jobs.length)].id;
    
    return {
      id: `candidate-${index + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      stage,
      jobId,
      phone: `+1-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      appliedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Generate 3 assessments with 10+ questions each
  const questionTypes: AssessmentQuestion['type'][] = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric'];
  
  assessments = jobs.slice(0, 3).map((job, jobIndex) => ({
    id: `assessment-${jobIndex + 1}`,
    jobId: job.id,
    title: `${job.title} Assessment`,
    description: `Technical assessment for ${job.title} position`,
    sections: [
      {
        id: `section-${jobIndex + 1}-1`,
        title: 'Technical Knowledge',
        order: 1,
        questions: Array.from({ length: 5 }, (_, qIndex) => ({
          id: `q-${jobIndex + 1}-1-${qIndex + 1}`,
          type: questionTypes[Math.floor(Math.random() * questionTypes.length)],
          question: `Technical question ${qIndex + 1} for ${job.title}`,
          required: Math.random() > 0.3,
          options: questionTypes.includes('single-choice') || questionTypes.includes('multi-choice') 
            ? ['Option A', 'Option B', 'Option C', 'Option D'] 
            : undefined,
          order: qIndex + 1
        }))
      },
      {
        id: `section-${jobIndex + 1}-2`,
        title: 'Problem Solving',
        order: 2,
        questions: Array.from({ length: 5 }, (_, qIndex) => ({
          id: `q-${jobIndex + 1}-2-${qIndex + 1}`,
          type: questionTypes[Math.floor(Math.random() * questionTypes.length)],
          question: `Problem solving question ${qIndex + 1} for ${job.title}`,
          required: Math.random() > 0.3,
          options: questionTypes.includes('single-choice') || questionTypes.includes('multi-choice') 
            ? ['Option A', 'Option B', 'Option C', 'Option D'] 
            : undefined,
          order: qIndex + 1
        }))
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

// Initialize data
initializeData();

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate random errors
const shouldError = () => Math.random() < 0.1; // 10% error rate

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000); // 200-1200ms delay
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let filteredJobs = jobs;

    if (search) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    // Sort
    if (sort === 'title') {
      filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'created') {
      filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filteredJobs.sort((a, b) => a.order - b.order);
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    const response: PaginatedResponse<Job> = {
      data: paginatedJobs,
      total: filteredJobs.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredJobs.length / pageSize)
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to create job' }, { status: 500 });
    }

    const jobData = await request.json() as Partial<Job>;
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: jobData.title || '',
      slug: jobData.slug || '',
      status: 'active',
      tags: jobData.tags || [],
      order: Math.max(...jobs.map(j => j.order)) + 1,
      description: jobData.description || '',
      requirements: jobData.requirements || [],
      location: jobData.location || '',
      salary: jobData.salary || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    jobs.push(newJob);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to update job' }, { status: 500 });
    }

    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    
    const jobIndex = jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    jobs[jobIndex] = { ...jobs[jobIndex], ...updates, updatedAt: new Date().toISOString() };
    return HttpResponse.json(jobs[jobIndex]);
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to reorder jobs' }, { status: 500 });
    }

    const { id } = params;
    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    const jobIndex = jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // Update order
    jobs[jobIndex].order = toOrder;
    jobs.sort((a, b) => a.order - b.order);
    
    return HttpResponse.json({ success: true });
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const jobId = url.searchParams.get('jobId') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let filteredCandidates = candidates;

    if (search) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stage) {
      filteredCandidates = filteredCandidates.filter(candidate => candidate.stage === stage);
    }

    if (jobId) {
      filteredCandidates = filteredCandidates.filter(candidate => candidate.jobId === jobId);
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    const response: PaginatedResponse<Candidate> = {
      data: paginatedCandidates,
      total: filteredCandidates.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredCandidates.length / pageSize)
    };

    return HttpResponse.json(response);
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to update candidate' }, { status: 500 });
    }

    const { id } = params;
    const updates = await request.json() as Partial<Candidate>;
    
    const candidateIndex = candidates.findIndex(candidate => candidate.id === id);
    if (candidateIndex === -1) {
      return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
    }

    candidates[candidateIndex] = { ...candidates[candidateIndex], ...updates, updatedAt: new Date().toISOString() };
    return HttpResponse.json(candidates[candidateIndex]);
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    const { id } = params;
    const candidateTimeline = timelineEvents.filter(event => event.candidateId === id);
    
    return HttpResponse.json(candidateTimeline);
  }),

  // Assessments endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    const { jobId } = params;
    const assessment = assessments.find(a => a.jobId === jobId);
    
    if (!assessment) {
      return HttpResponse.json({ message: 'Assessment not found' }, { status: 404 });
    }

    return HttpResponse.json(assessment);
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to save assessment' }, { status: 500 });
    }

    const { jobId } = params;
    const assessmentData = await request.json() as Assessment;
    
    const existingIndex = assessments.findIndex(a => a.jobId === jobId);
    if (existingIndex >= 0) {
      assessments[existingIndex] = { ...assessmentData, updatedAt: new Date().toISOString() };
    } else {
      assessments.push({ ...assessmentData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    return HttpResponse.json(assessments[existingIndex >= 0 ? existingIndex : assessments.length - 1]);
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ message: 'Failed to submit assessment' }, { status: 500 });
    }

    const { jobId } = params;
    const responseData = await request.json() as AssessmentResponse;
    
    const newResponse: AssessmentResponse = {
      ...responseData,
      id: `response-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };

    responses.push(newResponse);
    return HttpResponse.json(newResponse, { status: 201 });
  })
];
