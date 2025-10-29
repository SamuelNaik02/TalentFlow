import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import useOfflineStatus from '../hooks/useOfflineStatus';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { isOnline, offlineQueueLength } = useOfflineStatus();

  if (isOnline && offlineQueueLength === 0) {
    return null; // Don't show anything when online and no pending operations
  }

  return (
    <div className={`offline-indicator ${className}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: isOnline ? '#4CAF50' : '#F44336',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      fontFamily: '"Inter", Arial, sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {isOnline ? (
        <>
          <Wifi size={16} />
          {offlineQueueLength > 0 ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Syncing {offlineQueueLength} operation{offlineQueueLength !== 1 ? 's' : ''}...
            </>
          ) : (
            'Online'
          )}
        </>
      ) : (
        <>
          <WifiOff size={16} />
          Offline - {offlineQueueLength} operation{offlineQueueLength !== 1 ? 's' : ''} queued
        </>
      )}
      
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;
