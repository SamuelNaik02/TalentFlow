import React from 'react';
import './Dashboard.css';

interface DashboardProps {
  onLogout: () => void;
  onNavigate?: (page: 'dashboard' | 'jobs' | 'candidates' | 'assessments') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigate }) => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header">
        <div className="logo">
          TalentFlow.
          <div className="logo-dot"></div>
        </div>
        
        <div className="header-nav">
          <button className="join-team-btn">Join our team!</button>
          <a href="#" className="nav-link">Services</a>
          <a href="#" className="nav-link">My Account</a>
        </div>
      </div>

      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        
        <div className="nav-item active">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Dashboard
        </div>
        
        <div className="nav-item" onClick={() => onNavigate?.('jobs')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Jobs
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Candidates
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Assessments
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Calendar
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Messages
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
          Analytics
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Team
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
          Settings
        </div>
        
        <div className="nav-item">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log out
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="welcome-message">
          <h1 className="welcome-title-dash">
            Hello <strong>admin</strong> (not admin? <a href="#" onClick={onLogout} style={{color: '#1A3C34', cursor: 'pointer'}}>Log out</a>)
          </h1>
          <p className="welcome-description-dash">
            From your account dashboard you can view your <strong>recent job postings</strong>, manage your <strong>candidate pipeline</strong>, and <strong>create assessments</strong> for your hiring process.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>25</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>1,247</h3>
              <p>Total Candidates</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>89</h3>
              <p>Hired This Month</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>94%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">➕</div>
              <div className="activity-content">
                <p><strong>New job posted:</strong> Senior React Developer</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-content">
                <p><strong>New candidate applied:</strong> John Smith for Frontend Developer</p>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p><strong>Assessment completed:</strong> Sarah Johnson - Technical Test</p>
                <span className="activity-time">6 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🎉</div>
              <div className="activity-content">
                <p><strong>Candidate hired:</strong> Mike Chen for DevOps Engineer</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="chat-icon">
          💬
        </div>
        <div className="clap-icon">
          👏
        </div>
        <div className="shopping-cart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <div className="cart-badge">0</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
