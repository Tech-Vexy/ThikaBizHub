// Simple in-memory cache implementation
// In production, you would use Redis or another caching solution
class MemoryCache {
  private cache: Map<string, { data: any; expiry: number }>;
  
  constructor() {
    this.cache = new Map();
  }

  set(key: string, data: any, ttlSeconds: number = 300) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

// Cache decorator for functions
export function cached(ttlSeconds: number = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}_${propertyName}_${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // Execute the method and cache result
      const result = await method.apply(this, args);
      cache.set(cacheKey, result, ttlSeconds);
      
      return result;
    };
  };
}

// Helper function to invalidate cache patterns
export function invalidatePattern(pattern: string): void {
  for (const key of cache['cache'].keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}