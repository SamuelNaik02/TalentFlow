import { db } from '../db/database';

export interface OfflineQueueItem {
  id: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  timestamp: Date;
  retries: number;
}

class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: OfflineQueueItem[] = [];
  private syncInProgress: boolean = false;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.setupEventListeners();
    this.loadOfflineQueue();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => listener(isOnline));
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('talentflow-offline-queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      localStorage.setItem('talentflow-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  public isConnected(): boolean {
    return this.isOnline;
  }

  public addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async addToOfflineQueue(method: 'POST' | 'PATCH' | 'DELETE', endpoint: string, data?: any): Promise<void> {
    const item: OfflineQueueItem = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      endpoint,
      data,
      timestamp: new Date(),
      retries: 0
    };

    this.offlineQueue.push(item);
    await this.saveOfflineQueue();
    
    console.log(`Added to offline queue: ${method} ${endpoint}`);
  }

  public async syncOfflineQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Syncing ${this.offlineQueue.length} offline operations...`);

    const itemsToSync = [...this.offlineQueue];
    const successfulItems: string[] = [];

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        successfulItems.push(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        item.retries++;
        
        // Remove item if it has failed too many times
        if (item.retries >= 3) {
          console.warn(`Removing item ${item.id} after ${item.retries} failed attempts`);
          successfulItems.push(item.id);
        }
      }
    }

    // Remove successfully synced items
    this.offlineQueue = this.offlineQueue.filter(item => !successfulItems.includes(item.id));
    await this.saveOfflineQueue();

    this.syncInProgress = false;
    console.log(`Sync completed. ${successfulItems.length} items synced, ${this.offlineQueue.length} remaining`);
  }

  private async syncItem(item: OfflineQueueItem): Promise<void> {
    const url = `/api${item.endpoint}`;
    const options: RequestInit = {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (item.data) {
      options.body = JSON.stringify(item.data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`Successfully synced: ${item.method} ${item.endpoint}`);
  }

  public getOfflineQueueLength(): number {
    return this.offlineQueue.length;
  }

  public getOfflineQueue(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  public async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
  }

  // Database sync utilities
  public async getDatabaseStats(): Promise<{
    jobs: number;
    candidates: number;
    assessments: number;
    responses: number;
    offlineQueue: number;
  }> {
    const [jobs, candidates, assessments, responses] = await Promise.all([
      db.jobs.count(),
      db.candidates.count(),
      db.assessments.count(),
      db.assessmentResponses.count()
    ]);

    return {
      jobs,
      candidates,
      assessments,
      responses,
      offlineQueue: this.offlineQueue.length
    };
  }

  public async exportDatabase(): Promise<{
    jobs: any[];
    candidates: any[];
    assessments: any[];
    responses: any[];
    offlineQueue: OfflineQueueItem[];
  }> {
    const [jobs, candidates, assessments, responses] = await Promise.all([
      db.jobs.toArray(),
      db.candidates.toArray(),
      db.assessments.toArray(),
      db.assessmentResponses.toArray()
    ]);

    return {
      jobs,
      candidates,
      assessments,
      responses,
      offlineQueue: this.offlineQueue
    };
  }

  public async importDatabase(data: {
    jobs: any[];
    candidates: any[];
    assessments: any[];
    responses: any[];
  }): Promise<void> {
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses], async () => {
      await db.jobs.bulkPut(data.jobs);
      await db.candidates.bulkPut(data.candidates);
      await db.assessments.bulkPut(data.assessments);
      await db.assessmentResponses.bulkPut(data.responses);
    });
  }

  public async clearDatabase(): Promise<void> {
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses], async () => {
      await db.jobs.clear();
      await db.candidates.clear();
      await db.assessments.clear();
      await db.assessmentResponses.clear();
    });
  }
}

// Create singleton instance
export const offlineService = new OfflineService();

// Export for use in components
export default offlineService;
