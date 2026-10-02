// OmniAgency OS - High-Performance Database Query Cache
// Features: TTL expiry, Tag-based invalidation, Cache Hit/Miss Telemetry

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalQueries: number;
  hitRatio: number;
  keysCount: number;
  savedQueriesMs: number;
}

class DatabaseCache {
  private store = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalQueries: 0,
    hitRatio: 0,
    keysCount: 0,
    savedQueriesMs: 0,
  };
  private listeners: ((stats: CacheStats) => void)[] = [];
  private notifyTimeout: any = null;

  // Default TTL: 60 seconds (1 minute)
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T> | T,
    options?: { ttlSeconds?: number; tags?: string[] }
  ): Promise<{ data: T; fromCache: boolean }> {
    const ttlMs = (options?.ttlSeconds ?? 60) * 1000;
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing && existing.expiresAt > now) {
      this.stats.hits++;
      this.stats.totalQueries++;
      this.stats.savedQueriesMs += 35; // Simulated DB roundtrip saved
      this.updateHitRatio();
      return { data: existing.data as T, fromCache: true };
    }

    // Cache miss
    this.stats.misses++;
    this.stats.totalQueries++;
    this.updateHitRatio();

    const data = await fetcher();
    this.store.set(key, {
      data,
      expiresAt: now + ttlMs,
      tags: options?.tags || [],
      createdAt: now,
    });
    this.stats.keysCount = this.store.size;
    this.scheduleNotify();

    return { data, fromCache: false };
  }

  public get<T>(key: string): T | null {
    const existing = this.store.get(key);
    if (!existing) return null;
    if (existing.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.stats.keysCount = this.store.size;
      return null;
    }
    return existing.data as T;
  }

  public set<T>(key: string, data: T, ttlSeconds = 60, tags: string[] = []): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags,
      createdAt: Date.now(),
    });
    this.stats.keysCount = this.store.size;
    this.notify();
  }

  // Invalidate by matching tag (e.g. invalidate by client_id or table name)
  public invalidateTags(tags: string[]): number {
    let evicted = 0;
    const tagSet = new Set(tags);
    for (const [key, entry] of this.store.entries()) {
      const match = entry.tags.some((t) => tagSet.has(t));
      if (match) {
        this.store.delete(key);
        evicted++;
      }
    }
    this.stats.keysCount = this.store.size;
    this.notify();
    return evicted;
  }

  public invalidateKey(key: string): boolean {
    const deleted = this.store.delete(key);
    this.stats.keysCount = this.store.size;
    this.notify();
    return deleted;
  }

  public clear(): void {
    this.store.clear();
    this.stats.keysCount = 0;
    this.notify();
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public subscribe(listener: (stats: CacheStats) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStats());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private updateHitRatio(): void {
    if (this.stats.totalQueries === 0) {
      this.stats.hitRatio = 0;
    } else {
      this.stats.hitRatio = Math.round((this.stats.hits / this.stats.totalQueries) * 100);
    }
  }

  private scheduleNotify(): void {
    if (this.notifyTimeout) return;
    this.notifyTimeout = setTimeout(() => {
      this.notifyTimeout = null;
      this.notify();
    }, 250);
  }

  private notify(): void {
    const current = this.getStats();
    for (const listener of this.listeners) {
      try {
        listener(current);
      } catch (err) {
        console.error('Cache listener error', err);
      }
    }
  }
}

export const dbCache = new DatabaseCache();
