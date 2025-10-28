import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleDashboardMinimal: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

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
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1A3C34', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          TalentFlow.
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#F05A3C', 
            borderRadius: '50%' 
          }}></div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button style={{ 
            background: '#F5EDE0', 
            color: '#1A3C34', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Services
          </button>
          
          <button style={{ 
            background: '#F5EDE0', 
            color: '#1A3C34', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            My Account
          </button>
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
          padding: '30px', 
          borderRadius: '8px', 
          marginBottom: '30px', 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' 
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            color: '#222222', 
            marginBottom: '16px' 
          }}>
            Hello <strong>admin</strong> (not admin? <button onClick={() => { onLogout(); navigate('/login'); }} style={{background: 'none', border: 'none', color: '#1A3C34', cursor: 'pointer', textDecoration: 'underline'}}>Log out</button>)
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666666', 
            lineHeight: '1.5' 
          }}>
            From your account dashboard you can view your <strong>recent job postings</strong>, manage your <strong>candidate pipeline</strong>, and <strong>create assessments</strong> for your hiring process.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{ 
              fontSize: '32px', 
              width: '60px', 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#F0F8FF', 
              borderRadius: '50%' 
            }}>
              📊
            </div>
            <div>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A3C34', margin: '0 0 4px 0' }}>25</h3>
              <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Active Jobs</p>
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{ 
              fontSize: '32px', 
              width: '60px', 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#F0F8FF', 
              borderRadius: '50%' 
            }}>
              👥
            </div>
            <div>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A3C34', margin: '0 0 4px 0' }}>142</h3>
              <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Candidates</p>
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{ 
              fontSize: '32px', 
              width: '60px', 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#F0F8FF', 
              borderRadius: '50%' 
            }}>
              📈
            </div>
            <div>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A3C34', margin: '0 0 4px 0' }}>94%</h3>
              <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Success Rate</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' 
        }}>
          <h2 style={{ fontSize: '20px', color: '#222222', marginBottom: '20px' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666666' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p style={{ margin: 0, fontSize: '16px' }}>No recent activity</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Start by creating a job, adding candidates, or building assessments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboardMinimal;
