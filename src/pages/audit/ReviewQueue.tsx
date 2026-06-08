import { useState } from 'react';
import { CheckCircle, AlertCircle, Flag, ArrowUpCircle, Database } from 'lucide-react';
import type { AuditEntry } from '@/store/auditStore';
import { FOREST, ACTION_CFG, REVIEW_CFG, ENTITY_ICON, elapsed } from '@/pages/audit/shared';

export function ReviewQueue({
  entries,
  onSelect,
  focusedId,
  onMarkReviewed,
  onFlag,
  onEscalate,
}: {
  entries: AuditEntry[];
  onSelect: (id: string) => void;
  focusedId: string | null;
  onMarkReviewed: (id: string) => void;
  onFlag: (id: string) => void;
  onEscalate: (id: string) => void;
}) {
  const [tab, setTab] = useState<'priority' | 'all'>('priority');

  const escalated  = entries.filter(e => e.reviewStatus === 'escalated');
  const flagged    = entries.filter(e => e.reviewStatus === 'flagged');
  const anomalies  = entries.filter(e => e.isAnomaly && e.reviewStatus === 'unreviewed');
  const regular    = entries.filter(e => !e.isAnomaly && e.reviewStatus === 'unreviewed');

  const priorityList: AuditEntry[] = [...escalated, ...flagged, ...anomalies, ...regular];
  const displayList = tab === 'priority' ? priorityList : entries;

  return (
    <div className="bg-white rounded-xl border border-line flex flex-col h-full" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-line-soft shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3">Review Queue</div>
          {priorityList.length > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: '#fef2f2', color: '#dc2626' }}
            >
              {priorityList.length} need action
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {(['priority', 'all'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-2.5 py-1 text-[10px] font-semibold rounded capitalize transition-colors"
              style={tab === t ? { background: FOREST, color: '#fff' } : { color: '#64748b' }}
            >
              {t === 'priority' ? `Priority (${priorityList.length})` : `All (${entries.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {displayList.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle size={28} className="mx-auto mb-2" style={{ color: '#86efac' }} />
            <p className="text-[11px] text-ink-4 font-medium">All clear — nothing to review</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {/* Group headers for priority tab */}
            {tab === 'priority' && escalated.length > 0 && (
              <QueueGroup label="Escalated" color="#dc2626" entries={escalated} focusedId={focusedId} onSelect={onSelect} onMarkReviewed={onMarkReviewed} onFlag={onFlag} onEscalate={onEscalate} />
            )}
            {tab === 'priority' && flagged.length > 0 && (
              <QueueGroup label="Flagged" color="#d97706" entries={flagged} focusedId={focusedId} onSelect={onSelect} onMarkReviewed={onMarkReviewed} onFlag={onFlag} onEscalate={onEscalate} />
            )}
            {tab === 'priority' && anomalies.length > 0 && (
              <QueueGroup label="Anomalies" color="#7c3aed" entries={anomalies} focusedId={focusedId} onSelect={onSelect} onMarkReviewed={onMarkReviewed} onFlag={onFlag} onEscalate={onEscalate} />
            )}
            {tab === 'priority' && regular.length > 0 && (
              <QueueGroup label="Unreviewed" color="#94a3b8" entries={regular.slice(0, 25)} focusedId={focusedId} onSelect={onSelect} onMarkReviewed={onMarkReviewed} onFlag={onFlag} onEscalate={onEscalate} />
            )}
            {tab === 'all' && displayList.map(e => (
              <QueueRow key={e.id} entry={e} isFocused={focusedId === e.id} onSelect={onSelect} onMarkReviewed={onMarkReviewed} onFlag={onFlag} onEscalate={onEscalate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function QueueGroup({
  label, color, entries, focusedId, onSelect, onMarkReviewed, onFlag, onEscalate,
}: {
  label: string; color: string; entries: AuditEntry[]; focusedId: string | null;
  onSelect: (id: string) => void; onMarkReviewed: (id: string) => void;
  onFlag: (id: string) => void; onEscalate: (id: string) => void;
}) {
  return (
    <div className="mb-1">
      <div className="px-2 py-1 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      {entries.map(e => (
        <QueueRow key={e.id} entry={e} isFocused={focusedId === e.id} onSelect={onSelect} onMarkReviewed={onMarkReviewed} onFlag={onFlag} onEscalate={onEscalate} />
      ))}
    </div>
  );
}

export function QueueRow({
  entry, isFocused, onSelect, onMarkReviewed, onFlag, onEscalate,
}: {
  entry: AuditEntry; isFocused: boolean;
  onSelect: (id: string) => void; onMarkReviewed: (id: string) => void;
  onFlag: (id: string) => void; onEscalate: (id: string) => void;
}) {
  const cfg     = ACTION_CFG[entry.action] ?? ACTION_CFG.update;
  const rvwCfg  = REVIEW_CFG[entry.reviewStatus];
  const Icon    = ENTITY_ICON[entry.entity] ?? Database;

  return (
    <div
      className="flex items-start gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all"
      style={{
        background: isFocused ? `rgba(6,43,29,0.05)` : 'transparent',
        borderLeft: `2px solid ${rvwCfg.border}`,
      }}
      onClick={() => onSelect(entry.id)}
    >
      <Icon size={11} className="mt-0.5 shrink-0" style={{ color: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-ink-2 truncate leading-tight">
          {entry.entityLabel}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-bold px-1 py-0.5 rounded-sm" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          {entry.isAnomaly && (
            <AlertCircle size={9} style={{ color: '#7c3aed' }} />
          )}
          <span className="text-[9px] text-ink-4 truncate">{elapsed(entry.timestamp)}</span>
        </div>
      </div>
      {/* Quick actions - only show for unreviewed/anomaly */}
      {(entry.reviewStatus === 'unreviewed' || entry.reviewStatus === 'flagged') && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={(ev) => { ev.stopPropagation(); onMarkReviewed(entry.id); }}
            className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-green-100"
            title="Mark reviewed"
          >
            <CheckCircle size={10} style={{ color: '#16a34a' }} />
          </button>
          {entry.reviewStatus === 'unreviewed' && (
            <button
              onClick={(ev) => { ev.stopPropagation(); onFlag(entry.id); }}
              className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-amber-100"
              title="Flag for investigation"
            >
              <Flag size={10} style={{ color: '#d97706' }} />
            </button>
          )}
          <button
            onClick={(ev) => { ev.stopPropagation(); onEscalate(entry.id); }}
            className="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-red-100"
            title="Escalate"
          >
            <ArrowUpCircle size={10} style={{ color: '#dc2626' }} />
          </button>
        </div>
      )}
      {entry.reviewStatus === 'reviewed' && (
        <CheckCircle size={11} style={{ color: '#86efac' }} className="shrink-0 mt-1" />
      )}
    </div>
  );
}
