export class CacheService {
  private static MAX_SIZE = 50;

  /**
   * Generates a deterministic cache key.
   */
  static generateKey(text: string, mode: string, targetLang?: string): string {
    const normalizedText = text.trim();
    return `${mode}_${targetLang || 'none'}_${normalizedText}`;
  }

  private static async getCacheData(): Promise<Map<string, string>> {
    return new Promise((resolve) => {
      chrome.storage.session.get('lexiflow_cache', (result) => {
        if (result.lexiflow_cache && typeof result.lexiflow_cache === 'string') {
          try {
            resolve(new Map<string, string>(JSON.parse(result.lexiflow_cache)));
          } catch (e) {
            resolve(new Map<string, string>());
          }
        } else {
          resolve(new Map<string, string>());
        }
      });
    });
  }

  private static async saveCacheData(cache: Map<string, string>): Promise<void> {
    const serialized = JSON.stringify(Array.from(cache.entries()));
    return new Promise((resolve) => {
      chrome.storage.session.set({ lexiflow_cache: serialized }, () => resolve());
    });
  }

  /**
   * Retrieves a value from the cache asynchronously.
   */
  static async get(key: string): Promise<string | null> {
    const cache = await this.getCacheData();
    if (cache.has(key)) {
      // Move to end to mark as recently used
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      await this.saveCacheData(cache);
      return value;
    }
    return null;
  }

  /**
   * Sets a value in the cache asynchronously, enforcing the MAX_SIZE LRU limit.
   */
  static async set(key: string, value: string): Promise<void> {
    const cache = await this.getCacheData();
    if (cache.has(key)) {
      cache.delete(key);
    } else if (cache.size >= this.MAX_SIZE) {
      // Delete the first (oldest) entry
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    cache.set(key, value);
    await this.saveCacheData(cache);
  }

  /**
   * Clears the entire cache asynchronously.
   */
  static async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.session.remove('lexiflow_cache', () => resolve());
    });
  }
}
