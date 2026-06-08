const DEFAULT_TTL_MS = Number(process.env.CACHE_TTL_MS || 60_000);

// In-memory cache: server restart хийхэд цэвэрлэгдэнэ.
const store = new Map();

// Cache group бүр аль key prefix-үүдийг цэвэрлэхийг тодорхойлно.
const GROUP_PREFIXES = {
  halls: ['hall:list', 'hall:detail'],
  categories: ['category:list'],
  dashboard: ['dashboard:'],
  availableTimes: ['available-times:'],
  payments: ['payment:', 'payments:'],
  commission: ['commission-report']
};

function now() {
  return Date.now();
}

// Cache-д value хадгалахдаа expire time хамт хадгална.
function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, {
    value,
    expiresAt: ttlMs > 0 ? now() + ttlMs : Number.POSITIVE_INFINITY
  });

  return value;
}

// Expired cache entry таарвал устгаад miss гэж үзнэ.
function get(key) {
  const entry = store.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= now()) {
    store.delete(key);
    return undefined;
  }

  return entry.value;
}

function del(key) {
  return store.delete(key);
}

function clear() {
  store.clear();
}

// Prefix-ээр эхэлсэн бүх cache key-г invalidate хийнэ.
function invalidateByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

function invalidateGroup(group) {
  const prefixes = GROUP_PREFIXES[group] || [group];
  prefixes.forEach(invalidateByPrefix);
}

function invalidateGroups(groups) {
  groups.forEach(invalidateGroup);
}

// Loader function-ийн үр дүнг cache miss үед л ажиллуулна.
async function remember(key, ttlMs, loader) {
  const cached = get(key);

  if (cached !== undefined) {
    return cached;
  }

  const value = await loader();
  set(key, value, ttlMs);
  return value;
}

// Hall create/update/delete үед дуудагдах зориулалттай helper.
function clearHallCache() {
  invalidateGroup('halls');
}

// Booking create/cancel үед available time cache-г цэвэрлэх helper.
function clearAvailableTimesCache(hallId) {
  if (hallId) {
    invalidateByPrefix(`available-times:${hallId}:`);
    return;
  }

  invalidateGroup('availableTimes');
}

// Payment update/webhook/payout үед dashboard/payment/commission cache-г цэвэрлэнэ.
function clearPaymentCache() {
  invalidateGroups(['payments', 'dashboard', 'commission']);
}

module.exports = {
  clear,
  clearAvailableTimesCache,
  clearHallCache,
  clearPaymentCache,
  del,
  get,
  invalidateByPrefix,
  invalidateGroup,
  invalidateGroups,
  remember,
  set
};
