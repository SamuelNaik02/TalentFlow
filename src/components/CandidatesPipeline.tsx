import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Shuffle from './Shuffle';
import { createCandidateActivity } from '../services/activityService';
import Stepper, { Step } from './Stepper';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  jobTitle: string;
  company: string;
  appliedDate: string;
  experience: string;
  skills: string[];
  avatar?: string;
  notes: string[];
  rating: number;
}

const CandidatesPipeline: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    experience: '',
    skills: [] as string[],
    notes: [] as string[]
  });

  const stages = [
    { key: 'Applied', label: 'Applied', color: '#E3F2FD', textColor: '#1976D2' },
    { key: 'Screening', label: 'Screening', color: '#FFF3E0', textColor: '#F57C00' },
    { key: 'Interview', label: 'Interview', color: '#F3E5F5', textColor: '#7B1FA2' },
    { key: 'Offer', label: 'Offer', color: '#E8F5E8', textColor: '#388E3C' },
    { key: 'Hired', label: 'Hired', color: '#E0F2F1', textColor: '#00695C' },
    { key: 'Rejected', label: 'Rejected', color: '#FFEBEE', textColor: '#D32F2F' }
  ];

  // Sample data
  useEffect(() => {
    const sampleCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        stage: 'Applied',
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        appliedDate: '2024-01-15',
        experience: '5 years',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        rating: 4.5,
        notes: ['Strong portfolio', 'Great communication']
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678',
        stage: 'Screening',
        jobTitle: 'Product Manager',
        company: 'StartupXYZ',
        appliedDate: '2024-01-14',
        experience: '4 years',
        skills: ['Product Management', 'Agile', 'Analytics', 'Figma'],
        rating: 4.2,
        notes: ['Passed initial screening', 'Good cultural fit']
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1 (555) 345-6789',
        stage: 'Interview',
        jobTitle: 'UX Designer',
        company: 'DesignStudio',
        appliedDate: '2024-01-10',
        experience: '3 years',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        rating: 4.8,
        notes: ['Excellent design skills', 'Scheduled for final interview']
      },
      {
        id: '4',
        name: 'David Kim',
        email: 'david.kim@email.com',
        phone: '+1 (555) 456-7890',
        stage: 'Offer',
        jobTitle: 'Backend Developer',
        company: 'DataFlow Systems',
        appliedDate: '2024-01-12',
        experience: '6 years',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
        rating: 4.6,
        notes: ['Technical interview passed', 'Salary negotiation in progress']
      },
      {
        id: '5',
        name: 'Lisa Wang',
        email: 'lisa.wang@email.com',
        phone: '+1 (555) 567-8901',
        stage: 'Hired',
        jobTitle: 'Marketing Specialist',
        company: 'GrowthCo',
        appliedDate: '2024-01-08',
        experience: '2 years',
        skills: ['Digital Marketing', 'Social Media', 'Analytics', 'Content Creation'],
        rating: 4.3,
        notes: ['Offer accepted', 'Start date: Feb 1st']
      },
      {
        id: '6',
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        phone: '+1 (555) 678-9012',
        stage: 'Rejected',
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        appliedDate: '2024-01-05',
        experience: '3 years',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        rating: 3.2,
        notes: ['Technical skills not up to par', 'Poor cultural fit']
      }
    ];
    setCandidates(sampleCandidates);
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'All' || candidate.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const getCandidatesByStage = (stage: string) => {
    return filteredCandidates.filter(candidate => candidate.stage === stage);
  };

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    if (draggedCandidate && draggedCandidate.stage !== newStage) {
      setCandidates(candidates.map(candidate =>
        candidate.id === draggedCandidate.id
          ? { ...candidate, stage: newStage as Candidate['stage'] }
          : candidate
      ));
      
      // Log stage change activity
      createCandidateActivity('candidate_stage_changed', draggedCandidate.name, draggedCandidate.id, newStage);
    }
    setDraggedCandidate(null);
  };

  const handleAddNote = (candidateId: string, note: string) => {
    if (note.trim()) {
      setCandidates(candidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, notes: [...candidate.notes, note] }
          : candidate
      ));
    }
  };

  const handleCreateCandidate = () => {
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      experience: '',
      skills: [],
      notes: []
    });
    setShowCreateModal(true);
  };

  const handleSaveCandidate = () => {
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) return;

    const candidateData: Candidate = {
      id: Date.now().toString(),
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      stage: 'Applied',
      jobTitle: newCandidate.jobTitle,
      company: newCandidate.company,
      appliedDate: new Date().toISOString().split('T')[0],
      experience: newCandidate.experience,
      skills: newCandidate.skills,
      rating: 0,
      notes: newCandidate.notes
    };

    setCandidates([...candidates, candidateData]);
    
    // Log candidate addition activity
    createCandidateActivity('candidate_added', candidateData.name, candidateData.id);
    
    setShowCreateModal(false);
  };

  const addSkill = () => {
    setNewCandidate({ ...newCandidate, skills: [...newCandidate.skills, ''] });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...newCandidate.skills];
    newSkills[index] = value;
    setNewCandidate({ ...newCandidate, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    setNewCandidate({ 
      ...newCandidate, 
      skills: newCandidate.skills.filter((_, i) => i !== index) 
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
        maxWidth: '1400px', 
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
              <span style={{ color: '#F06B4E' }}>Candidate</span> Pipeline
            </h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                background: 'white',
                color: '#1A3C34',
                padding: '10px 20px',
                border: '1px solid #1A3C34',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📊</span>
                Analytics
              </button>
              <button 
                onClick={handleCreateCandidate}
                style={{
                  background: '#F06B4E',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>+</span>
                Add Candidate
              </button>
            </div>
          </div>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#666666', 
            lineHeight: '1.6',
            margin: '0 0 30px 0'
          }}>
            Manage your candidate pipeline with drag-and-drop kanban boards. Track progress, add notes, and collaborate with your team.
          </p>

          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search candidates by name, email, or job title..."
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
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="All">All Stages</option>
              {stages.map(stage => (
                <option key={stage.key} value={stage.key}>{stage.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="hide-scrollbar" style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto',
          paddingBottom: '20px'
        }}>
          {stages.map(stage => {
            const stageCandidates = getCandidatesByStage(stage.key);
            return (
              <div
                key={stage.key}
                style={{
                  minWidth: '300px',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #F0F0F0'
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: stage.textColor,
                    margin: '0'
                  }}>
                    {stage.label}
                  </h3>
                  <span style={{
                    background: stage.color,
                    color: stage.textColor,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {stageCandidates.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stageCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate)}
                      style={{
                        background: 'white',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#F0F8FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1A3C34',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#222222', 
                              margin: '0 0 2px 0' 
                            }}>
                              {candidate.name}
                            </h4>
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#666666', 
                              margin: '0' 
                            }}>
                              {candidate.jobTitle}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#666666' }}>
                            ⭐ {candidate.rating}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#666666', 
                          margin: '0 0 8px 0' 
                        }}>
                          {candidate.company} • {candidate.experience}
                        </p>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index}
                              style={{
                                background: '#F8F9FA',
                                color: '#666666',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10px'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span style={{
                              background: '#F8F9FA',
                              color: '#666666',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px'
                            }}>
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '12px',
                        borderTop: '1px solid #F0F0F0'
                      }}>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#999' 
                        }}>
                          Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#666666'
                          }}>
                            💬
                          </button>
                          <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#666666'
                          }}>
                            📝
                          </button>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {candidate.notes.length > 0 && (
                        <div style={{ 
                          marginTop: '12px', 
                          paddingTop: '12px', 
                          borderTop: '1px solid #F0F0F0' 
                        }}>
                          <div style={{ fontSize: '11px', color: '#666666', marginBottom: '6px' }}>
                            Notes:
                          </div>
                          {candidate.notes.map((note, index) => (
                            <div 
                              key={index}
                              style={{
                                background: '#F8F9FA',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: '#666666',
                                marginBottom: '4px'
                              }}
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCandidates.length === 0 && (
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
              👥
            </div>
            <h3 style={{ 
              fontSize: '24px', 
              color: '#222222', 
              marginBottom: '12px' 
            }}>
              No candidates found
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#666666', 
              marginBottom: '24px' 
            }}>
              {searchTerm || selectedStage !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Add your first candidate to get started.'}
            </p>
            {!searchTerm && selectedStage === 'All' && (
              <button 
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
                Add Your First Candidate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Candidate Modal with Stepper */}
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
                Add New Candidate
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
                handleSaveCandidate();
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
                    Step 1: Personal Information
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      placeholder="Enter candidate's full name"
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
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newCandidate.email}
                        onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                        placeholder="Enter email address"
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
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newCandidate.phone}
                        onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                        placeholder="Enter phone number"
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={newCandidate.jobTitle}
                        onChange={(e) => setNewCandidate({ ...newCandidate, jobTitle: e.target.value })}
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

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Company
                      </label>
                      <input
                        type="text"
                        value={newCandidate.company}
                        onChange={(e) => setNewCandidate({ ...newCandidate, company: e.target.value })}
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
                    Step 2: Professional Details
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
                      Experience
                    </label>
                    <input
                      type="text"
                      value={newCandidate.experience}
                      onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value })}
                      placeholder="e.g., 3 years"
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
                      marginBottom: '12px',
                      color: '#222222',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Skills
                    </label>
                    {newCandidate.skills.map((skill, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          placeholder="Enter skill"
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
                          onClick={() => removeSkill(index)}
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
                      onClick={addSkill}
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
                      + Add Skill
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
                      Review the candidate details:
                    </p>
                    <div style={{ textAlign: 'left', background: 'white', padding: '20px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Name:</strong> {newCandidate.name || 'Not specified'}
                      </p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Email:</strong> {newCandidate.email || 'Not specified'}
                      </p>
                      {newCandidate.phone && (
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Phone:</strong> {newCandidate.phone}
                        </p>
                      )}
                      {newCandidate.jobTitle && (
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Job Title:</strong> {newCandidate.jobTitle}
                        </p>
                      )}
                      {newCandidate.company && (
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Company:</strong> {newCandidate.company}
                        </p>
                      )}
                      {newCandidate.experience && (
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Experience:</strong> {newCandidate.experience}
                        </p>
                      )}
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Skills:</strong> {newCandidate.skills.filter(s => s.trim()).length} items
                      </p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                        <strong>Stage:</strong> Applied
                      </p>
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666666',
                    fontFamily: 'Glacial Indifference, Arial, sans-serif'
                  }}>
                    Click "Complete" to add this candidate to the pipeline.
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

export default CandidatesPipeline;
