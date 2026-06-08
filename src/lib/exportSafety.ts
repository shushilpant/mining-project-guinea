// Defences for data leaving the app as spreadsheet files.
//
// CSV / formula injection (a.k.a. CIAJ): when a victim opens an exported
// .xlsx/.csv, any cell whose text begins with = + - @ or a control char is
// interpreted by Excel / Sheets / LibreOffice as a *formula*, enabling data
// exfiltration (=HYPERLINK / WEBSERVICE) or command execution (DDE). Since we
// export operator-, agreement-, and audit-supplied text, every string cell is
// untrusted. We neutralize the leading character per OWASP guidance by
// prefixing a single quote, which forces literal-text interpretation.

const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

/** Hard cap so a hostile imported value can't bloat an exported sheet. */
const MAX_EXPORT_CELL_LEN = 32_000;

/** Neutralize a single value destined for a spreadsheet cell. */
export function sanitizeCell(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  let v = value.length > MAX_EXPORT_CELL_LEN ? value.slice(0, MAX_EXPORT_CELL_LEN) : value;
  if (FORMULA_TRIGGERS.test(v)) v = `'${v}`;
  return v;
}

/** Sanitize every cell of an array-of-records sheet before XLSX.utils.json_to_sheet. */
export function sanitizeRecords<T extends Record<string, unknown>>(rows: T[]): Record<string, unknown>[] {
  return rows.map(row => {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(row)) {
      out[key] = sanitizeCell(val);
    }
    return out;
  });
}

/** Sanitize a 2-D array-of-arrays sheet before XLSX.utils.aoa_to_sheet. */
export function sanitizeMatrix(rows: unknown[][]): unknown[][] {
  return rows.map(row => row.map(sanitizeCell));
}
