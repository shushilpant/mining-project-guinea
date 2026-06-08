// Defences for untrusted files entering the app via the Admin import flow.
//
// The file is fully attacker-controlled: it arrives by drag-drop / file picker
// and is handed to a binary spreadsheet parser. We constrain it on three axes
// before and after parsing:
//   1. Resource bounds   — reject oversized files / sheets so a crafted upload
//                          can't exhaust the tab's memory (client-side DoS).
//   2. Identity          — accept only the advertised extensions; never trust
//                          a dropped file's type blindly.
//   3. Structural safety — strip prototype-polluting keys ("__proto__",
//                          "constructor", "prototype") that a malicious header
//                          row could smuggle into object construction.

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMPORT_ROWS = 10_000;
export const MAX_HEADER_COLS = 200;
export const MAX_CELL_LEN = 10_000;

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;

/** Header names that must never become object keys (prototype pollution). */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Validate a file before parsing. Returns an error message, or null if safe.
 */
export function validateImportFile(file: File): string | null {
  if (file.size === 0) return 'File is empty.';
  if (file.size > MAX_IMPORT_BYTES) {
    return `File too large (max ${MAX_IMPORT_BYTES / (1024 * 1024)} MB).`;
  }
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))) {
    return `Unsupported file type. Accepts ${ALLOWED_EXTENSIONS.join(', ')}.`;
  }
  return null;
}

/** True if a header cell is a prototype-pollution vector and must be dropped. */
export function isForbiddenKey(key: string): boolean {
  return FORBIDDEN_KEYS.has(key);
}

/** Clamp a parsed cell so a single hostile value can't be unboundedly large. */
export function clampCell(value: unknown): unknown {
  if (typeof value === 'string' && value.length > MAX_CELL_LEN) {
    return value.slice(0, MAX_CELL_LEN);
  }
  return value;
}
