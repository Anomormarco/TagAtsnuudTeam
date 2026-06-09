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



