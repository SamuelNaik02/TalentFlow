import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../services/activityService';
import Shuffle from './Shuffle';
import CountUp from './CountUp';
import VerticalStatsCards from './VerticalStatsCards';

// Define Activity type locally to avoid import issues
interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  entityId: string;
  entityType: string;
  timestamp: string;
  userId?: string;
}

const SimpleDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('talentflow-user') || 'null') } catch { return null }
  })();
  const displayName = storedUser?.displayName || 'User';
  const [showContactBox, setShowContactBox] = useState(false);

  useEffect(() => {
    // Load recent activities
    const activities = activityService.getRecentActivities();
    setRecentActivities(activities);
  }, []);
  return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
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
                    fontSize: '14px', 
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
                    fontSize: '14px', 
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

      {/* Main Content - Full Width */}
      <div className="hide-scrollbar" style={{ 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        {/* Main Content Layout - Left: Stats, Right: Welcome + Activity */}
        <div className="two-col" style={{ 
          display: 'flex', 
          gap: '32px', 
          alignItems: 'flex-start' 
        }}>
          {/* Left Side - Vertical Statistics Cards */}
          <div className="sticky" style={{ 
            flex: '0 0 300px',
            position: 'sticky',
            top: '40px'
          }}>
            <VerticalStatsCards />
          </div>

          {/* Right Side - Welcome Message and Recent Activity */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Welcome Message */}
            <div style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}>
              <h1 style={{ 
                fontSize: '24px', 
                color: '#222222', 
                marginBottom: '16px',
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: '600'
              }}>
                Hello <strong style={{ color: '#F05A3C' }}>{displayName}</strong>
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: '#666666', 
                lineHeight: '1.5',
                fontFamily: '"Inter", Arial, sans-serif',
                fontWeight: '400'
              }}>
                From your account dashboard you can view your <strong>recent job postings</strong>, manage your <strong>candidate pipeline</strong>, and <strong>create assessments</strong> for your hiring process.
              </p>
            </div>

            {/* Recent Activity */}
            <div style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                color: '#222222', 
                marginBottom: '20px',
                fontFamily: 'Glacial Indifference, Arial, sans-serif',
                fontWeight: '700'
              }}>Recent Activity</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'job_created': return '➕';
                      case 'job_updated': return '✏️';
                      case 'job_archived': return '📁';
                      case 'job_activated': return '🔄';
                      case 'candidate_added': return '👤';
                      case 'candidate_stage_changed': return '📈';
                      case 'assessment_created': return '📝';
                      case 'assessment_updated': return '✏️';
                      case 'assessment_question_added': return '❓';
                      default: return '📋';
                    }
                  };

                  const getTimeAgo = (timestamp: string) => {
                    const now = new Date();
                    const activityTime = new Date(timestamp);
                    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
                    
                    if (diffInMinutes < 1) return 'Just now';
                    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
                    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
                    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
                  };

                  return (
                    <div key={activity.id} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px', 
                      padding: '12px 0', 
                      borderBottom: index < recentActivities.length - 1 ? '1px solid #F0F0F0' : 'none'
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: '#F0F8FF', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '16px' 
                      }}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                            <p style={{ 
                              margin: '0 0 4px 0', 
                              color: '#222222', 
                              fontSize: '14px',
                              fontFamily: 'Glacial Indifference, Arial, sans-serif',
                              fontWeight: '400'
                            }}>
                              <strong>{activity.title}:</strong> {activity.description}
                            </p>
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#666666',
                              fontFamily: 'Glacial Indifference, Arial, sans-serif',
                              fontWeight: '400'
                            }}>
                              {getTimeAgo(activity.timestamp)}
                            </span>
                      </div>
                    </div>
                  );
                  })
                ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px', 
                      color: '#666666' 
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '16px',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif',
                        fontWeight: '400'
                      }}>No recent activity</p>
                      <p style={{ 
                        margin: '8px 0 0 0', 
                        fontSize: '14px',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif',
                        fontWeight: '400'
                      }}>
                        Start by creating a job, adding candidates, or building assessments
                      </p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
          </div>

        {/* Floating Elements */}
      <div style={{ 
        position: 'fixed', 
        bottom: '40px', 
        left: '40px', 
        display: 'flex', 
        gap: '16px', 
        zIndex: 1000 
      }}>
        <div 
          onClick={() => setShowContactBox(!showContactBox)}
          style={{ 
            width: '50px', 
            height: '50px', 
            background: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
            fontSize: '24px' 
          }}>
          💬
        </div>
      </div>

      {/* Contact Box */}
      {showContactBox && (
        <div style={{
          position: 'fixed',
          bottom: '120px',
          left: '40px',
          width: '320px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          padding: '24px',
          zIndex: 1001,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1A3C34',
            fontFamily: 'Glacial Indifference, Arial, sans-serif'
          }}>
            Get in Touch
          </h3>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.6',
            fontFamily: 'Glacial Indifference, Arial, sans-serif'
          }}>
            Have questions or need help? Reach out to our team and we'll get back to you as soon as possible.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F8F9FA',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8F9FA';
            }}>
              <span style={{ fontSize: '20px' }}>📧</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A3C34', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>Email</div>
                <div style={{ fontSize: '12px', color: '#666666', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>support@talentflow.com</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F8F9FA',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8F9FA';
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A3C34', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>Chat</div>
                <div style={{ fontSize: '12px', color: '#666666', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>Available 24/7</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F8F9FA',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8F9FA';
            }}>
              <span style={{ fontSize: '20px' }}>📞</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A3C34', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>Phone</div>
                <div style={{ fontSize: '12px', color: '#666666', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>+1 (555) 123-4567</div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowContactBox(false)}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              background: '#1A3C34',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Glacial Indifference, Arial, sans-serif',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#25594E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1A3C34';
            }}>
            Close
          </button>
        </div>
      )}
      
      <div style={{ 
        position: 'fixed', 
        bottom: '40px', 
        right: '40px', 
        width: '50px', 
        height: '50px', 
        background: 'white', 
        border: '1px solid #E0E0E0', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        cursor: 'pointer', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
        zIndex: 1000 
      }}>
        {/* Bell Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ 
          position: 'absolute', 
          top: '-5px', 
          right: '-5px', 
          width: '20px', 
          height: '20px', 
          background: '#F05A3C', 
          color: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '12px', 
          fontWeight: 'bold' 
        }}>
          {recentActivities.length > 0 ? recentActivities.length : '0'}
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
