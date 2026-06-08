import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import * as XLSX from 'xlsx';
import { sanitizeRecords } from '@/lib/exportSafety';
import {
  Activity, Download, Trash2, Search,
  Shield, Clock, Database, Flag,
  ArrowUpCircle, CheckCircle, AlertCircle, ChevronDown,
} from 'lucide-react';
import {
  useAuditStore,
  type AuditAction,
  type AuditEntity,
  type ReviewStatus,
} from '@/store/auditStore';
import { useRole } from '@/hooks/useRole';
import { ModuleIntro } from '@/components/shared/ModuleIntro';
import { FOREST, GOLD, GREEN, ACTION_CFG, ENTITY_LABEL, REVIEW_CFG, fmtTime, elapsed } from '@/pages/audit/shared';
import { ComplianceProgress, HourlyChart, EntityBreakdown } from '@/pages/audit/widgets';
import { ReviewQueue } from '@/pages/audit/ReviewQueue';
import { ReviewControls } from '@/pages/audit/ReviewControls';

export function AuditMonitorPage() {
  const { isAdmin } = useRole();
  const {
    entries, clearAll, sessionStart,
    markReviewed, flagEntry, escalateEntry,
    bulkMarkReviewed, seedIfEmpty,
  } = useAuditStore();

  const [search, setSearch]                 = useState('');
  const [actionFilter, setActionFilter]     = useState<AuditAction | 'all'>('all');
  const [entityFilter, setEntityFilter]     = useState<AuditEntity | 'all'>('all');
  const [reviewFilter, setReviewFilter]     = useState<ReviewStatus | 'all'>('all');
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [focusedId, setFocusedId]           = useState<string | null>(null);
  const [newIds, setNewIds]                 = useState<Set<string>>(new Set());
  const [now, setNow]                       = useState(() => Date.now());
  const rowRefs                             = useRef<Record<string, HTMLTableRowElement | null>>({});

  const prevLen = useRef(entries.length);

  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  // Tick elapsed times
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  // Flash new entries
  useEffect(() => {
    if (entries.length > prevLen.current) {
      const fresh = new Set(entries.slice(0, entries.length - prevLen.current).map(e => e.id));
      setNewIds(fresh);
      const t = setTimeout(() => setNewIds(new Set()), 4000);
      prevLen.current = entries.length;
      return () => clearTimeout(t);
    }
    prevLen.current = entries.length;
    // Intentionally keyed on the count, not the array identity: we only flash
    // when new entries are *added*, not when existing ones are edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  // Scroll focused entry into view
  useEffect(() => {
    if (focusedId && rowRefs.current[focusedId]) {
      rowRefs.current[focusedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusedId]);

  const filtered = useMemo(() => {
    let list = entries;
    if (actionFilter !== 'all') list = list.filter(e => e.action === actionFilter);
    if (entityFilter !== 'all') list = list.filter(e => e.entity === entityFilter);
    if (reviewFilter !== 'all') list = list.filter(e => e.reviewStatus === reviewFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.entityLabel.toLowerCase().includes(q) ||
        (e.field ?? '').toLowerCase().includes(q) ||
        (e.details ?? '').toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q),
      );
    }
    return list;
  }, [entries, actionFilter, entityFilter, reviewFilter, search]);

  const stats = useMemo(() => {
    const total      = entries.length;
    const unreviewed = entries.filter(e => e.reviewStatus === 'unreviewed').length;
    const flagged    = entries.filter(e => e.reviewStatus === 'flagged').length;
    const escalated  = entries.filter(e => e.reviewStatus === 'escalated').length;
    const reviewed   = entries.filter(e => e.reviewStatus === 'reviewed').length;
    const anomalies  = entries.filter(e => e.isAnomaly).length;
    return { total, unreviewed, flagged, escalated, reviewed, anomalies };
  }, [entries]);

  const sessionElapsed = useMemo(() => {
    const secs = Math.floor((now - new Date(sessionStart).getTime()) / 1000);
    if (secs < 60)   return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  }, [now, sessionStart]);

  const handleSelect = (id: string) => {
    setFocusedId(id);
    setExpandedId(id);
    setReviewFilter('all');
    setActionFilter('all');
    setEntityFilter('all');
    setSearch('');
  };

  const handleQuickReview = (id: string) => markReviewed(id);
  const handleQuickFlag   = (id: string) => flagEntry(id, 'Flagged for investigation');
  const handleQuickEscalate = (id: string) => escalateEntry(id, 'Escalated for review');

  const handleBulkReview = () => {
    const ids = filtered
      .filter(e => e.reviewStatus === 'unreviewed')
      .map(e => e.id);
    bulkMarkReviewed(ids);
  };

  const handleExport = (signedOff = false) => {
    const data = filtered.map(e => ({
      Timestamp:      fmtTime(e.timestamp),
      Action:         e.action,
      Entity:         ENTITY_LABEL[e.entity] ?? e.entity,
      Record:         e.entityLabel,
      'Entity ID':    e.entityId,
      User:           e.user ?? 'admin',
      Field:          e.field ?? '',
      'Old Value':    e.oldValue ?? '',
      'New Value':    e.newValue ?? '',
      Details:        e.details ?? '',
      Count:          e.count ?? '',
      'Review Status': e.reviewStatus,
      'Review Note':  e.reviewNote ?? '',
      'Reviewed At':  e.reviewedAt ? fmtTime(e.reviewedAt) : '',
      'Reviewed By':  e.reviewedBy ?? '',
      Anomaly:        e.isAnomaly ? 'Yes' : '',
      'Anomaly Reason': e.anomalyReason ?? '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sanitizeRecords(data)), 'Audit Log');
    const suffix = signedOff ? '_signed_off' : '';
    XLSX.writeFile(wb, `peb0526_audit${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto mb-3 text-line-strong" size={48} />
          <p className="text-ink-2 font-medium">Admin access required</p>
          <p className="text-xs text-ink-4 mt-1">Sign in as an administrator to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-9 rounded-full shrink-0 bg-gold-500" aria-hidden />
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ color: FOREST }}>
                Activity Log
              </h1>
              <p className="text-[11px] text-ink-3 mt-0.5">
                A running record of every action taken in the platform — review, flag, and sign off.
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ml-1"
              style={{ background: 'rgba(0,107,63,0.08)', color: GREEN, border: `1px solid rgba(0,107,63,0.18)` }}
            >
              <div className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: GREEN }} />
              Live
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #E2E8DC', color: '#6B8A7A' }}
          >
            <Clock size={11} />
            Session: {sessionElapsed}
          </div>
          <button
            onClick={() => handleExport(false)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-line-strong text-ink-2 bg-surface transition-colors hover:bg-surface-2 disabled:opacity-40"
          >
            <Download size={13} />
            Export
          </button>
          {entries.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors bg-white"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      <ModuleIntro />

      {/* ── Compliance progress bar ───────────────────────────────────────────── */}
      {entries.length > 0 && (
        <ComplianceProgress entries={entries} onSignOff={() => handleExport(true)} />
      )}

      {/* ── Summary stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Events',  value: stats.total,      icon: Database,       color: FOREST,    filter: null       },
          { label: 'Unreviewed',   value: stats.unreviewed, icon: Clock,          color: '#64748b', filter: 'unreviewed' as ReviewStatus },
          { label: 'Flagged',      value: stats.flagged,    icon: Flag,           color: '#d97706', filter: 'flagged' as ReviewStatus   },
          { label: 'Escalated',    value: stats.escalated,  icon: ArrowUpCircle,  color: '#dc2626', filter: 'escalated' as ReviewStatus  },
          { label: 'Reviewed',     value: stats.reviewed,   icon: CheckCircle,    color: '#16a34a', filter: 'reviewed' as ReviewStatus   },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => s.filter ? setReviewFilter(reviewFilter === s.filter ? 'all' : s.filter) : setReviewFilter('all')}
            className="bg-white rounded-xl border px-4 py-3.5 flex items-center gap-3 text-left transition-all"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              borderColor: (s.filter && reviewFilter === s.filter) ? s.color : '#e2e8f0',
              outline: (s.filter && reviewFilter === s.filter) ? `2px solid ${s.color}20` : 'none',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${s.color}12` }}
            >
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[10px] text-ink-3 font-medium mt-0.5">{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="col-span-2 bg-white rounded-xl border border-line p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Activity — Last 24 Hours
              </div>
              <div className="text-[10px] text-ink-4 mt-0.5">
                {entries.length} total events · {stats.anomalies} anomalies detected
              </div>
            </div>
            {entries.length > 0 && (
              <div className="text-[10px] text-ink-4 font-mono">
                Latest: {elapsed(entries[0].timestamp)}
              </div>
            )}
          </div>
          <HourlyChart entries={entries} now={now} />
        </div>

        <div
          className="bg-white rounded-xl border border-line p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-4">
            By Entity Type
          </div>
          {entries.length === 0 ? (
            <p className="text-[11px] text-ink-4 text-center py-6">No data yet</p>
          ) : (
            <EntityBreakdown entries={entries} />
          )}
        </div>
      </div>

      {/* ── Review queue + full table ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 items-stretch">

        {/* Review queue — absolutely filled so its box height matches the adjacent
            audit table exactly (the table drives the row height; the queue scrolls
            internally to fit). */}
        <div className="relative">
          <div className="absolute inset-0">
            <ReviewQueue
              entries={entries}
              focusedId={focusedId}
              onSelect={handleSelect}
              onMarkReviewed={handleQuickReview}
              onFlag={handleQuickFlag}
              onEscalate={handleQuickEscalate}
            />
          </div>
        </div>

        {/* Full audit table */}
        <div
          className="col-span-2 bg-white rounded-xl border border-line overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          {/* Filter bar */}
          <div
            className="px-4 py-3 border-b border-line-soft flex flex-wrap items-center gap-3"
            style={{ background: '#FAFAF8' }}
          >
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-4" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search records, fields…"
                className="pl-8 pr-3 py-1.5 text-xs border border-line rounded-lg w-44 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': GREEN } as React.CSSProperties}
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-ink-4 uppercase tracking-wider">Action</span>
              {(['all', 'create', 'update', 'import', 'bulk_update'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setActionFilter(a)}
                  className="px-2 py-1 text-[10px] rounded font-semibold capitalize transition-colors"
                  style={actionFilter === a ? { background: FOREST, color: '#fff' } : { color: '#64748b' }}
                >
                  {a === 'bulk_update' ? 'Bulk' : a === 'all' ? 'All' : a}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-ink-4 uppercase tracking-wider">Review</span>
              {(['all', 'unreviewed', 'flagged', 'escalated', 'reviewed'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setReviewFilter(r)}
                  className="px-2 py-1 text-[10px] rounded font-semibold capitalize transition-colors"
                  style={reviewFilter === r ? { background: FOREST, color: '#fff' } : { color: REVIEW_CFG[r as ReviewStatus]?.color ?? '#64748b' }}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {filtered.filter(e => e.reviewStatus === 'unreviewed').length > 0 && (
                <button
                  onClick={handleBulkReview}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded border transition-colors hover:bg-green-50"
                  style={{ borderColor: '#86efac', color: '#16a34a' }}
                >
                  <CheckCircle size={10} />
                  Mark all reviewed ({filtered.filter(e => e.reviewStatus === 'unreviewed').length})
                </button>
              )}
              <span className="text-[10px] text-ink-4 tabular-nums">
                {filtered.length} / {entries.length}
              </span>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Activity size={36} className="mx-auto mb-3 text-line-strong" />
              <p className="text-ink-4 text-sm font-medium">No events recorded yet</p>
              <p className="text-ink-4 text-xs mt-1">
                Edits, imports, creates, and bulk updates will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#F8FAF6', borderBottom: '1px solid #EEF2EA' }}>
                    <th className="w-1" />
                    <th className="px-4 py-2.5 text-left font-semibold text-ink-3 whitespace-nowrap">Timestamp</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink-3">Action</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink-3">Entity</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink-3">Record</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink-3">Field / Detail</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-ink-3 w-32">Review</th>
                    <th className="px-3 py-2.5 w-6" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map(entry => {
                    const isNew      = newIds.has(entry.id);
                    const isExpanded = expandedId === entry.id;
                    const isFocused  = focusedId === entry.id;
                    const cfg        = ACTION_CFG[entry.action] ?? ACTION_CFG.update;
                    const rvwCfg     = REVIEW_CFG[entry.reviewStatus];

                    return (
                      <Fragment key={entry.id}>
                        <tr
                          ref={el => { rowRefs.current[entry.id] = el; }}
                          className={
                            'border-b border-line-soft cursor-pointer transition-colors ' +
                            (!isNew && !isExpanded && !isFocused ? 'hover:bg-surface-2' : '')
                          }
                          style={{
                            background: isNew
                              ? `rgba(214,138,24,0.06)`
                              : isExpanded || isFocused
                              ? `rgba(6,43,29,0.025)`
                              : undefined,
                          }}
                          onClick={() => {
                            setExpandedId(isExpanded ? null : entry.id);
                            setFocusedId(entry.id);
                          }}
                        >
                          {/* Review status bar */}
                          <td className="py-0 px-0">
                            <div
                              className="w-1 h-full min-h-[36px]"
                              style={{ background: rvwCfg.border, opacity: 0.8 }}
                            />
                          </td>

                          <td className="px-4 py-2.5 text-ink-3 whitespace-nowrap font-mono text-[10px]">
                            <div className="flex items-center gap-1.5">
                              {isNew && (
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full"
                                  style={{ background: GOLD }}
                                />
                              )}
                              {entry.isAnomaly && (
                                <span title={entry.anomalyReason}><AlertCircle size={9} style={{ color: '#7c3aed' }} /></span>
                              )}
                              {fmtTime(entry.timestamp)}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap"
                              style={{ color: cfg.color, background: cfg.bg }}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-ink-2 capitalize whitespace-nowrap">
                            {ENTITY_LABEL[entry.entity] ?? entry.entity}
                          </td>
                          <td className="px-4 py-2.5 text-ink-2 font-medium max-w-[160px] truncate">
                            {entry.entityLabel}
                          </td>
                          <td className="px-4 py-2.5 text-ink-3 max-w-[140px] truncate">
                            {entry.field ?? entry.details ?? (entry.count != null ? `${entry.count} records` : '—')}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="px-2 py-0.5 rounded-full font-semibold text-[10px] capitalize"
                              style={{ color: rvwCfg.color, background: rvwCfg.bg }}
                            >
                              {rvwCfg.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <ChevronDown
                              size={11}
                              className="text-line-strong transition-transform duration-150"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : '' }}
                            />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr
                            key={`${entry.id}-expanded`}
                            style={{ background: `rgba(6,43,29,0.02)`, borderBottom: '1px solid #EEF2EA' }}
                          >
                            <td />
                            <td colSpan={7} className="px-6 py-3.5">
                              {/* Review controls */}
                              <ReviewControls entry={entry} />

                              {/* Entry metadata */}
                              <div className="grid grid-cols-4 gap-5 text-[11px] mt-3">
                                <div>
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">Entry ID</div>
                                  <div className="font-mono text-ink-3 break-all">{entry.id}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">Entity ID</div>
                                  <div className="font-mono text-ink-3">{entry.entityId}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">ISO Timestamp</div>
                                  <div className="font-mono text-ink-3">{entry.timestamp}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">User</div>
                                  <div className="text-ink-3">{entry.user ?? 'admin'}</div>
                                </div>
                                {entry.isAnomaly && (
                                  <div className="col-span-4">
                                    <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>
                                      Anomaly Detected
                                    </div>
                                    <div className="text-[11px]" style={{ color: '#7c3aed' }}>{entry.anomalyReason}</div>
                                  </div>
                                )}
                                {entry.oldValue !== undefined && (
                                  <div className="col-span-2">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">Change</div>
                                    <div className="text-[11px]">
                                      <span className="line-through text-red-400">{entry.oldValue}</span>
                                      {' → '}
                                      <span style={{ color: GREEN }} className="font-semibold">{entry.newValue}</span>
                                    </div>
                                  </div>
                                )}
                                {entry.details && (
                                  <div className="col-span-4">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">Details</div>
                                    <div className="text-ink-2">{entry.details}</div>
                                  </div>
                                )}
                                {entry.count != null && (
                                  <div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-ink-4 mb-1">Record Count</div>
                                    <div className="text-ink-2">{entry.count}</div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 100 && (
            <div
              className="px-4 py-2.5 text-[11px] text-ink-4 text-center border-t border-line-soft"
              style={{ background: '#FAFAF8' }}
            >
              Showing 100 of {filtered.length} entries — refine your filters to see more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
