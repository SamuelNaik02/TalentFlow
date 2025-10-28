import React from 'react';

const UltraSimpleTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px', 
      background: 'red', 
      minHeight: '100vh',
      fontSize: '32px',
      color: 'white',
      fontWeight: 'bold'
    }}>
      <h1>ULTRA SIMPLE TEST</h1>
      <p>This should be visible on a red background!</p>
      <p>If you see this, React is working!</p>
    </div>
  );
};

export default UltraSimpleTest;
