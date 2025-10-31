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
  const [isExporting, setIsExporting] = useState(false);
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

  // Applications Trend chart state
  const appChartRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const exportReport = async () => {
    setIsExporting(true);
    try {
      // Generate CSV content
      const csvLines: string[] = [];
      
      // Header
      csvLines.push('TalentFlow Analytics Report');
      csvLines.push(`Generated: ${new Date().toLocaleString()}`);
      csvLines.push(`Period: ${periods.find(p => p.value === selectedPeriod)?.label || selectedPeriod}`);
      csvLines.push('');
      
      // Overview Metrics
      csvLines.push('OVERVIEW METRICS');
      csvLines.push('Metric,Value');
      csvLines.push(`Total Jobs,${analyticsData.overview.totalJobs}`);
      csvLines.push(`Total Candidates,${analyticsData.overview.totalCandidates}`);
      csvLines.push(`Hired This Month,${analyticsData.overview.hiredThisMonth}`);
      csvLines.push(`Success Rate,${analyticsData.overview.successRate}%`);
      csvLines.push(`Avg Time to Hire,${analyticsData.overview.avgTimeToHire} days`);
      csvLines.push(`Cost per Hire,₹${analyticsData.overview.costPerHire.toLocaleString()}`);
      csvLines.push('');
      
      // Applications Trend
      csvLines.push('APPLICATIONS TREND (Last 12 Months)');
      csvLines.push('Month,Applications');
      analyticsData.trends.applications.forEach((count, index) => {
        csvLines.push(`${months[index]},${count}`);
      });
      csvLines.push('');
      
      // Hires Trend
      csvLines.push('HIRES TREND (Last 12 Months)');
      csvLines.push('Month,Hires');
      analyticsData.trends.hires.forEach((count, index) => {
        csvLines.push(`${months[index]},${count}`);
      });
      csvLines.push('');
      
      // Interviews Trend
      csvLines.push('INTERVIEWS TREND (Last 12 Months)');
      csvLines.push('Month,Interviews');
      analyticsData.trends.interviews.forEach((count, index) => {
        csvLines.push(`${months[index]},${count}`);
      });
      csvLines.push('');
      
      // Top Job Sources
      csvLines.push('TOP JOB SOURCES');
      csvLines.push('Source,Candidates,Percentage');
      analyticsData.sources.forEach(source => {
        csvLines.push(`${source.name},${source.candidates},${source.percentage}%`);
      });
      csvLines.push('');
      
      // Top Performing Jobs
      csvLines.push('TOP PERFORMING JOBS');
      csvLines.push('Job Title,Applications,Hired,Status');
      analyticsData.topJobs.forEach(job => {
        csvLines.push(`${job.title},${job.applications},${job.hired},${job.status}`);
      });
      
      // Create blob and download
      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `TalentFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      setTimeout(() => {
        setIsExporting(false);
        alert('Report exported successfully!');
      }, 500);
    } catch (error) {
      console.error('Error exporting report:', error);
      setIsExporting(false);
      alert('Failed to export report. Please try again.');
    }
  };

  const setNestedTextColor = (el: HTMLElement, selector: string, color: string) => {
    const child = el.querySelector(selector) as HTMLElement | null;
    if (child) child.style.color = color;
  };

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
                 marginTop: '8px',
                 background: 'white',
                 border: '1px solid #E0E0E0',
                 borderRadius: '8px',
                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                 padding: '20px',
                 width: '500px',
                 zIndex: 1000,
                 maxHeight: 'calc(100vh - 120px)',
                 overflowY: 'auto',
                 overflowX: 'hidden'
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#F06B4E';
                    setNestedTextColor(t, 'h4', '#F06B4E');
                    setNestedTextColor(t, 'p', '#F06B4E');
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    t.style.color = '#222222';
                    setNestedTextColor(t, 'h4', '#222222');
                    setNestedTextColor(t, 'p', '#666666');
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
            <button 
              onClick={exportReport}
              disabled={isExporting}
              style={{
                background: isExporting ? '#CCCCCC' : '#1A3C34',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontFamily: 'Glacial Indifference, Arial, sans-serif',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: isExporting ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.background = '#0F2A22';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.background = '#1A3C34';
                }
              }}
            >
              {isExporting ? '⏳ Exporting...' : '📊 Export Report'}
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
          <div className="chart-card" ref={appChartRef}>
            <div className="chart-header">
              <h3>Applications Trend</h3>
              <div className="chart-period">Last 12 months</div>
            </div>
            <div className="chart-content" style={{ position: 'relative' }}>
              {(() => {
                const data = analyticsData.trends.applications;
                const width = 760; // visual width inside viewBox
                const height = 320; // visual height inside viewBox
                const padding = { left: 48, right: 16, top: 16, bottom: 40 };
                const innerW = width - padding.left - padding.right;
                const innerH = height - padding.top - padding.bottom;
                const maxVal = Math.max(...data) * 1.1;
                const minVal = 0;
                const stepX = innerW / (data.length - 1);
                const x = (i: number) => padding.left + i * stepX;
                const y = (v: number) => padding.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;
                const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
                const areaPath = `M ${padding.left},${padding.top + innerH} L ${points} L ${padding.left + innerW},${padding.top + innerH} Z`;
                const gridYVals = [0, 0.25, 0.5, 0.75, 1];

                // Tooltip calculations
                const handleMove = (evt: React.MouseEvent<SVGSVGElement>) => {
                  const rect = (evt.currentTarget as SVGSVGElement).getBoundingClientRect();
                  const mouseX = evt.clientX - rect.left - padding.left;
                  const idx = Math.max(0, Math.min(data.length - 1, Math.round(mouseX / stepX)));
                  setHoverIndex(idx);
                };
                const handleLeave = () => setHoverIndex(null);

                return (
                  <svg 
                    width="100%" 
                    height="360" 
                    viewBox={`0 0 ${width} ${height}`} 
                    style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 12 }}
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                  >
                    <defs>
                      <linearGradient id="appsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1A3C34" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#1A3C34" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    {/* grid horizontal */}
                    {gridYVals.map((t, i) => (
                      <line
                        key={`gy-${i}`}
                        x1={padding.left}
                        y1={padding.top + innerH * (1 - t)}
                        x2={padding.left + innerW}
                        y2={padding.top + innerH * (1 - t)}
                        stroke="#EEE"
                      />
                    ))}

                    {/* axes */}
                    <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#CFCFCF" />
                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#CFCFCF" />

                    {/* area */}
                    <path d={areaPath} fill="url(#appsArea)" />

                    {/* line */}
                    <polyline
                      fill="none"
                      stroke="#1A3C34"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={points}
                    />

                    {/* x labels */}
                    {data.map((_, i) => (
                      <text
                        key={`xl-${i}`}
                        x={x(i)}
                        y={padding.top + innerH + 24}
                        fontSize={12}
                        fill="#888"
                        textAnchor="middle"
                        fontFamily='"Inter", Arial, sans-serif'
                      >
                        {months[i]}
                      </text>
                    ))}

                    {/* y labels */}
                    {gridYVals.map((t, i) => (
                      <text
                        key={`yl-${i}`}
                        x={padding.left - 10}
                        y={padding.top + innerH * (1 - t) + 4}
                        fontSize={12}
                        fill="#888"
                        textAnchor="end"
                        fontFamily='"Inter", Arial, sans-serif'
                      >
                        {Math.round((minVal + (maxVal - minVal) * t)).toString()}
                      </text>
                    ))}

                    {/* hover marker */}
                    {hoverIndex !== null && (
                      <g>
                        <line
                          x1={x(hoverIndex)}
                          y1={padding.top}
                          x2={x(hoverIndex)}
                          y2={padding.top + innerH}
                          stroke="#F0D4CB"
                          strokeDasharray="4,4"
                        />
                        <circle cx={x(hoverIndex)} cy={y(data[hoverIndex])} r={5} fill="#1A3C34" />
                      </g>
                    )}
                  </svg>
                );
              })()}

              {hoverIndex !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${(hoverIndex / (analyticsData.trends.applications.length - 1)) * 100}% - 60px)`,
                    top: 8,
                    background: 'white',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    pointerEvents: 'none',
                    minWidth: 120
                  }}
                >
                  <div style={{ fontFamily: '"Montserrat", Arial, sans-serif', fontSize: 12, color: '#999', marginBottom: 4 }}>{months[hoverIndex]}</div>
                  <div style={{ fontFamily: '"Inter", Arial, sans-serif', fontSize: 14, color: '#1A3C34', fontWeight: 600 }}>
                    {analyticsData.trends.applications[hoverIndex]} applications
                  </div>
                </div>
              )}
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