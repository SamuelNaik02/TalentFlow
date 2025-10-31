import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X, Search } from 'lucide-react';
import { candidatesApi } from '../services/api';
import type { Candidate, PaginatedResponse } from '../types';
import Shuffle from './Shuffle';

const CandidatesListPage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [candidateTimeline, setCandidateTimeline] = useState<Array<{ stage: string; timestamp: Date | string; note?: string }>>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      try {
        // Load all candidates (max 2000 to get all seed data)
        const res: PaginatedResponse<Candidate> = await candidatesApi.getAll({
          page: 1,
          pageSize: 2000,
          search: '',
          stage: ''
        });
        setCandidates(res.data);
        console.log(`Loaded ${res.data.length} candidates`);
      } catch (error) {
        console.error('Failed to load candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  // Filter candidates based on search and stage
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = searchTerm === '' || 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === '' || candidate.stage === stageFilter;
      
      return matchesSearch && matchesStage;
    });
  }, [candidates, searchTerm, stageFilter]);

  const handleViewDetails = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
    try {
      // First try to use the candidate's timeline if available
      if (candidate.timeline && candidate.timeline.length > 0) {
        setCandidateTimeline(candidate.timeline.map(t => ({
          stage: t.stage,
          timestamp: t.timestamp,
          note: t.note
        })));
      } else {
        // Otherwise fetch from API
        const timeline = await candidatesApi.getTimeline(candidate.id);
        setCandidateTimeline(timeline as any);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
      // Fallback to candidate's timeline if available
      if (candidate.timeline && candidate.timeline.length > 0) {
        setCandidateTimeline(candidate.timeline.map(t => ({
          stage: t.stage,
          timestamp: t.timestamp,
          note: t.note
        })));
      } else {
        setCandidateTimeline([]);
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedCandidate(null);
    setCandidateTimeline([]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '16px 24px',
        borderBottom: '1px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        zIndex: 1000,
        overflow: 'visible'
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'visible' }}>
          {/* Services Dropdown */}
          <div
            style={{ position: 'relative', overflow: 'visible' }}
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
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>

            {showServicesDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: '0',
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '20px',
                width: '500px',
                zIndex: 10000,
                maxHeight: '75vh',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#222222',
                  margin: '0 0 20px 0',
                  textAlign: 'center',
                  fontFamily: '"Montserrat", Arial, sans-serif'
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
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Job Management
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Create, manage, and track job postings with advanced filtering.
                  </p>
                </div>

                 {/* Candidates */}
                 <div
                   onClick={() => navigate('/candidates-list-page')}
                   style={{
                     padding: '16px 0',
                     borderBottom: '1px solid #E0E0E0',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.color = '#F06B4E';
                     const h4 = e.currentTarget.querySelector('h4');
                     const p = e.currentTarget.querySelector('p');
                     if (h4) h4.style.color = '#F06B4E';
                     if (p) p.style.color = '#F06B4E';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.color = '#222222';
                     const h4 = e.currentTarget.querySelector('h4');
                     const p = e.currentTarget.querySelector('p');
                     if (h4) h4.style.color = '#222222';
                     if (p) p.style.color = '#666666';
                   }}
                 >
                   <h4 style={{
                     fontSize: '16px',
                     fontWeight: 'bold',
                     color: '#222222',
                     margin: '0 0 6px 0',
                     transition: 'color 0.3s ease',
                     fontFamily: 'Arial, sans-serif'
                   }}>
                     Candidates
                   </h4>
                   <p style={{
                     fontSize: '13px',
                     color: '#666666',
                     margin: '0',
                     lineHeight: '1.4',
                     transition: 'color 0.3s ease',
                     fontFamily: 'Arial, sans-serif'
                   }}>
                     View and manage all candidates with search and filters.
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
                     const h4 = e.currentTarget.querySelector('h4');
                     const p = e.currentTarget.querySelector('p');
                     if (h4) h4.style.color = '#F06B4E';
                     if (p) p.style.color = '#F06B4E';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.color = '#222222';
                     const h4 = e.currentTarget.querySelector('h4');
                     const p = e.currentTarget.querySelector('p');
                     if (h4) h4.style.color = '#222222';
                     if (p) p.style.color = '#666666';
                   }}
                 >
                   <h4 style={{
                     fontSize: '16px',
                     fontWeight: 'bold',
                     color: '#222222',
                     margin: '0 0 6px 0',
                     transition: 'color 0.3s ease',
                     fontFamily: 'Arial, sans-serif'
                   }}>
                     Candidate Pipeline
                   </h4>
                   <p style={{
                     fontSize: '13px',
                     color: '#666666',
                     margin: '0',
                     lineHeight: '1.4',
                     transition: 'color 0.3s ease',
                     fontFamily: 'Arial, sans-serif'
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
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Assessment Builder
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Create custom assessments with multiple question types.
                  </p>
                </div>

                {/* Team Collaboration */}
                <div
                  onClick={() => navigate('/collaboration')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Team Collaboration
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Collaborate with your team on hiring decisions.
                  </p>
                </div>

                {/* Workflow Automation */}
                <div
                  onClick={() => navigate('/automation')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Workflow Automation
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Automate repetitive tasks and streamline workflows.
                  </p>
                </div>

                {/* Analytics & Reports */}
                <div
                  onClick={() => navigate('/analytics')}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Analytics & Reports
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Track hiring metrics and generate detailed reports.
                  </p>
                </div>
              </div>
            )}
          </div>

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
                <polyline points="6,9 12,15 18,9" />
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
                width: '400px',
                zIndex: 1000
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#222222',
                  margin: '0 0 20px 0',
                  textAlign: 'center',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  Account Settings
                </h3>

                <div onClick={() => navigate('/profile')} style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #E0E0E0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Profile Settings
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Update your personal information and preferences.
                  </p>
                </div>

                <div
                  onClick={onLogout}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222222',
                    margin: '0 0 6px 0',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Logout
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    margin: '0',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Sign out of your account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            fontFamily: '"Montserrat", Arial, sans-serif'
          }}>
            <span style={{ color: '#F05A3C' }}>All</span>{' '}
            <span style={{ color: '#222222' }}>Candidates</span>
          </h1>

          {/* Search and Filters */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666666',
                pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  background: '#F8F9FA',
                  color: '#222222',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1A3C34';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E0E0E0';
                  e.target.style.background = '#F8F9FA';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{
                padding: '12px 16px 12px 16px',
                border: '2px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                background: '#F8F9FA',
                color: '#222222',
                cursor: 'pointer',
                fontWeight: '500',
                minWidth: '160px',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '44px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1A3C34';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1A3C34';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">All Stages</option>
              <option value="applied">Applied</option>
              <option value="screen">Screening</option>
              <option value="tech">Interview</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Results Count */}
          {!loading && (
            <div style={{
              marginBottom: '16px',
              fontSize: '14px',
              color: '#666666',
              fontFamily: 'Arial, sans-serif'
            }}>
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '6px solid #F5F5F5',
                borderTop: '6px solid #1A3C34',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
              <p style={{
                marginTop: '24px',
                color: '#666666',
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px'
              }}>
                Loading candidates...
              </p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{
                color: '#666666',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif'
              }}>
                {searchTerm || stageFilter ? 'No candidates match your search criteria.' : 'No candidates found.'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  style={{
                    background: '#F8F9FA',
                    border: '1px solid #E0E0E0',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#222222',
                      marginBottom: '4px',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {candidate.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666666',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {candidate.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(candidate)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E8F5E8';
                      e.currentTarget.style.color = '#1A3C34';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = '#666666';
                    }}
                  >
                    <Eye size={20} color="#666666" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
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
          zIndex: 2000,
          padding: '20px'
        }}
          onClick={handleCloseModal}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 24px 0 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #E0E0E0',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222222',
                margin: 0,
                fontFamily: '"Montserrat", Arial, sans-serif'
              }}>
                Candidate Details
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5F5F5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <X size={20} color="#666666" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '0 24px 24px 24px' }}>
              {/* Basic Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#222222',
                  margin: '0 0 12px 0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  Basic Information
                </h3>
                <div style={{
                  background: '#F8F9FA',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#666666', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Name:</strong>
                    <div style={{ color: '#222222', fontSize: '16px', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                      {selectedCandidate.name}
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#666666', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Email:</strong>
                    <div style={{ color: '#222222', fontSize: '16px', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                      {selectedCandidate.email}
                    </div>
                  </div>
                  {selectedCandidate.phone && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#666666', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Phone:</strong>
                      <div style={{ color: '#222222', fontSize: '16px', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                        {selectedCandidate.phone}
                      </div>
                    </div>
                  )}
                  <div>
                    <strong style={{ color: '#666666', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Stage:</strong>
                    <div style={{ color: '#222222', fontSize: '16px', marginTop: '4px', textTransform: 'capitalize', fontFamily: 'Arial, sans-serif' }}>
                      {selectedCandidate.stage}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#222222',
                  margin: '0 0 12px 0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  Notes
                </h3>
                {selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    padding: '16px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedCandidate.notes.map((note, index) => (
                      <div key={index} style={{
                        padding: '8px 0',
                        borderBottom: index < selectedCandidate.notes.length - 1 ? '1px solid #E0E0E0' : 'none'
                      }}>
                        <div style={{ color: '#222222', fontSize: '14px', lineHeight: '1.5', fontFamily: 'Arial, sans-serif' }}>
                          {note}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#666666',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    No notes available.
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#222222',
                  margin: '0 0 12px 0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  Timeline
                </h3>
                {candidateTimeline && candidateTimeline.length > 0 ? (
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    padding: '16px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    borderLeft: '3px solid #1A3C34'
                  }}>
                    {candidateTimeline.map((event, index) => (
                      <div key={index} style={{
                        padding: '12px 0',
                        paddingLeft: '16px',
                        borderBottom: index < candidateTimeline.length - 1 ? '1px solid #E0E0E0' : 'none'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#222222',
                          marginBottom: '4px',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {event.stage}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#666666',
                          marginBottom: '4px',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        {event.note && (
                          <div style={{
                            fontSize: '13px',
                            color: '#666666',
                            marginTop: '4px',
                            fontStyle: 'italic',
                            fontFamily: 'Arial, sans-serif'
                          }}>
                            {event.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#666666',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    No timeline events available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CandidatesListPage;

