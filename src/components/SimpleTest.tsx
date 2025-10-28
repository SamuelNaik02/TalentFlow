import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: 'lightblue', 
      minHeight: '100vh',
      fontSize: '24px',
      color: 'darkblue'
    }}>
      <h1>Test Component Works!</h1>
      <p>If you can see this, the basic React setup is working.</p>
    </div>
  );
};

export default SimpleTest;
