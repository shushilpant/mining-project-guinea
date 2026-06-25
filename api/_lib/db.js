// ============================================================
// db — Postgres access (Vercel Postgres / Neon).
//
// The whole application dataset is stored as a single authoritative JSONB
// snapshot (one row in `app_snapshot`). The server is the source of truth:
// the client hydrates from it and every mutation is applied + persisted here.
// `audit_log` keeps an append-only trail of every write.
//
// The Neon `sql` tagged template parametrises all interpolated values, so these
// queries are not string-concatenated and are safe from SQL injection.
// ============================================================

import { neon } from '@neondatabase/serverless';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Vercel's Neon integration provides DATABASE_URL; POSTGRES_URL is the legacy
// name kept for compatibility. Lazily constructed so importing this module
// doesn't throw before the env is available.
let _sql;
function databaseUrl() {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
  if (!url) return '';
  if (/^postgres:\/\/user:password@host\/db(?:\?|$)/.test(url)) return '';
  if (/^postgresql:\/\/user:password@host\/db(?:\?|$)/.test(url)) return '';
  return url;
}

function useLocalStore() {
  // Allow local store fallback even in production (e.g. Vercel) for ephemeral demo deployments
  // if no DATABASE_URL is provided.
  return !databaseUrl();
}

function emptyLocalStore() {
  return { data: null, version: 0, audit: [], nextAuditId: 1 };
}

function localStorePath() {
  return process.env.ACCI_LOCAL_DB_PATH || join(tmpdir(), 'acci-local-db.json');
}

function loadLocalStore() {
  const file = localStorePath();
  if (!existsSync(file)) return emptyLocalStore();
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    return {
      data: parsed?.data ?? null,
      version: Number(parsed?.version) || 0,
      audit: Array.isArray(parsed?.audit) ? parsed.audit : [],
      nextAuditId: Number(parsed?.nextAuditId) || 1,
    };
  } catch {
    return emptyLocalStore();
  }
}

function saveLocalStore(store) {
  writeFileSync(localStorePath(), JSON.stringify(store), 'utf8');
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function sql(strings, ...values) {
  if (!_sql) {
    const url = databaseUrl();
    if (!url) throw new Error('DATABASE_URL is not set.');
    _sql = neon(url);
  }
  return _sql(strings, ...values);
}

export async function ensureSchema() {
  if (useLocalStore()) return;
  await sql`
    CREATE TABLE IF NOT EXISTS app_snapshot (
      id         int PRIMARY KEY DEFAULT 1,
      data       jsonb NOT NULL,
      version    int   NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT app_snapshot_singleton CHECK (id = 1)
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id    bigserial PRIMARY KEY,
      at    timestamptz NOT NULL DEFAULT now(),
      actor text,
      entry jsonb NOT NULL
    )`;
}

/** Returns { data, version } or null if no snapshot has been seeded yet. */
export async function getSnapshot() {
  if (useLocalStore()) {
    const store = loadLocalStore();
    if (!store.data) return null;
    return { data: clone(store.data), version: store.version };
  }

  const rows = await sql`SELECT data, version FROM app_snapshot WHERE id = 1`;
  if (!rows[0]) return null;
  return { data: rows[0].data, version: rows[0].version };
}

/** Upsert the singleton snapshot row. */
export async function putSnapshot(data, version) {
  if (useLocalStore()) {
    const store = loadLocalStore();
    store.data = clone(data);
    store.version = version;
    saveLocalStore(store);
    return;
  }

  await sql`
    INSERT INTO app_snapshot (id, data, version, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, ${version}, now())
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, version = EXCLUDED.version, updated_at = now()`;
}

/** Seed the snapshot only if none exists yet. Returns true if it wrote. */
export async function seedIfEmpty(data) {
  const existing = await getSnapshot();
  if (existing) return false;
  await putSnapshot(data, 1);
  return true;
}

export async function appendAudit(actor, entry) {
  if (useLocalStore()) {
    const store = loadLocalStore();
    store.audit.push({
      id: String(store.nextAuditId++),
      actor,
      at: new Date().toISOString(),
      ...clone(entry),
    });
    saveLocalStore(store);
    return;
  }

  await sql`INSERT INTO audit_log (actor, entry) VALUES (${actor}, ${JSON.stringify(entry)}::jsonb)`;
}

/** Most-recent audit entries, newest first, in the shape the client store expects. */
export async function recentAudit(limit = 300) {
  if (useLocalStore()) {
    const store = loadLocalStore();
    return store.audit.slice(-limit).reverse().map(clone);
  }

  const rows = await sql`
    SELECT id, actor, at, entry FROM audit_log ORDER BY id DESC LIMIT ${limit}`;
  return rows.map((r) => ({ id: String(r.id), actor: r.actor, at: r.at, ...r.entry }));
}
