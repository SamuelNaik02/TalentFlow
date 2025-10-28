import Dexie, { Table } from 'dexie';
import { Job, Candidate, Assessment, AssessmentResponse, TimelineEvent } from '../types';

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  responses!: Table<AssessmentResponse>;
  timelineEvents!: Table<TimelineEvent>;

  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt, updatedAt',
      candidates: 'id, name, email, stage, jobId, appliedAt, updatedAt',
      assessments: 'id, jobId, title, createdAt, updatedAt',
      responses: 'id, assessmentId, candidateId, submittedAt',
      timelineEvents: 'id, candidateId, type, timestamp'
    });
  }
}

export const db = new TalentFlowDB();

// Initialize with seed data if empty
export const initializeDatabase = async () => {
  const jobCount = await db.jobs.count();
  
  if (jobCount === 0) {
    // Seed jobs
    const seedJobs: Job[] = [
      {
        id: 'job-1',
        title: 'Senior React Developer',
        slug: 'senior-react-developer',
        status: 'active',
        tags: ['React', 'TypeScript', 'Node.js'],
        order: 1,
        description: 'We are looking for a Senior React Developer to join our team...',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of experience with React and TypeScript',
          'Strong problem-solving skills',
          'Excellent communication skills'
        ],
        location: 'Remote',
        salary: '$120,000 - $160,000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'job-2',
        title: 'Frontend Engineer',
        slug: 'frontend-engineer',
        status: 'active',
        tags: ['JavaScript', 'CSS', 'HTML'],
        order: 2,
        description: 'Join our frontend team to build amazing user experiences...',
        requirements: [
          '3+ years of frontend development experience',
          'Proficiency in JavaScript, CSS, and HTML',
          'Experience with modern frontend frameworks',
          'Strong attention to detail'
        ],
        location: 'New York',
        salary: '$90,000 - $130,000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await db.jobs.bulkAdd(seedJobs);

    // Seed candidates
    const seedCandidates: Candidate[] = Array.from({ length: 100 }, (_, index) => ({
      id: `candidate-${index + 1}`,
      name: `Candidate ${index + 1}`,
      email: `candidate${index + 1}@email.com`,
      stage: ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'][Math.floor(Math.random() * 6)] as Candidate['stage'],
      jobId: seedJobs[Math.floor(Math.random() * seedJobs.length)].id,
      phone: `+1-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await db.candidates.bulkAdd(seedCandidates);
  }
};
