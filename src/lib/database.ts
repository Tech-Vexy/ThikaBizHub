declare global {
  interface Window {
    gtag: (type: 'event', eventName: string, eventParams: object) => void;
  }
}

import { db } from './firebase';
import { 
  collection, 
  doc, 
  enableIndexedDbPersistence,
  connectFirestoreEmulator
} from 'firebase/firestore';

// Enable offline persistence
export async function enableOfflineSupport() {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
  } catch (err) {
    console.warn('Failed to enable offline persistence:', err);
  }
}

// Database collections with proper typing
export const collections = {
  users: collection(db, 'users'),
  businesses: collection(db, 'businesses'),
  categories: collection(db, 'categories'),
  invites: collection(db, 'invites'),
  notifications: collection(db, 'notifications'),
  reviews: collection(db, 'reviews'),
  analytics: collection(db, 'analytics')
};

// Helper function to get user document reference
export function getUserDocRef(userId: string) {
  return doc(db, 'users', userId);
}

// Helper function to get business document reference
export function getBusinessDocRef(businessId: string) {
  return doc(db, 'businesses', businessId);
}

// Database indexes that should be created in Firestore console
export const REQUIRED_INDEXES = [
  {
    collection: 'users',
    fields: [
      { field: 'role', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'businesses',
    fields: [
      { field: 'category', order: 'ASCENDING' },
      { field: 'isApproved', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'businesses',
    fields: [
      { field: 'isApproved', order: 'ASCENDING' },
      { field: 'location.county', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'invites',
    fields: [
      { field: 'inviterId', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'notifications',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'read', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  }
];

// Performance monitoring
export function logPerformanceMetric(operation: string, duration: number) {
  console.log(`[Performance] ${operation}: ${duration}ms`);
  
  // In production, send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: operation,
      value: duration
    });
  }
}

// Database operation wrapper with performance monitoring
export async function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logPerformanceMetric(operation, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logPerformanceMetric(`${operation}_error`, duration);
    throw error;
  }
}

// Batch operations helper
export class BatchHelper {
  private operations: Array<() => Promise<void>> = [];
  private readonly batchSize: number;

  constructor(batchSize: number = 500) {
    this.batchSize = batchSize;
  }

  add(operation: () => Promise<void>) {
    this.operations.push(operation);
  }

  async execute(): Promise<void> {
    const batches = [];
    for (let i = 0; i < this.operations.length; i += this.batchSize) {
      batches.push(this.operations.slice(i, i + this.batchSize));
    }

    for (const batch of batches) {
      await Promise.all(batch.map(op => op()));
    }
  }

  clear() {
    this.operations = [];
  }
}

// Connection state monitoring
export function monitorConnectionState() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Connection restored');
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost - using cached data');
    });
  }
}