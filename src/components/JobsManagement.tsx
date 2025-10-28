import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Shuffle from './Shuffle';
import { createJobActivity } from '../services/activityService';
import Stepper, { Step } from './Stepper';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  status: 'Active' | 'Paused' | 'Closed';
  applicants: number;
  postedDate: string;
  salary?: string;
  description: string;
  requirements: string[];
  tags: string[];
}

const JobsManagement: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time' as Job['type'],
    description: '',
    salary: '',
    requirements: [] as string[],
    tags: [] as string[]
  });

  const jobsPerPage = 8;

  // Sample data
  useEffect(() => {
    const sampleJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        status: 'Active',
        applicants: 24,
        postedDate: '2024-01-15',
        salary: '₹8,00,000 - ₹10,00,000',
        description: 'We are looking for a talented Senior Frontend Developer to join our team...',
        requirements: ['React', 'TypeScript', '5+ years experience'],
        tags: ['React', 'TypeScript', 'Frontend', 'Remote']
      },
      {
        id: '2',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'Full-time',
        status: 'Active',
        applicants: 18,
        postedDate: '2024-01-14',
        salary: '₹7,00,000 - ₹9,00,000',
        description: 'Join our growing team as a Product Manager...',
        requirements: ['Product Management', 'Agile', '3+ years experience'],
        tags: ['Product', 'Management', 'Agile']
      },
      {
        id: '3',
        title: 'UX Designer',
        company: 'DesignStudio',
        location: 'Remote',
        type: 'Contract',
        status: 'Paused',
        applicants: 12,
        postedDate: '2024-01-10',
        salary: '₹5,00,000 - ₹7,00,000',
        description: 'We need a creative UX Designer...',
        requirements: ['Figma', 'User Research', '2+ years experience'],
        tags: ['UX', 'Design', 'Figma', 'Remote']
      },
      {
        id: '4',
        title: 'Backend Developer',
        company: 'DataFlow Systems',
        location: 'Austin, TX',
        type: 'Full-time',
        status: 'Active',
        applicants: 31,
        postedDate: '2024-01-12',
        salary: '₹7,50,000 - ₹10,00,000',
        description: 'Looking for a skilled Backend Developer...',
        requirements: ['Node.js', 'Python', '4+ years experience'],
        tags: ['Backend', 'Node.js', 'Python', 'API']
      },
      {
        id: '5',
        title: 'Marketing Specialist',
        company: 'GrowthCo',
        location: 'Chicago, IL',
        type: 'Part-time',
        status: 'Closed',
        applicants: 8,
        postedDate: '2024-01-08',
        salary: '₹3,50,000 - ₹5,00,000',
        description: 'Join our marketing team...',
        requirements: ['Digital Marketing', 'Social Media', '2+ years experience'],
        tags: ['Marketing', 'Social Media', 'Digital']
      }
    ];
    setJobs(sampleJobs);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const handleCreateJob = () => {
    setEditingJob(null);
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      description: '',
      salary: '',
      requirements: [],
      tags: []
    });
    setShowCreateModal(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      salary: job.salary || '',
      requirements: job.requirements,
      tags: job.tags
    });
    setShowCreateModal(true);
  };

  const handleSaveJob = () => {
    if (!newJob.title.trim()) return;

    const jobData: Job = {
      id: editingJob ? editingJob.id : Date.now().toString(),
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      status: editingJob ? editingJob.status : 'Active',
      applicants: editingJob ? editingJob.applicants : 0,
      postedDate: editingJob ? editingJob.postedDate : new Date().toISOString().split('T')[0],
      salary: newJob.salary || undefined,
      description: newJob.description,
      requirements: newJob.requirements,
      tags: newJob.tags
    };

    if (editingJob) {
      setJobs(jobs.map(job => job.id === editingJob.id ? jobData : job));
      // Log job update activity
      createJobActivity('job_updated', jobData.title, jobData.id);
    } else {
      setJobs([...jobs, jobData]);
      // Log job creation activity
      createJobActivity('job_created', jobData.title, jobData.id);
    }

    setShowCreateModal(false);
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const handleStatusChange = (jobId: string, newStatus: Job['status']) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));

    // Log status change activity
    if (newStatus === 'Paused' || newStatus === 'Closed') {
      createJobActivity('job_archived', job.title, jobId);
    } else if (newStatus === 'Active') {
      createJobActivity('job_activated', job.title, jobId);
    }
  };

  const addRequirement = () => {
    setNewJob({ ...newJob, requirements: [...newJob.requirements, ''] });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...newJob.requirements];
    newRequirements[index] = value;
    setNewJob({ ...newJob, requirements: newRequirements });
  };

  const removeRequirement = (index: number) => {
    setNewJob({ 
      ...newJob, 
      requirements: newJob.requirements.filter((_, i) => i !== index) 
    });
  };

  const addTag = () => {
    setNewJob({ ...newJob, tags: [...newJob.tags, ''] });
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...newJob.tags];
    newTags[index] = value;
    setNewJob({ ...newJob, tags: newTags });
  };

  const removeTag = (index: number) => {
    setNewJob({ 
      ...newJob, 
      tags: newJob.tags.filter((_, i) => i !== index) 
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: '#F8F7F5'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        borderBottom: '1px solid #E0E0E0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div
          onClick={() => navigate('/dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Shuffle
              text="TalentFlow."
              tag="div"
              style={{
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1A3C34',
                fontFamily: '"Montserrat", Arial, sans-serif',
                letterSpacing: '0.5px',
                margin: 0,
                padding: 0
              }}
              shuffleDirection="right"
              duration={0.6}
              stagger={0.05}
              scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
              colorFrom="#F05A3C"
              colorTo="#1A3C34"
              triggerOnHover={true}
              threshold={0.8}
              onShuffleComplete={() => {}}
            />
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#F05A3C', 
            borderRadius: '50%' 
          }}></div>
        </div>
        
         <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Services Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowServicesDropdown(true)}
            onMouseLeave={() => setShowServicesDropdown(false)}
          >
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: '#222222', 
              fontSize: '16px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: '500'
            }}>
              Services
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            
            {showServicesDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '20px',
                minWidth: '400px',
                zIndex: 1000
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#222222', 
                  margin: '0 0 20px 0',
                  textAlign: 'center'
                }}>
                  Our Services
                </h3>
                
                {/* Job Management */}
                <div 
                  onClick={() => navigate('/jobs')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Job Management
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Create, manage, and track job postings with advanced filtering.
                  </p>
                </div>

                {/* Candidate Pipeline */}
                <div 
                  onClick={() => navigate('/candidates')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Candidate Pipeline
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Streamline your hiring process with kanban boards.
                  </p>
                </div>

                {/* Assessment Builder */}
                <div 
                  onClick={() => navigate('/assessments')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Assessment Builder
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Create custom assessments with multiple question types.
                  </p>
                </div>

                {/* Analytics & Reports */}
                <div 
                  onClick={() => navigate('/analytics')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Analytics & Reports
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Track hiring metrics and generate detailed reports.
                  </p>
                </div>

                {/* Team Collaboration */}
                <div 
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Team Collaboration
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Collaborate with your team on hiring decisions.
                  </p>
                </div>

                {/* Workflow Automation */}
                <div 
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Workflow Automation
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Automate repetitive tasks and streamline workflows.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <button style={{ 
            background: '#F5EDE0', 
            color: '#1A3C34', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px', 
            fontWeight: '500', 
            cursor: 'pointer',
            fontFamily: '"Montserrat", Arial, sans-serif'
          }}>
            Join our team!
          </button>
          
          {/* My Account Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowAccountDropdown(true)}
            onMouseLeave={() => setShowAccountDropdown(false)}
          >
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: '#222222', 
              fontSize: '16px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: '500'
            }}>
              My Account
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            
            {showAccountDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '20px',
                minWidth: '400px',
                zIndex: 1000
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#222222', 
                  margin: '0 0 20px 0',
                  textAlign: 'center'
                }}>
                  Account Settings
                </h3>
                
                {/* Profile Settings */}
                <div 
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Profile Settings
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Manage your personal information and preferences.
                  </p>
                </div>

                {/* Notifications */}
                <div 
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Notifications
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Configure your notification preferences and alerts.
                  </p>
                </div>

                {/* Log Out */}
                <div 
                  onClick={() => { onLogout(); navigate('/login'); }}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Log Out
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Sign out of your account securely.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hide-scrollbar" style={{ 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        {/* Page Header */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          marginBottom: '30px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#222222',
              margin: '0',
              fontFamily: '"Montserrat", Arial, sans-serif'
            }}>
              <span style={{ color: '#F06B4E' }}>Job</span> Management
            </h1>
            <button 
              onClick={handleCreateJob}
              style={{
                background: '#F06B4E',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span>
              Create New Job
            </button>
          </div>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#666666', 
            lineHeight: '1.6',
            margin: '0 0 30px 0'
          }}>
            Manage your job postings, track applications, and streamline your hiring process with our comprehensive job management tools.
          </p>

          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666666'
                }}
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
                color: '#222222'
              }}
            >
              <option value="All" style={{ color: '#222222' }}>All Status</option>
              <option value="Active" style={{ color: '#222222' }}>Active</option>
              <option value="Paused" style={{ color: '#222222' }}>Paused</option>
              <option value="Closed" style={{ color: '#222222' }}>Closed</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '24px',
          marginBottom: '40px'
        }}>
          {paginatedJobs.map((job) => (
            <div 
              key={job.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F0F0F0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 4px 0',
                    lineHeight: '1.3'
                  }}>
                    {job.title}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666666', 
                    margin: '0 0 8px 0' 
                  }}>
                    {job.company} • {job.location}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditJob(job);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #E0E0E0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      color: '#666666'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job.id);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #E0E0E0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      color: '#DC3545'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: job.status === 'Active' ? '#E8F5E8' : job.status === 'Paused' ? '#FFF3CD' : '#F8D7DA',
                    color: job.status === 'Active' ? '#155724' : job.status === 'Paused' ? '#856404' : '#721C24',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {job.status}
                  </span>
                  <span style={{
                    background: '#F0F8FF',
                    color: '#1A3C34',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {job.type}
                  </span>
                </div>
                
                {job.salary && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#F06B4E', 
                    fontWeight: '600',
                    margin: '0 0 8px 0' 
                  }}>
                    {job.salary}
                  </p>
                )}
                
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666666', 
                  lineHeight: '1.4',
                  margin: '0 0 12px 0' 
                }}>
                  {job.description.substring(0, 100)}...
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      style={{
                        background: '#F8F9FA',
                        color: '#666666',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 3 && (
                    <span style={{
                      background: '#F8F9FA',
                      color: '#666666',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}>
                      +{job.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #F0F0F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#666666' }}>
                    {job.applicants} applicants
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#666666' }}>
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job.id, e.target.value as Job['status'])}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px',
            marginTop: '40px'
          }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #E0E0E0',
                borderRadius: '6px',
                background: currentPage === 1 ? '#F5F5F5' : 'white',
                color: currentPage === 1 ? '#999' : '#222222',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  background: currentPage === page ? '#F06B4E' : 'white',
                  color: currentPage === page ? 'white' : '#222222',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #E0E0E0',
                borderRadius: '6px',
                background: currentPage === totalPages ? '#F5F5F5' : 'white',
                color: currentPage === totalPages ? '#999' : '#222222',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {paginatedJobs.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px' 
            }}>
              📋
            </div>
            <h3 style={{ 
              fontSize: '24px', 
              color: '#222222', 
              marginBottom: '12px' 
            }}>
              No jobs found
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#666666', 
              marginBottom: '24px' 
            }}>
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Create your first job posting to get started.'}
            </p>
            {!searchTerm && statusFilter === 'All' && (
              <button 
                onClick={handleCreateJob}
                style={{
                  background: '#F06B4E',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Create Your First Job
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Job Modal with Stepper */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            width: '700px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: '0',
                color: '#1A3C34',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666666',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8F9FA';
                  e.currentTarget.style.color = '#222222';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#666666';
                }}
              >
                ×
              </button>
            </div>

            <Stepper
              onFinalStepCompleted={() => {
                handleSaveJob();
                setShowCreateModal(false);
              }}
              backButtonText="Back"
              nextButtonText="Continue"
            >
              <Step>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '20px',
                    color: '#1A3C34',
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    Step 1: Basic Information
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '8px',
                      color: '#222222',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="Enter job title"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#222222',
                        background: 'white',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Company *
                      </label>
                      <input
                        type="text"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        placeholder="Enter company name"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#222222',
                          background: 'white',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Location *
                      </label>
                      <input
                        type="text"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="Enter location"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#222222',
                          background: 'white',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Job Type
                      </label>
                      <select
                        value={newJob.type}
                        onChange={(e) => setNewJob({ ...newJob, type: e.target.value as Job['type'] })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'white',
                          outline: 'none',
                          color: '#222222',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Salary (Optional)
                      </label>
                      <input
                        type="text"
                        value={newJob.salary}
                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                        placeholder="e.g., ₹3,50,000 - ₹5,00,000"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#222222',
                          background: 'white',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '8px',
                      color: '#222222',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Job Description
                    </label>
                    <textarea
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Enter job description"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#222222',
                        background: 'white',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'border-color 0.2s ease',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>
                </div>
              </Step>

              <Step>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '20px',
                    color: '#1A3C34',
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    Step 2: Requirements & Tags
                  </h3>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '12px',
                      color: '#222222',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Requirements
                    </label>
                    {newJob.requirements.map((req, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder="Enter requirement"
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            color: '#222222'
                          }}
                        />
                        <button
                          onClick={() => removeRequirement(index)}
                          style={{
                            background: '#DC3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addRequirement}
                      style={{
                        background: '#F8F9FA',
                        border: '1px solid #E0E0E0',
                        borderRadius: '6px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#222222',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1A3C34';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F8F9FA';
                        e.currentTarget.style.color = '#222222';
                      }}
                    >
                      + Add Requirement
                    </button>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '12px',
                      color: '#222222',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Tags
                    </label>
                    {newJob.tags.map((tag, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Enter tag"
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            color: '#222222'
                          }}
                        />
                        <button
                          onClick={() => removeTag(index)}
                          style={{
                            background: '#DC3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addTag}
                      style={{
                        background: '#F8F9FA',
                        border: '1px solid #E0E0E0',
                        borderRadius: '6px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#222222',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1A3C34';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F8F9FA';
                        e.currentTarget.style.color = '#222222';
                      }}
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>
              </Step>

              <Step>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '20px',
                    color: '#1A3C34',
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    Step 3: Review & Confirm
                  </h3>
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666666',
                      marginBottom: '16px',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Review your job details:
                    </p>
                    <div style={{ textAlign: 'left', background: 'white', padding: '20px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Title:</strong> {newJob.title || 'Not specified'}
                      </p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Company:</strong> {newJob.company || 'Not specified'}
                      </p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Location:</strong> {newJob.location || 'Not specified'}
                      </p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Job Type:</strong> {newJob.type || 'Not specified'}
                      </p>
                      {newJob.salary && (
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Salary:</strong> {newJob.salary}
                        </p>
                      )}
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Requirements:</strong> {newJob.requirements.length} items
                      </p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Tags:</strong> {newJob.tags.length} items
                      </p>
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666666',
                    fontFamily: 'Glacial Indifference, Arial, sans-serif'
                  }}>
                    Click "Complete" to {editingJob ? 'update' : 'create'} your job posting.
                  </p>
                </div>
              </Step>
            </Stepper>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div style={{ 
        position: 'fixed', 
        bottom: '40px', 
        right: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#1A3C34',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          💬
        </button>
        <button style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#F06B4E',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          👋
        </button>
      </div>
    </div>
  );
};

export default JobsManagement;