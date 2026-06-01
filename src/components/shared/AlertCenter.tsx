// ============================================================
// AlertCenter — header-integrated automated-alerts dropdown.
//
// Alert *definitions* come from the seed layer (getSystemAlerts);
// acknowledgement / dismissal state lives in the persisted
// alertStore so it survives reloads without mutating the DB.
// Sits beside NotificationPanel in the header toolbar.
// ============================================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, Check, X, ShieldCheck } from 'lucide-react';
import { getSystemAlerts } from '@/services/dataService';
import { useAlertStore } from '@/store/alertStore';
import type { AlertPriority, AlertCategory } from '@/data/types';

const GOLD = '#d68a18';
const SIDEBAR_BG = '#062b1d';

const PRIORITY_COLOR: Record<AlertPriority, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#6B7280',
};

const CATEGORY_LABEL: Record<AlertCategory, string> = {
  compliance: 'Compliance',
  payment: 'Payment',
  deadline: 'Deadline',
  renewal: 'Renewal',
  risk: 'Risk',
  regulatory: 'Regulatory',
  esg: 'ESG',
};

export function AlertCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const acknowledged = useAlertStore((s) => s.acknowledged);
  const dismissed = useAlertStore((s) => s.dismissed);
  const acknowledge = useAlertStore((s) => s.acknowledge);
  const dismiss = useAlertStore((s) => s.dismiss);

  const alerts = useMemo(
    () => getSystemAlerts().filter((a) => !dismissed[a.id]),
    [dismissed],
  );

  const unacked = alerts.filter((a) => !acknowledged[a.id]);
  const criticalUnacked = unacked.filter((a) => a.priority === 'critical').length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Automated alerts, ${unacked.length} unacknowledged`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Siren size={15} aria-hidden />
        {unacked.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1"
            style={{ background: criticalUnacked > 0 ? '#B91C1C' : '#B45309' }}
            aria-hidden
          >
            {unacked.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Automated alerts"
          className="absolute right-0 top-full mt-2 w-[360px] bg-surface rounded-xl shadow-pop z-50 overflow-hidden border border-line"
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: SIDEBAR_BG, borderBottom: `2px solid ${GOLD}` }}
          >
            <div className="flex items-center gap-2">
              <Siren size={11} style={{ color: GOLD }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
                Alert Center
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/40">
              {unacked.length} unacknowledged
            </span>
          </div>

          <div className="divide-y divide-line-soft max-h-[340px] overflow-y-auto slim-scrollbar">
            {alerts.length === 0 ? (
              <div role="status" className="px-4 py-8 text-center text-sm text-ink-4">
                No active alerts
              </div>
            ) : (
              alerts.map((alert) => {
                const isAcked = !!acknowledged[alert.id];
                const color = PRIORITY_COLOR[alert.priority];
                return (
                  <div
                    key={alert.id}
                    className={
                      'px-4 py-3 transition-colors ' +
                      (isAcked ? 'bg-surface opacity-55' : 'bg-surface hover:bg-surface-2')
                    }
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => { navigate(alert.actionUrl); setOpen(false); }}
                      >
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                            style={{ color, background: `${color}1A` }}
                          >
                            {CATEGORY_LABEL[alert.category]} · {alert.priority}
                          </span>
                        </div>
                        <div className="text-[12px] font-semibold leading-snug text-ink">{alert.title}</div>
                        <div className="text-[11px] leading-snug text-ink-4 mt-0.5">{alert.description}</div>
                      </button>
                      <div className="flex flex-col gap-1 shrink-0">
                        {!isAcked ? (
                          <button
                            type="button"
                            onClick={() => acknowledge(alert.id)}
                            aria-label="Acknowledge alert"
                            title="Acknowledge"
                            className="flex items-center justify-center w-6 h-6 rounded-md text-ink-4 hover:text-status-success hover:bg-status-success/10 transition-colors"
                          >
                            <Check size={13} />
                          </button>
                        ) : (
                          <span
                            aria-label="Acknowledged"
                            title="Acknowledged"
                            className="flex items-center justify-center w-6 h-6 rounded-md text-status-success"
                          >
                            <ShieldCheck size={13} />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => dismiss(alert.id)}
                          aria-label="Dismiss alert"
                          title="Dismiss"
                          className="flex items-center justify-center w-6 h-6 rounded-md text-ink-4 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between border-t border-line-soft bg-surface-2">
            <button
              onClick={() => { navigate('/'); setOpen(false); }}
              className="text-[11px] font-semibold text-brand-600 hover:underline"
            >
              View all on Dashboard →
            </button>
            <span className="text-[10px] font-mono text-ink-4 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 pulse-live" aria-hidden />
              RULE-DRIVEN
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
