import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Shuffle from './Shuffle';
import { gsap } from 'gsap';
import CountUp from './CountUp';
import './AnalyticsReports.css';

interface AnalyticsReportsProps {
  onLogout: () => void;
}

const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (metricsRef.current) {
      const cards = metricsRef.current.querySelectorAll('.metric-card');
      gsap.fromTo(
        cards,
        { 
          scale: 0, 
          opacity: 0,
          y: 50
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.8)',
          delay: 0.3
        }
      );
    }
  }, []);

  const analyticsData = {
    overview: {
      totalJobs: 47,
      totalCandidates: 1247,
      hiredThisMonth: 89,
      successRate: 94,
      avgTimeToHire: 12,
      costPerHire: 3200
    },
    trends: {
      applications: [120, 135, 98, 156, 189, 201, 178, 165, 142, 198, 223, 189],
      hires: [8, 12, 6, 15, 18, 22, 19, 16, 14, 21, 25, 20],
      interviews: [25, 32, 28, 38, 42, 45, 41, 37, 35, 44, 48, 42]
    },
    topJobs: [
      { title: 'Senior Frontend Developer', applications: 89, hired: 3, status: 'Active' },
      { title: 'UX/UI Designer', applications: 67, hired: 2, status: 'Active' },
      { title: 'Full Stack Engineer', applications: 45, hired: 1, status: 'Active' },
      { title: 'Product Manager', applications: 34, hired: 2, status: 'Active' },
      { title: 'DevOps Engineer', applications: 28, hired: 1, status: 'Active' }
    ],
    sources: [
      { name: 'LinkedIn', candidates: 456, percentage: 36.6 },
      { name: 'Indeed', candidates: 234, percentage: 18.8 },
      { name: 'Company Website', candidates: 189, percentage: 15.2 },
      { name: 'Referrals', candidates: 156, percentage: 12.5 },
      { name: 'Glassdoor', candidates: 98, percentage: 7.9 },
      { name: 'Other', candidates: 114, percentage: 9.1 }
    ]
  };

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

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
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#1A3C34', 
              margin: '0 0 8px 0',
              fontFamily: '"Montserrat", Arial, sans-serif'
            }}>
              Analytics & Reports
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#666666', 
              margin: 0,
              fontFamily: 'Glacial Indifference, Arial, sans-serif'
            }}>
              Track your hiring performance and make data-driven decisions
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                background: 'white',
                fontSize: '14px',
                fontFamily: '"Inter", Arial, sans-serif',
                color: '#333333',
                cursor: 'pointer'
              }}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button style={{
              background: '#1A3C34',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Glacial Indifference, Arial, sans-serif',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#0F2A22'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1A3C34'}
            >
              📊 Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div ref={metricsRef} style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          <div 
            className="metric-card"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
          >
            <div className="metric-icon" style={{ background: '#E3F2FD' }}>
              📊
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <CountUp to={analyticsData.overview.totalJobs} duration={1.5} delay={0.3} />
              </div>
              <div className="metric-label">Total Jobs</div>
            </div>
          </div>
          
          <div 
            className="metric-card"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
          >
            <div className="metric-icon" style={{ background: '#E8F5E8' }}>
              👥
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <CountUp to={analyticsData.overview.totalCandidates} duration={1.5} delay={0.4} separator="," />
              </div>
              <div className="metric-label">Total Candidates</div>
            </div>
          </div>
          
          <div 
            className="metric-card"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
          >
            <div className="metric-icon" style={{ background: '#FFF3E0' }}>
              ✅
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <CountUp to={analyticsData.overview.hiredThisMonth} duration={1.5} delay={0.5} />
              </div>
              <div className="metric-label">Hired This Month</div>
            </div>
          </div>
          
          <div 
            className="metric-card"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
          >
            <div className="metric-icon" style={{ background: '#F3E5F5' }}>
              📈
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <CountUp to={analyticsData.overview.successRate} duration={1.5} delay={0.6} />%
              </div>
              <div className="metric-label">Success Rate</div>
            </div>
          </div>
          
          <div 
            className="metric-card"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
          >
            <div className="metric-icon" style={{ background: '#E0F2F1' }}>
              ⏱️
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <CountUp to={analyticsData.overview.avgTimeToHire} duration={1.5} delay={0.7} />
              </div>
              <div className="metric-label">Avg. Time to Hire (days)</div>
            </div>
          </div>
          
          <div 
            className="metric-card"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
          >
            <div className="metric-icon" style={{ background: '#FFF8E1' }}>
              💰
            </div>
            <div className="metric-content">
              <div className="metric-value">
                ₹<CountUp to={analyticsData.overview.costPerHire} duration={1.5} delay={0.8} separator="," />
              </div>
              <div className="metric-label">Cost per Hire</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {/* Applications Trend Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Applications Trend</h3>
              <div className="chart-period">Last 12 months</div>
            </div>
            <div className="chart-content">
              <div className="simple-chart">
                {analyticsData.trends.applications.map((value, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ 
                      height: `${(value / 250) * 100}%`,
                      background: index === analyticsData.trends.applications.length - 1 ? '#1A3C34' : '#E0E0E0'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Job Sources */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Top Job Sources</h3>
              <div className="chart-period">Candidate sources</div>
            </div>
            <div className="chart-content">
              <div className="sources-list">
                {analyticsData.sources.map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-name">{source.name}</div>
                    <div className="source-bar">
                      <div 
                        className="source-fill"
                        style={{ 
                          width: `${source.percentage}%`,
                          background: index === 0 ? '#1A3C34' : '#E0E0E0'
                        }}
                      ></div>
                    </div>
                    <div className="source-value">
                      <CountUp 
                        to={source.percentage} 
                        duration={2} 
                        delay={0.3 + index * 0.1}
                        decimals={1}
                      />%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Jobs Table */}
        <div className="chart-card">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              color: '#1A3C34',
              margin: '0 0 4px 0',
              fontFamily: 'Glacial Indifference, Arial, sans-serif'
            }}>
              Top Performing Jobs
            </h3>
            <div style={{ 
              fontSize: '12px',
              color: '#999999',
              fontFamily: 'Glacial Indifference, Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Most applications and hires
            </div>
          </div>
          <div className="jobs-table">
            <div className="table-header">
              <div>JOB TITLE</div>
              <div>APPLICATIONS</div>
              <div>HIRED</div>
              <div>STATUS</div>
            </div>
            {analyticsData.topJobs.map((job, index) => (
              <div key={index} className="table-row">
                <div className="job-title">{job.title}</div>
                <div className="job-applications">
                  <CountUp 
                    to={job.applications} 
                    duration={1.5} 
                    delay={0.5 + index * 0.08}
                  />
                </div>
                <div className="job-hired">
                  <CountUp 
                    to={job.hired} 
                    duration={1.5} 
                    delay={0.5 + index * 0.08}
                  />
                </div>
                <div className="job-status">
                  <span className={`status-badge ${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
