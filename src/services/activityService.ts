// Activity interface
export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  entityId: string;
  entityType: string;
  timestamp: string;
  userId?: string;
}

// Activity service class
class ActivityService {
  private activities: Activity[] = [];

  // Create a new activity
  createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    this.activities.unshift(newActivity); // Add to beginning for recent first
    
    // Keep only last 100 activities to prevent memory issues
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }
    
    return newActivity;
  }

  // Get recent activities (last 10)
  getRecentActivities(): Activity[] {
    return this.activities.slice(0, 10);
  }

  // Clear all activities (for testing)
  clearActivities(): void {
    this.activities = [];
  }
}

// Export singleton instance
export const activityService = new ActivityService();

// Helper functions for creating specific activity types
export const createJobActivity = (type: 'job_created' | 'job_updated' | 'job_archived' | 'job_activated', jobTitle: string, jobId: string) => {
  const titles = {
    job_created: 'New Job Created',
    job_updated: 'Job Updated',
    job_archived: 'Job Archived',
    job_activated: 'Job Activated'
  };

  const descriptions = {
    job_created: `"${jobTitle}" has been created`,
    job_updated: `"${jobTitle}" has been updated`,
    job_archived: `"${jobTitle}" has been archived`,
    job_activated: `"${jobTitle}" has been activated`
  };

  return activityService.createActivity({
    type,
    title: titles[type],
    description: descriptions[type],
    entityId: jobId,
    entityType: 'job'
  });
};

export const createCandidateActivity = (type: 'candidate_added' | 'candidate_stage_changed', candidateName: string, candidateId: string, stage?: string) => {
  const titles = {
    candidate_added: 'New Candidate Added',
    candidate_stage_changed: 'Candidate Stage Updated'
  };

  const descriptions = {
    candidate_added: `"${candidateName}" has been added to the pipeline`,
    candidate_stage_changed: `"${candidateName}" moved to ${stage} stage`
  };

  return activityService.createActivity({
    type,
    title: titles[type],
    description: descriptions[type],
    entityId: candidateId,
    entityType: 'candidate'
  });
};

export const createAssessmentActivity = (type: 'assessment_created' | 'assessment_updated' | 'assessment_question_added', assessmentTitle: string, assessmentId: string) => {
  const titles = {
    assessment_created: 'New Assessment Created',
    assessment_updated: 'Assessment Updated',
    assessment_question_added: 'Question Added to Assessment'
  };

  const descriptions = {
    assessment_created: `"${assessmentTitle}" assessment has been created`,
    assessment_updated: `"${assessmentTitle}" assessment has been updated`,
    assessment_question_added: `New question added to "${assessmentTitle}"`
  };

  return activityService.createActivity({
    type,
    title: titles[type],
    description: descriptions[type],
    entityId: assessmentId,
    entityType: 'assessment'
  });
};