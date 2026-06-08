import { useMemo } from 'react';
import { ClipboardCheck, Download, Database } from 'lucide-react';
import type { AuditEntry, AuditEntity } from '@/store/auditStore';
import { FOREST, GOLD, GREEN, ENTITY_ICON, ENTITY_LABEL } from '@/pages/audit/shared';

export function ComplianceProgress({
  entries,
  onSignOff,
}: {
  entries: AuditEntry[];
  onSignOff: () => void;
}) {
  const total      = entries.length;
  const reviewed   = entries.filter(e => e.reviewStatus === 'reviewed').length;
  const flagged    = entries.filter(e => e.reviewStatus === 'flagged').length;
  const escalated  = entries.filter(e => e.reviewStatus === 'escalated').length;
  const unreviewed = total - reviewed - flagged - escalated;
  const pct = total === 0 ? 0 : Math.round(((reviewed + flagged + escalated) / total) * 100);
  const allDone = unreviewed === 0 && total > 0;

  return (
    <div
      className="bg-white rounded-xl border p-4"
      style={{
        borderColor: allDone ? '#86efac' : '#E2E8DC',
        boxShadow: allDone ? '0 0 0 2px rgba(22,163,74,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={14} style={{ color: allDone ? '#16a34a' : FOREST }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: allDone ? '#16a34a' : FOREST }}>
            Compliance Review Progress
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-ink-4">{unreviewed} unreviewed</span>
            {flagged > 0 && <span style={{ color: '#d97706' }}>{flagged} flagged</span>}
            {escalated > 0 && <span style={{ color: '#dc2626' }}>{escalated} escalated</span>}
            <span style={{ color: '#16a34a' }}>{reviewed} reviewed</span>
          </div>
          {allDone ? (
            <button
              onClick={onSignOff}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #0a8a52 100%)`, boxShadow: '0 2px 8px rgba(0,107,63,0.35)' }}
            >
              <Download size={12} />
              Export Signed-Off Report
            </button>
          ) : (
            <span className="text-[11px] font-bold tabular-nums" style={{ color: pct >= 80 ? GREEN : pct >= 50 ? '#d97706' : '#dc2626' }}>
              {pct}% reviewed
            </span>
          )}
        </div>
      </div>

      <div className="h-2 rounded-full bg-surface-2 overflow-hidden flex">
        {/* Reviewed */}
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${total === 0 ? 0 : (reviewed / total) * 100}%`, background: '#16a34a' }}
        />
        {/* Flagged */}
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${total === 0 ? 0 : (flagged / total) * 100}%`, background: '#d97706' }}
        />
        {/* Escalated */}
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${total === 0 ? 0 : (escalated / total) * 100}%`, background: '#dc2626' }}
        />
      </div>

      {allDone && (
        <p className="text-[11px] text-green-600 mt-2 font-medium">
          All entries reviewed — session is ready for sign-off and compliance reporting.
        </p>
      )}
    </div>
  );
}

export function HourlyChart({ entries, now }: { entries: AuditEntry[]; now: number }) {
  const buckets = useMemo(() => {
    const arr = new Array(24).fill(0);
    entries.forEach(e => {
      const hoursAgo = Math.floor((now - new Date(e.timestamp).getTime()) / 3_600_000);
      if (hoursAgo < 24) arr[23 - hoursAgo]++;
    });
    return arr;
  }, [entries, now]);

  const peak = Math.max(...buckets, 1);

  return (
    <div>
      <div className="flex items-end gap-px h-14">
        {buckets.map((n, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            title={`${n} event${n !== 1 ? 's' : ''}`}
            style={{
              height: n > 0 ? `${Math.max((n / peak) * 52, 4)}px` : '3px',
              background: n > 0
                ? `linear-gradient(180deg, ${GOLD} 0%, ${GREEN} 100%)`
                : '#e2e8f0',
              opacity: n > 0 ? 0.85 : 0.35,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-ink-4">24h ago</span>
        <span className="text-[9px] text-ink-4">Now</span>
      </div>
    </div>
  );
}

// ─── Entity breakdown bar ─────────────────────────────────────────────────────

export function EntityBreakdown({ entries }: { entries: AuditEntry[] }) {
  const counts = useMemo(() => {
    const map: Partial<Record<AuditEntity, number>> = {};
    entries.forEach(e => { map[e.entity] = (map[e.entity] ?? 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) as [AuditEntity, number][];
  }, [entries]);

  if (counts.length === 0) return null;
  const total = entries.length || 1;

  return (
    <div className="space-y-2">
      {counts.map(([entity, count]) => {
        const Icon = ENTITY_ICON[entity] ?? Database;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={entity} className="flex items-center gap-2.5">
            <Icon size={11} className="shrink-0" style={{ color: FOREST, opacity: 0.5 }} />
            <span className="text-[11px] text-ink-2 w-28 shrink-0 capitalize">
              {ENTITY_LABEL[entity]}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${GREEN} 0%, ${GOLD} 100%)`,
                }}
              />
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-ink-3 w-6 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
