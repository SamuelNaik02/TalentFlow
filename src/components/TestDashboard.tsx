import React from 'react';

const TestDashboard: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: '#F8F9FA',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        borderBottom: '1px solid #E0E0E0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1A3C34', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          TalentFlow.
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#F05A3C', 
            borderRadius: '50%' 
          }}></div>
        </div>
      </div>
      
      <div style={{ 
        flex: 1, 
        padding: '24px',
        overflowY: 'auto'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#222222', 
          marginBottom: '16px' 
        }}>
          Test Dashboard
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#666666', 
          lineHeight: '1.5' 
        }}>
          This is a test dashboard to check if the basic structure works.
        </p>
      </div>
    </div>
  );
};

export default TestDashboard;
