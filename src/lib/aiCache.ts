// ============================================================
// aiCache — deterministic, TTL'd response cache for AI tasks.
//
// Why: per-page AI features (triage brief, operator insight,
// negotiation memo, anomaly scan) are expensive and almost
// always re-asked verbatim while the user navigates. We hash
// the *input* — model id + prompt + briefing pack + task key
// — so any change in any of those invalidates automatically.
//
// Storage is localStorage so the cache survives reloads but is
// strictly client-side. Entries carry a TTL and a schema version
// so we can safely evolve prompts later without poisoning users.
// ============================================================

const LS_PREFIX = 'peb-ai-cache:';
const SCHEMA = 2;

export interface AICacheEntry {
  v: number;          // schema version
  task: string;
  at: number;         // unix ms stored
  ttl: number;        // ms
  payload: string;    // raw model output (text or stringified JSON)
}

/**
 * djb2 — fast, no-deps, 32-bit. Good enough to fingerprint a
 * prompt+context blob; we are not chasing cryptographic collision
 * resistance, just stable cache keys.
 */
export function fingerprint(...parts: (string | number | undefined | null)[]): string {
  const s = parts.map(p => (p == null ? '' : String(p))).join('␟');
  let hash = 5381;
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  // Mix in length to reduce trivial collisions.
  const len = s.length & 0xffff;
  return (((hash >>> 0) * 0x10000) + len).toString(36);
}

export function aiCacheGet(task: string, key: string): string | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + task + ':' + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as AICacheEntry;
    if (entry.v !== SCHEMA) return null;
    if (Date.now() - entry.at > entry.ttl) {
      localStorage.removeItem(LS_PREFIX + task + ':' + key);
      return null;
    }
    return entry.payload;
  } catch {
    return null;
  }
}

export function aiCacheSet(task: string, key: string, payload: string, ttlMs = 1000 * 60 * 60 * 24): void {
  try {
    const entry: AICacheEntry = { v: SCHEMA, task, at: Date.now(), ttl: ttlMs, payload };
    localStorage.setItem(LS_PREFIX + task + ':' + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage disabled — fail silently; cache is a
    // performance optimisation, not a correctness requirement.
  }
}

export function aiCacheClear(task?: string): number {
  let removed = 0;
  try {
    const prefix = LS_PREFIX + (task ? task + ':' : '');
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        localStorage.removeItem(k);
        removed++;
      }
    }
  } catch { /* ignore */ }
  return removed;
}

export function aiCacheStats(): { task: string; count: number; bytes: number }[] {
  const buckets: Record<string, { count: number; bytes: number }> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(LS_PREFIX)) continue;
      const task = k.slice(LS_PREFIX.length).split(':')[0];
      const v = localStorage.getItem(k);
      const bytes = v ? v.length : 0;
      if (!buckets[task]) buckets[task] = { count: 0, bytes: 0 };
      buckets[task].count++;
      buckets[task].bytes += bytes;
    }
  } catch { /* ignore */ }
  return Object.entries(buckets).map(([task, b]) => ({ task, ...b }));
}
