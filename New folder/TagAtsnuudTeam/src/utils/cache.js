<<<<<<< HEAD
/**
 * Simple in-memory cache utility
 * For production, consider using Redis
 */
class Cache {
  constructor() {
    this.store = {};
    this.timers = {};
  }

  /**
   * Set cache with optional TTL (in seconds)
   */
  set(key, value, ttl = null) {
    this.store[key] = value;

    if (ttl) {
      // Clear existing timer if any
      if (this.timers[key]) {
        clearTimeout(this.timers[key]);
      }
      // Set new timer
      this.timers[key] = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
    }
  }

  /**
   * Get cache value
   */
  get(key) {
    return this.store[key] || null;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return key in this.store;
  }

  /**
   * Delete cache key
   */
  delete(key) {
    delete this.store[key];
    if (this.timers[key]) {
      clearTimeout(this.timers[key]);
      delete this.timers[key];
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  deleteByPattern(pattern) {
    const regex = new RegExp(pattern);
    Object.keys(this.store).forEach(key => {
      if (regex.test(key)) {
        this.delete(key);
      }
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    Object.keys(this.timers).forEach(key => {
      clearTimeout(this.timers[key]);
    });
    this.store = {};
    this.timers = {};
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      keys: Object.keys(this.store).length,
      memory: JSON.stringify(this.store).length + ' bytes'
    };
  }
}

// Export singleton instance
module.exports = new Cache();
=======
const store = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

const get = (key) => {
  const item = store.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expiresAt) {
    store.delete(key);
    return null;
  }

  return item.value;
};

const set = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const clearByPrefix = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};

const has = (key) => {
  const item = get(key);
  return item !== null;
};

const clear = () => {
  store.clear();
};

const keys = () => Array.from(store.keys());

module.exports = {
  get,
  set,
  clearByPrefix,
  has,
  clear,
  keys,
};
>>>>>>> cf86bee4d3d7bad7b8b9eeee66dba0a4cdfc464c
