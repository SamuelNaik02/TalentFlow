import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

export interface OfflineStatus {
  isOnline: boolean;
  offlineQueueLength: number;
  syncInProgress: boolean;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(offlineService.isConnected());
  const [offlineQueueLength, setOfflineQueueLength] = useState(offlineService.getOfflineQueueLength());

  useEffect(() => {
    const removeListener = offlineService.addListener((online) => {
      setIsOnline(online);
      setOfflineQueueLength(offlineService.getOfflineQueueLength());
    });

    // Update queue length periodically
    const interval = setInterval(() => {
      setOfflineQueueLength(offlineService.getOfflineQueueLength());
    }, 1000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    offlineQueueLength,
    syncInProgress: false // Could be enhanced to track actual sync progress
  };
}

export default useOfflineStatus;
