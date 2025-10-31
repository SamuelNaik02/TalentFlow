import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Settings, BarChart3, Clock, CheckCircle, XCircle, Plus, Search, Filter, Copy, Trash2 } from 'lucide-react';
import Shuffle from './Shuffle';
import Stepper, { Step } from './Stepper';

const WorkflowAutomation: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalRuns: 0,
    averageSuccessRate: 0
  });
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    category: 'recruitment',
    trigger: 'new_candidate',
    status: 'draft'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockWorkflows = [
        {
          id: '1',
          name: 'New Candidate Welcome',
          description: 'Automatically send welcome email to new candidates',
          status: 'active',
          trigger: {
            type: 'new_candidate',
            conditions: [{ field: 'status', operator: 'equals', value: 'applied' }]
          },
          actions: [
            {
              id: '1',
              type: 'send_email',
              config: { template: 'welcome_email', subject: 'Welcome to TalentFlow!' },
              order: 1
            }
          ],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
          runCount: 45,
          successRate: 98.2,
          isEnabled: true,
          category: 'recruitment'
        },
        {
          id: '2',
          name: 'Assessment Reminder',
          description: 'Send reminder emails for pending assessments',
          status: 'active',
          trigger: {
            type: 'schedule',
            schedule: {
              frequency: 'daily',
              time: '09:00'
            }
          },
          actions: [
            {
              id: '1',
              type: 'send_email',
              config: { template: 'assessment_reminder' },
              order: 1
            }
          ],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 21 * 60 * 60 * 1000),
          runCount: 28,
          successRate: 96.4,
          isEnabled: true,
          category: 'communication'
        },
        {
          id: '3',
          name: 'Interview Scheduling',
          description: 'Automatically schedule interviews based on availability',
          status: 'paused',
          trigger: {
            type: 'assessment_completed',
            conditions: [{ field: 'score', operator: 'greater_than', value: '80' }]
          },
          actions: [
            {
              id: '1',
              type: 'create_task',
              config: { taskType: 'schedule_interview' },
              order: 1
            },
            {
              id: '2',
              type: 'notify_team',
              config: { message: 'New interview candidate ready' },
              order: 2
            }
          ],
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          runCount: 12,
          successRate: 91.7,
          isEnabled: false,
          category: 'recruitment'
        }
      ];

      const mockRuns = [
        {
          id: '1',
          workflowId: '1',
          status: 'completed',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000),
          results: [{ action: 'send_email', status: 'success', message: 'Email sent successfully' }]
        }
      ];

      setWorkflows(mockWorkflows);
      setWorkflowRuns(mockRuns);
      setStats({
        totalWorkflows: mockWorkflows.length,
        activeWorkflows: mockWorkflows.filter(w => w.isEnabled).length,
        totalRuns: mockRuns.length,
        averageSuccessRate: 95.4
      });
    } catch (error) {
      console.error('Failed to load workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, isEnabled: boolean) => {
    try {
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, isEnabled } : w
      ));
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const handleCreateWorkflow = () => {
    const errors: Record<string, string> = {};
    if (!newWorkflow.name.trim()) errors.name = 'Name is required';
    if (!newWorkflow.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const created = {
      id: String(Date.now()),
      name: newWorkflow.name.trim(),
      description: newWorkflow.description.trim(),
      status: newWorkflow.status,
      trigger: {
        type: newWorkflow.trigger,
        conditions: []
      },
      actions: [],
      createdAt: new Date(),
      lastRun: null,
      nextRun: null,
      runCount: 0,
      successRate: 0,
      isEnabled: false,
      category: newWorkflow.category
    };
    setWorkflows([created, ...workflows]);
    setStats(prev => ({
      ...prev,
      totalWorkflows: prev.totalWorkflows + 1
    }));
    setShowNewWorkflowModal(false);
    setNewWorkflow({ name: '', description: '', category: 'recruitment', trigger: 'new_candidate', status: 'draft' });
    setFormErrors({});
  };

  const runWorkflow = async (workflowId: string) => {
    try {
      console.log('Running workflow:', workflowId);
    } catch (error) {
      console.error('Failed to run workflow:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#1A3C34'; // TalentFlow green
      case 'paused': return '#F05A3C'; // TalentFlow orange
      case 'draft': return '#2196F3';
      default: return '#666';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recruitment': return '#1A3C34'; // TalentFlow green
      case 'onboarding': return '#F05A3C'; // TalentFlow orange
      case 'communication': return '#F05A3C'; // TalentFlow orange
      case 'data_management': return '#1A3C34'; // TalentFlow green
      default: return '#666';
    }
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

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <style>
        {`
          .workflow-automation-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
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
                    Candidates
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
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
      <div 
        className="workflow-automation-scroll"
        style={{ 
          flex: 1, 
          padding: '40px',
          overflowY: 'auto',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* Internet Explorer 10+ */
        }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Settings size={20} color="white" />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1A3C34', 
                  margin: '0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  {stats.totalWorkflows}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0',
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>
                  Total Workflows
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Play size={20} color="white" />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1A3C34', 
                  margin: '0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  {stats.activeWorkflows}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0',
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>
                  Active Workflows
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #F05A3C 0%, #e04a2b 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={20} color="white" />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#F05A3C', 
                  margin: '0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  {stats.totalRuns}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0',
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>
                  Total Runs
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #F05A3C 0%, #e04a2b 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={20} color="white" />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#F05A3C', 
                  margin: '0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  {stats.averageSuccessRate}%
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0',
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>
                  Success Rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows Section */}
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
                <span style={{ color: '#F05A3C' }}>WORKFLOW</span>
                <span style={{ color: '#1A3C34' }}> Automation</span>
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: '#666666', 
                lineHeight: '1.6',
                margin: 0,
                fontFamily: '"Inter", Arial, sans-serif'
              }}>
                Automate repetitive tasks and streamline workflows
              </p>
            </div>
            <button 
              onClick={() => setShowNewWorkflowModal(true)}
              style={{ 
                background: '#F05A3C',
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
                e.currentTarget.style.background = '#e04a2b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F05A3C';
              }}
            >
              <Plus size={16} />
              New Workflow
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
                placeholder="Search workflows..."
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
                  e.target.style.borderColor = '#F05A3C';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(240, 90, 60, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E0E0E0';
                  e.target.style.background = '#F8F9FA';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
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
                e.target.style.borderColor = '#F05A3C';
                e.target.style.boxShadow = '0 0 0 3px rgba(240, 90, 60, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Categories</option>
              <option value="recruitment">Recruitment</option>
              <option value="onboarding">Onboarding</option>
              <option value="communication">Communication</option>
              <option value="data_management">Data Management</option>
            </select>
          </div>

          {/* Workflows List */}
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666',
              fontFamily: '"Inter", Arial, sans-serif'
            }}>
              Loading workflows...
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
              gap: '20px'
            }}>
              {filteredWorkflows.map(workflow => (
                <div key={workflow.id} style={{ 
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
                      background: getCategoryColor(workflow.category),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      fontFamily: '"Montserrat", Arial, sans-serif'
                    }}>
                      {workflow.category.replace('_', ' ')}
                    </div>
                    <div style={{ 
                      padding: '4px 12px',
                      background: getStatusColor(workflow.status),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {workflow.status}
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
                    {workflow.name}
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
                    {workflow.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Play size={14} color="#666" />
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#666'
                        }}>
                          {workflow.runCount} runs
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle size={14} color="#4CAF50" />
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#4CAF50',
                          fontWeight: '500'
                        }}>
                          {workflow.successRate}%
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkflow(workflow.id, !workflow.isEnabled);
                        }}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          background: workflow.isEnabled ? '#4caf50' : '#ff9800',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {workflow.isEnabled ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          runWorkflow(workflow.id);
                        }}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          border: 'none',
                          background: '#2196F3',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#999'
                    }}>
                      Last run: {workflow.lastRun ? formatTime(workflow.lastRun) : 'Never'}
                    </span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px'
                    }}>
                      <button style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: '#f5f5f5',
                        color: '#666',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e0e0e0';
                        e.currentTarget.style.color = '#333';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.color = '#666';
                      }}
                      >
                        <Copy size={14} />
                      </button>
                      <button style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: '#f5f5f5',
                        color: '#666',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ffebee';
                        e.currentTarget.style.color = '#f44336';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.color = '#666';
                      }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredWorkflows.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666666'
            }}>
              <Settings size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#666666', fontFamily: '"Montserrat", Arial, sans-serif' }}>
                No workflows found
              </h3>
              <p style={{ margin: '0', fontSize: '14px', fontFamily: '"Inter", Arial, sans-serif' }}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first workflow to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Workflow Modal */}
      {showNewWorkflowModal && (
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
        onClick={() => setShowNewWorkflowModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E0E0E0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1A3C34',
                margin: 0,
                fontFamily: '"Montserrat", Arial, sans-serif'
              }}>
                Create New Workflow
              </h2>
              <button
                onClick={() => setShowNewWorkflowModal(false)}
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
              footerClassName=""
              onStepChange={() => {}}
              onFinalStepCompleted={handleCreateWorkflow}
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
                  fontFamily: '"Inter", Arial, sans-serif'
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Workflow Name</label>
                    <input
                      type="text"
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                      placeholder="e.g., New Candidate Welcome"
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
                      onFocus={(e) => e.target.style.borderColor = '#F05A3C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    {formErrors.name && <div style={{ color: '#D32F2F', fontSize: '12px', marginTop: '6px', fontFamily: '"Inter", Arial, sans-serif' }}>{formErrors.name}</div>}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Category</label>
                    <select
                      value={newWorkflow.category}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
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
                      onFocus={(e) => e.target.style.borderColor = '#F05A3C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    >
                      <option value="recruitment">Recruitment</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="communication">Communication</option>
                      <option value="data_management">Data Management</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Description</label>
                    <textarea
                      value={newWorkflow.description}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                      placeholder="Describe what this workflow does..."
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
                      onFocus={(e) => e.target.style.borderColor = '#F05A3C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    {formErrors.description && <div style={{ color: '#D32F2F', fontSize: '12px', marginTop: '6px', fontFamily: '"Inter", Arial, sans-serif' }}>{formErrors.description}</div>}
                  </div>
                </div>
              </Step>

              {/* Step 2: Configuration */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1A3C34',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Configuration
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Trigger</label>
                      <select
                        value={newWorkflow.trigger}
                        onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
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
                        onFocus={(e) => e.target.style.borderColor = '#F05A3C'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      >
                        <option value="new_candidate">New Candidate</option>
                        <option value="assessment_completed">Assessment Completed</option>
                        <option value="schedule">Schedule</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222222', marginBottom: '8px', fontFamily: '"Inter", Arial, sans-serif' }}>Status</label>
                      <select
                        value={newWorkflow.status}
                        onChange={(e) => setNewWorkflow({ ...newWorkflow, status: e.target.value })}
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
                        onFocus={(e) => e.target.style.borderColor = '#F05A3C'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
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
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Workflow Name:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newWorkflow.name || 'Not specified'}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Category:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newWorkflow.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Trigger:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newWorkflow.trigger.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Status:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newWorkflow.status.charAt(0).toUpperCase() + newWorkflow.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Description:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {newWorkflow.description || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  {formErrors.name || formErrors.description ? (
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
      </div>
    </>
  );
};

export default WorkflowAutomation;
