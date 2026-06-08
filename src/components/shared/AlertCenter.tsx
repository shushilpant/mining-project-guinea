// ============================================================
// AlertCenter — unified header notifications + alerts control.
//
// Combines two previously separate header dropdowns into one:
//   • Automated alerts — rule-driven definitions from the seed layer
//     (getSystemAlerts); acknowledgement / dismissal state lives in the
//     persisted alertStore so it survives reloads without mutating the DB.
//   • Live notifications — derived on the fly from current risk flags and
//     near-term agreement expiries.
// A single bell shows the combined unactioned count; the dropdown lists
// both streams under clear sub-headers.
// ============================================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, ShieldCheck, AlertTriangle, Clock, FileText } from 'lucide-react';
import {
  getSystemAlerts,
  getRiskFlags,
  getAgreements,
  daysUntilExpiry,
} from '@/services/dataService';
import { useAlertStore } from '@/store/alertStore';
import type { AlertCategory } from '@/data/types';
import { ALERT_PRIORITY_COLOR } from '@/lib/statusStyles';

const GOLD = '#d68a18';
const SIDEBAR_BG = '#062b1d';

const CATEGORY_LABEL: Record<AlertCategory, string> = {
  compliance: 'Compliance',
  payment: 'Payment',
  deadline: 'Deadline',
  renewal: 'Renewal',
  risk: 'Risk',
  regulatory: 'Regulatory',
  esg: 'ESG',
};

type LiveType = 'critical' | 'warning' | 'info';
interface LiveNotification {
  id: string;
  type: LiveType;
  category: string;
  title: string;
  detail: string;
  href?: string;
}

// Live notifications are computed from the current data scope — open critical
// / high risk flags and active agreements nearing expiry.
function buildLiveNotifications(): LiveNotification[] {
  const items: LiveNotification[] = [];

  const criticalFlags = getRiskFlags(undefined).filter(
    f => f.severity === 'critical' && f.status !== 'resolved',
  );
  criticalFlags.slice(0, 4).forEach(f => {
    items.push({
      id: `flag-${f.id}`,
      type: 'critical',
      category: 'Critical Risk Flag',
      title: f.category,
      detail: f.description.length > 72 ? f.description.slice(0, 72) + '…' : f.description,
      href: `/risk/${f.id}`,
    });
  });

  const highFlags = getRiskFlags(undefined).filter(
    f => f.severity === 'high' && f.status === 'open',
  );
  highFlags.slice(0, 2).forEach(f => {
    items.push({
      id: `flagH-${f.id}`,
      type: 'warning',
      category: 'High Severity Flag',
      title: f.category,
      detail: f.description.length > 72 ? f.description.slice(0, 72) + '…' : f.description,
      href: `/risk/${f.id}`,
    });
  });

  const expiring = getAgreements(undefined)
    .filter(a => a.status === 'active')
    .map(a => ({ ...a, days: daysUntilExpiry(a.expiryDate) }))
    .filter(a => a.days > 0 && a.days < 90)
    .sort((a, b) => a.days - b.days);

  expiring.slice(0, 3).forEach(a => {
    items.push({
      id: `exp-${a.id}`,
      type: a.days < 30 ? 'critical' : 'warning',
      category: 'Agreement Expiry',
      title: a.id,
      detail: `Expires in ${a.days} days — ${a.concesssionArea}`,
      href: `/agreements/${a.id}`,
    });
  });

  return items;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  // Solid (not translucent) background + border so rows scrolling underneath
  // this sticky header are fully occluded rather than bleeding through.
  return (
    <div className="px-4 pt-2.5 pb-1.5 bg-surface-2 border-b border-line-soft sticky top-0 z-10">
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-4">{children}</span>
    </div>
  );
}

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
  const notifications = useMemo(() => buildLiveNotifications(), []);

  const unacked = alerts.filter((a) => !acknowledged[a.id]);
  const criticalUnacked = unacked.filter((a) => a.priority === 'critical').length;
  const criticalNotifications = notifications.filter((n) => n.type === 'critical').length;

  // The badge surfaces everything that still wants attention.
  const badgeCount = unacked.length + notifications.length;
  const hasCritical = criticalUnacked > 0 || criticalNotifications > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isEmpty = alerts.length === 0 && notifications.length === 0;

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications and alerts, ${badgeCount} need attention`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Bell size={15} aria-hidden />
        {badgeCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1"
            style={{ background: hasCritical ? '#B91C1C' : '#B45309' }}
            aria-hidden
          >
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications and alerts"
          className="absolute right-0 top-full mt-2 w-[368px] bg-surface dark:bg-[#141414] rounded-xl shadow-pop z-50 overflow-hidden border border-line"
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: SIDEBAR_BG, borderBottom: `2px solid ${GOLD}` }}
          >
            <div className="flex items-center gap-2">
              <Bell size={11} style={{ color: GOLD }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
                Notifications &amp; Alerts
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/40">
              {badgeCount} active
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto slim-scrollbar">
            {isEmpty ? (
              <div role="status" className="px-4 py-8 text-center text-sm text-ink-4">
                Nothing to review
              </div>
            ) : (
              <>
                {/* ── Automated, rule-driven alerts ─────────────── */}
                {alerts.length > 0 && (
                  <>
                    <SectionHeader>Automated Alerts</SectionHeader>
                    <div className="divide-y divide-line-soft">
                      {alerts.map((alert) => {
                        const isAcked = !!acknowledged[alert.id];
                        const color = ALERT_PRIORITY_COLOR[alert.priority];
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
                      })}
                    </div>
                  </>
                )}

                {/* ── Live, data-derived notifications ──────────── */}
                {notifications.length > 0 && (
                  <>
                    <SectionHeader>Live Notifications</SectionHeader>
                    <div className="divide-y divide-line-soft">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          className="w-full text-left px-4 py-3 bg-surface hover:bg-surface-2 transition-colors"
                          onClick={() => { if (n.href) { navigate(n.href); setOpen(false); } }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5" aria-hidden>
                              {n.type === 'critical' ? (
                                <AlertTriangle size={13} className="text-status-danger" />
                              ) : n.type === 'warning' ? (
                                <Clock size={13} className="text-status-warning" />
                              ) : (
                                <FileText size={13} className="text-brand-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span
                                  className={
                                    'text-[10px] font-bold uppercase tracking-wide ' +
                                    (n.type === 'critical' ? 'text-status-danger'
                                      : n.type === 'warning' ? 'text-amber-800'
                                      : 'text-status-success')
                                  }
                                >
                                  {n.category}
                                </span>
                                <span className="text-[10px] font-mono text-ink-4">{n.title}</span>
                              </div>
                              <div className="text-xs leading-snug text-ink-3">{n.detail}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
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
