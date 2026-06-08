import { useState } from 'react';
import { RotateCcw, CheckCircle, Flag, ArrowUpCircle } from 'lucide-react';
import { useAuditStore, type AuditEntry } from '@/store/auditStore';
import { REVIEW_CFG, fmtTime } from '@/pages/audit/shared';

export function ReviewControls({ entry }: { entry: AuditEntry }) {
  const { markReviewed, flagEntry, escalateEntry, markUnreviewed } = useAuditStore();
  const [note, setNote]   = useState(entry.reviewNote ?? '');
  const [mode, setMode]   = useState<'view' | 'flag' | 'escalate'>('view');

  // Reset the draft note when a different entry is shown. Adjusting state during
  // render (tracking the previous id) is React's recommended alternative to a
  // setState-in-effect.
  const [trackedId, setTrackedId] = useState(entry.id);
  if (trackedId !== entry.id) {
    setTrackedId(entry.id);
    setNote(entry.reviewNote ?? '');
  }

  const rvwCfg = REVIEW_CFG[entry.reviewStatus];

  return (
    <div
      className="rounded-lg p-3 mt-2"
      style={{ background: rvwCfg.bg, border: `1px solid ${rvwCfg.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rvwCfg.color }}>
          Review Status: {rvwCfg.label}
        </span>
        {entry.reviewStatus === 'reviewed' && entry.reviewedAt && (
          <span className="text-[9px] text-ink-4">
            {fmtTime(entry.reviewedAt)}{entry.reviewedBy ? ` by ${entry.reviewedBy}` : ''}
          </span>
        )}
      </div>

      {entry.reviewNote && (
        <p className="text-[11px] text-ink-2 italic mb-2">"{entry.reviewNote}"</p>
      )}

      {entry.reviewStatus === 'reviewed' ? (
        <div className="flex gap-2">
          <button
            onClick={() => markUnreviewed(entry.id)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded border transition-colors hover:bg-white"
            style={{ borderColor: '#e2e8f0', color: '#64748b' }}
          >
            <RotateCcw size={9} />
            Mark Unreviewed
          </button>
        </div>
      ) : (
        <>
          {mode === 'view' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => markReviewed(entry.id, note || undefined)}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded text-white transition-all"
                style={{ background: '#16a34a' }}
              >
                <CheckCircle size={9} />
                Mark Reviewed
              </button>
              {entry.reviewStatus !== 'flagged' && (
                <button
                  onClick={() => setMode('flag')}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded border transition-colors hover:bg-amber-50"
                  style={{ borderColor: '#fcd34d', color: '#d97706' }}
                >
                  <Flag size={9} />
                  Flag for Investigation
                </button>
              )}
              {entry.reviewStatus !== 'escalated' && (
                <button
                  onClick={() => setMode('escalate')}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded border transition-colors hover:bg-red-50"
                  style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                >
                  <ArrowUpCircle size={9} />
                  Escalate
                </button>
              )}
            </div>
          )}

          {(mode === 'flag' || mode === 'escalate') && (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={mode === 'flag' ? 'Reason for flagging…' : 'Reason for escalation…'}
                rows={2}
                className="w-full text-[11px] border rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: mode === 'flag' ? '#fcd34d' : '#fca5a5' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (mode === 'flag') flagEntry(entry.id, note || 'Flagged for investigation');
                    else escalateEntry(entry.id, note || 'Escalated for review');
                    setMode('view');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded text-white"
                  style={{ background: mode === 'flag' ? '#d97706' : '#dc2626' }}
                >
                  {mode === 'flag' ? <><Flag size={9} /> Confirm Flag</> : <><ArrowUpCircle size={9} /> Confirm Escalate</>}
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="px-2.5 py-1 text-[10px] text-ink-4 hover:text-ink-2 rounded border border-line"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {mode === 'view' && (
            <div className="mt-2 flex gap-2">
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a review note (optional)…"
                className="flex-1 text-[11px] border border-line rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2"
                onKeyDown={e => {
                  if (e.key === 'Enter') markReviewed(entry.id, note || undefined);
                }}
              />
              {note && (
                <button
                  onClick={() => markReviewed(entry.id, note || undefined)}
                  className="px-2.5 py-1 text-[10px] font-semibold rounded text-white"
                  style={{ background: '#16a34a' }}
                >
                  Save & Review
                </button>
              )}
            </div>
          )}

          {entry.reviewStatus === 'flagged' && (
            <button
              onClick={() => markUnreviewed(entry.id)}
              className="mt-2 text-[10px] text-ink-4 hover:text-ink-2 underline"
            >
              Remove flag
            </button>
          )}
        </>
      )}
    </div>
  );
}
