import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, FileText } from 'lucide-react';
import { getRiskFlags, getAgreements, daysUntilExpiry } from '@/services/dataService';

const GOLD = '#C8991E';
const SIDEBAR_BG = '#011F14';

type AlertType = 'critical' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  category: string;
  title: string;
  detail: string;
  href?: string;
}

function buildAlerts(): Alert[] {
  const alerts: Alert[] = [];

  const criticalFlags = getRiskFlags(undefined).filter(
    f => f.severity === 'critical' && f.status !== 'resolved',
  );
  criticalFlags.slice(0, 4).forEach(f => {
    alerts.push({
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
    alerts.push({
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
    alerts.push({
      id: `exp-${a.id}`,
      type: a.days < 30 ? 'critical' : 'warning',
      category: 'Agreement Expiry',
      title: a.id,
      detail: `Expires in ${a.days} days — ${a.concesssionArea}`,
      href: `/agreements/${a.id}`,
    });
  });

  return alerts;
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const alerts = buildAlerts();
  const criticalCount = alerts.filter(a => a.type === 'critical').length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`System alerts, ${alerts.length} active`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Bell size={15} aria-hidden />
        {alerts.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1"
            style={{ background: criticalCount > 0 ? '#B91C1C' : '#B45309' }}
            aria-hidden
          >
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="System alerts"
          className="absolute right-0 top-full mt-2 w-[348px] bg-surface rounded-xl shadow-pop z-50 overflow-hidden border border-line"
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: SIDEBAR_BG, borderBottom: `2px solid ${GOLD}` }}
          >
            <div className="flex items-center gap-2">
              <Bell size={11} style={{ color: GOLD }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>
                System Alerts
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/40">
              {alerts.length} active
            </span>
          </div>

          <div className="divide-y divide-line-soft max-h-[300px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div role="status" className="px-4 py-8 text-center text-sm text-ink-4">
                No active alerts
              </div>
            ) : (
              alerts.map(alert => (
                <button
                  key={alert.id}
                  className="w-full text-left px-4 py-3 bg-surface hover:bg-surface-2 transition-colors"
                  onClick={() => { if (alert.href) { navigate(alert.href); setOpen(false); } }}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5" aria-hidden>
                      {alert.type === 'critical' ? (
                        <AlertTriangle size={13} className="text-status-danger" />
                      ) : alert.type === 'warning' ? (
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
                            (alert.type === 'critical' ? 'text-status-danger'
                              : alert.type === 'warning' ? 'text-amber-800'
                              : 'text-status-success')
                          }
                        >
                          {alert.category}
                        </span>
                        <span className="text-[10px] font-mono text-ink-4">{alert.title}</span>
                      </div>
                      <div className="text-xs leading-snug text-ink-3">{alert.detail}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between border-t border-line-soft bg-surface-2">
            <button
              onClick={() => { navigate('/risk'); setOpen(false); }}
              className="text-[11px] font-semibold text-brand-600 hover:underline"
            >
              Open Risk Register →
            </button>
            <span className="text-[10px] font-mono text-ink-4 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 pulse-live" aria-hidden />
              LIVE DATA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
