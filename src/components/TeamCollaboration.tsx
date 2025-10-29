import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, FileText, ThumbsUp, ThumbsDown, Clock, CheckCircle, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import Shuffle from './Shuffle';
import Stepper, { Step } from './Stepper';

const TeamCollaboration: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [collaborationItems, setCollaborationItems] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'candidate_review',
    priority: 'medium',
    status: 'pending',
    description: '',
    dueDate: '' as string
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockItems = [
        {
          id: '1',
          title: 'Review John Smith - Senior Developer',
          type: 'candidate_review',
          status: 'pending',
          priority: 'high',
          assignedTo: ['1', '3'],
          createdBy: '2',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          description: 'Technical assessment completed. Need team review for final decision.',
          comments: [
            {
              id: '1',
              userId: '2',
              userName: 'Sarah Johnson',
              userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
              content: 'Strong technical skills, good cultural fit. Recommend moving to final interview.',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
            }
          ],
          attachments: [
            {
              id: '1',
              name: 'john_smith_resume.pdf',
              type: 'pdf',
              size: 245760,
              url: '#'
            }
          ],
          votes: [
            { userId: '2', vote: 'approve' }
          ]
        },
        {
          id: '2',
          title: 'Approve New Job Posting - Marketing Manager',
          type: 'job_approval',
          status: 'in_progress',
          priority: 'medium',
          assignedTo: ['1', '2'],
          createdBy: '3',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
          description: 'New marketing manager position needs approval from HR and department head.',
          comments: [],
          attachments: [],
          votes: []
        }
      ];

      const mockMembers = [
        {
          id: '1',
          name: 'Samuel Naik',
          role: 'Hiring Manager',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          isOnline: true
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          role: 'HR Specialist',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          isOnline: true
        },
        {
          id: '3',
          name: 'Mike Chen',
          role: 'Department Head',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          isOnline: false
        }
      ];

      setCollaborationItems(mockItems);
      setTeamMembers(mockMembers);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
        case 'approved': return '#00695C'; // Teal dark green
        case 'rejected': return '#8B0000'; // Blood red
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return '#8B0000'; // Blood red
        case 'high': return '#FF9800';
        case 'medium': return '#2196F3';
        case 'low': return '#00695C'; // Teal dark green
      default: return '#666';
    }
  };

  const handleCreateItem = () => {
    const errors: Record<string, string> = {};
    if (!newItem.title.trim()) errors.title = 'Title is required';
    if (!newItem.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const created = {
      id: String(Date.now()),
      title: newItem.title.trim(),
      type: newItem.type,
      status: newItem.status,
      priority: newItem.priority,
      assignedTo: [],
      createdBy: '1',
      createdAt: new Date(),
      dueDate: newItem.dueDate ? new Date(newItem.dueDate) : new Date(Date.now() + 24*60*60*1000),
      description: newItem.description.trim(),
      comments: [],
      attachments: [],
      votes: []
    };
    setCollaborationItems([created, ...collaborationItems]);
    setShowNewItemModal(false);
    setNewItem({ title: '', type: 'candidate_review', priority: 'medium', status: 'pending', description: '', dueDate: '' });
    setFormErrors({});
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredItems = collaborationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: '#F8F9FA',
      fontFamily: '"Inter", Arial, sans-serif'
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
                 width: '500px',
                 zIndex: 1000,
                 maxHeight: '80vh',
                 overflowY: 'auto'
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
                  onClick={() => navigate('/automation')}
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
                width: '400px',
                zIndex: 1000,
                maxHeight: '80vh',
                overflowY: 'auto'
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
                  onClick={() => navigate('/profile')}
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
                    Update your personal information and preferences.
                  </p>
                </div>

                

              {/* Logout */}
                <div 
                onClick={() => { onLogout(); navigate('/login'); }}
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
                    transition: 'color 0.3s ease'
                  }}>
                  Logout
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
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
        flex: 1, 
        padding: '40px',
        overflowY: 'auto',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                marginBottom: '8px',
                fontFamily: '"Montserrat", Arial, sans-serif'
              }}>
                <span style={{ color: '#F05A3C' }}>Team</span>
                <span style={{ color: '#1A3C34' }}> Collaboration</span>
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: '#666666', 
                lineHeight: '1.6',
                margin: 0,
                fontFamily: '"Inter", Arial, sans-serif'
              }}>
                Collaborate with your team on hiring decisions
              </p>
            </div>
            <button 
              onClick={() => setShowNewItemModal(true)}
              style={{ 
                background: '#1A3C34',
                color: 'white',
                border: '1px solid white',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontFamily: '"Inter", Arial, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0F2A22';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1A3C34';
              }}
            >
              <Plus size={16} />
              New Item
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '24px'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#999' 
              }} />
              <input
                type="text"
                placeholder="Search collaboration items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 36px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: '"Inter", Arial, sans-serif',
                  background: '#f8f9fa',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1A3C34';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 60, 52, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E0E0E0';
                  e.target.style.background = '#F8F9FA';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: '"Inter", Arial, sans-serif',
                background: 'white',
                color: '#333333',
                cursor: 'pointer',
                minWidth: '150px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1A3C34';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 60, 52, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Collaboration Items */}
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666',
              fontFamily: '"Inter", Arial, sans-serif'
            }}>
              Loading collaboration items...
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '20px'
            }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{ 
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1a3c34';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 60, 52, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{ 
                      padding: '6px 12px',
                      background: '#F0F8FF',
                      color: '#1A3C34',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: '"Montserrat", Arial, sans-serif'
                    }}>
                      {item.type.replace('_', ' ')}
                    </div>
                    <div style={{ 
                      padding: '4px 12px',
                      background: getStatusColor(item.status),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      fontFamily: '"Montserrat", Arial, sans-serif',
                      textTransform: 'uppercase'
                    }}>
                      {item.status}
                    </div>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#222222', 
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    {item.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666666', 
                    lineHeight: '1.5', 
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontFamily: '"Inter", Arial, sans-serif'
                  }}>
                    {item.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      <div style={{ 
                        padding: '4px 12px',
                        background: getPriorityColor(item.priority),
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        fontFamily: '"Montserrat", Arial, sans-serif',
                        textTransform: 'uppercase'
                      }}>
                        {item.priority}
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#999',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      <button style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
                        color: 'white',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0, 105, 92, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 105, 92, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 105, 92, 0.3)';
                      }}
                      >
                        <ThumbsUp size={16} />
                      </button>
                      <button style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #8B0000 0%, #660000 100%)',
                        color: 'white',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(139, 0, 0, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 0, 0, 0.3)';
                      }}
                      >
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666666',
              fontFamily: '"Inter", Arial, sans-serif'
            }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#666666', fontFamily: '"Montserrat", Arial, sans-serif' }}>
                No collaboration items found
              </h3>
              <p style={{ margin: '0', fontSize: '14px', fontFamily: '"Inter", Arial, sans-serif' }}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first collaboration item to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Item Modal */}
      {showNewItemModal && (
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
          zIndex: 1000
        }}
        onClick={() => setShowNewItemModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1A3C34',
                margin: 0,
                fontFamily: '"Montserrat", Arial, sans-serif'
              }}>
                Create New Collaboration Item
              </h2>
              <button
                onClick={() => setShowNewItemModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666666',
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>
            
            <Stepper
              initialStep={1}
              backButtonText="Back"
              nextButtonText="Next"
              footerClassName="team-collab-stepper"
              onStepChange={() => {}}
              onFinalStepCompleted={handleCreateItem}
              backButtonProps={{
                style: {
                  background: 'none',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#666666',
                  fontFamily: '"Inter", Arial, sans-serif'
                }
              }}
              nextButtonProps={{
                style: {
                  background: '#F05A3C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: '"Inter", Arial, sans-serif',
                  transition: 'background-color 0.2s ease'
                }
              }}
            >
              {/* Step 1: Basic Information */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1A3C34',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Basic Information
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Title</label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="e.g., Review candidate for Senior Developer"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white',
                        color: '#222222'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    {formErrors.title && <div style={{ color: '#D32F2F', fontSize: '12px', marginTop: '6px', fontFamily: '"Inter", Arial, sans-serif' }}>{formErrors.title}</div>}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Type</label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    >
                      <option value="candidate_review">Candidate Review</option>
                      <option value="job_approval">Job Approval</option>
                      <option value="interview_feedback">Interview Feedback</option>
                      <option value="offer_review">Offer Review</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Add details so your team knows what to do..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        resize: 'vertical',
                        fontSize: '14px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white',
                        color: '#222222'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    {formErrors.description && <div style={{ color: '#D32F2F', fontSize: '12px', marginTop: '6px', fontFamily: '"Inter", Arial, sans-serif' }}>{formErrors.description}</div>}
                  </div>
                </div>
              </Step>

              {/* Step 2: Settings */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1A3C34',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Settings
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Priority</label>
                      <select
                        value={newItem.priority}
                        onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Status</label>
                      <select
                        value={newItem.status}
                        onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Due Date</label>
                    <input
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white',
                        color: '#222222'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>
                </div>
              </Step>

              {/* Step 3: Review & Submit */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1A3C34',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Review & Submit
                  </h3>
                  
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Title:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newItem.title || 'Not specified'}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Type:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newItem.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Priority:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newItem.priority.charAt(0).toUpperCase() + newItem.priority.slice(1)}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Status:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newItem.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    {newItem.dueDate && (
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Due Date:</strong>
                        <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                          {new Date(newItem.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Description:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newItem.description || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  {formErrors.title || formErrors.description ? (
                    <div style={{
                      background: '#FFEBEE',
                      border: '1px solid #F44336',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '20px'
                    }}>
                      <p style={{
                        color: '#F44336',
                        fontSize: '14px',
                        margin: 0,
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Please go back and fill in all required fields.
                      </p>
                    </div>
                  ) : null}
                </div>
              </Step>
            </Stepper>
          </div>
        </div>
      )}
      <style>{`
        .team-collab-stepper .next-button {
          background: #F05A3C !important;
        }
        .team-collab-stepper .next-button:hover {
          background: #e04a2b !important;
        }
      `}</style>
    </div>
  );
};

export default TeamCollaboration;
