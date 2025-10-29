import Dexie from 'dexie';
import type { Job, Candidate, Assessment, AssessmentResponse } from '../types';
import { generateSeedData } from './seedDataGenerator';

// Database schema definition
export class TalentFlowDB extends Dexie {
  jobs!: Dexie.Table<Job>;
  candidates!: Dexie.Table<Candidate>;
  assessments!: Dexie.Table<Assessment>;
  assessmentResponses!: Dexie.Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: 'id, title, slug, status, tags, order, createdAt, updatedAt',
      candidates: 'id, name, email, stage, jobId, appliedAt, updatedAt',
      assessments: 'id, jobId, title, createdAt, updatedAt',
      assessmentResponses: 'id, assessmentId, candidateId, completedAt, createdAt'
    });

    // Add hooks for automatic timestamps
    this.jobs.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.jobs.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    this.candidates.hook('creating', function (primKey, obj, trans) {
      obj.appliedAt = new Date();
      obj.updatedAt = new Date();
    });

    this.candidates.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    this.assessments.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.assessments.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    this.assessmentResponses.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
    });
  }
}

// Create database instance
export const db = new TalentFlowDB();

// Database utility functions
export const dbUtils = {
  // Clear all data (useful for development/testing)
  async clearAll(): Promise<void> {
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses], async () => {
      await db.jobs.clear();
      await db.candidates.clear();
      await db.assessments.clear();
      await db.assessmentResponses.clear();
    });
  },

  // Get database statistics
  async getStats(): Promise<{
    jobs: number;
    candidates: number;
    assessments: number;
    responses: number;
  }> {
    const [jobs, candidates, assessments, responses] = await Promise.all([
      db.jobs.count(),
      db.candidates.count(),
      db.assessments.count(),
      db.assessmentResponses.count()
    ]);

    return { jobs, candidates, assessments, responses };
  },

  // Export all data (useful for backup)
  async exportData(): Promise<{
    jobs: Job[];
    candidates: Candidate[];
    assessments: Assessment[];
    responses: AssessmentResponse[];
  }> {
    const [jobs, candidates, assessments, responses] = await Promise.all([
      db.jobs.toArray(),
      db.candidates.toArray(),
      db.assessments.toArray(),
      db.assessmentResponses.toArray()
    ]);

    return { jobs, candidates, assessments, responses };
  },

  // Import data (useful for restore)
  async importData(data: {
    jobs: Job[];
    candidates: Candidate[];
    assessments: Assessment[];
    responses: AssessmentResponse[];
  }): Promise<void> {
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses], async () => {
      await db.jobs.bulkPut(data.jobs);
      await db.candidates.bulkPut(data.candidates);
      await db.assessments.bulkPut(data.assessments);
      await db.assessmentResponses.bulkPut(data.responses);
    });
  }
};

// Initialize database and seed with sample data if empty or incomplete
export async function initializeDatabase(): Promise<void> {
  try {
    // Check database statistics
    const stats = await dbUtils.getStats();
    console.log('Current database stats:', stats);
    
    // Check if database is empty or has incomplete seed data (old seed data)
    if (stats.jobs === 0 || stats.jobs !== 25 || stats.candidates !== 1000 || stats.assessments !== 4) {
      console.log('Database is empty or has incomplete data. Re-seeding...');
      
      // Clear existing data if any
      if (stats.jobs > 0 || stats.candidates > 0 || stats.assessments > 0) {
        console.log('Clearing existing data...');
        await dbUtils.clearAll();
      }
      
      // Seed with new data
      await seedDatabase();
    } else {
      console.log('Database already has complete seed data (25 jobs, 1000 candidates, 3 assessments)');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Seed database with sample data
async function seedDatabase(): Promise<void> {
  console.log('Generating seed data (25 jobs, 1000 candidates, 4 assessments)...');
  
  // Generate seed data
  const { jobs, candidates, assessments } = generateSeedData();

  // Insert sample data in batches to avoid memory issues
  await db.transaction('rw', [db.jobs, db.candidates, db.assessments], async () => {
    await db.jobs.bulkAdd(jobs);
    console.log(`✓ Inserted ${jobs.length} jobs`);
    
    // Insert candidates in batches of 100 to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      await db.candidates.bulkAdd(batch);
      console.log(`✓ Inserted ${Math.min(i + batchSize, candidates.length)}/${candidates.length} candidates`);
    }
    
    await db.assessments.bulkAdd(assessments);
    console.log(`✓ Inserted ${assessments.length} assessments`);
  });

  console.log('Database seeded successfully with:');
  console.log(`- ${jobs.length} jobs (mixed active/archived)`);
  console.log(`- ${candidates.length} candidates randomly assigned to jobs and stages`);
  console.log(`- ${assessments.length} assessments with 10+ questions each`);
}

// Export the database instance and utilities
export default db;
