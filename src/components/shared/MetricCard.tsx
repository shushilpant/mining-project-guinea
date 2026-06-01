import type { ReactNode } from 'react';
import { InfoTip } from '@/components/shared/InfoTip';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accent?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  onClick?: () => void;
  /** Plain-language explanation of what this metric means. */
  hint?: string;
  /** Alignment of the info tooltip popover */
  tooltipAlign?: 'start' | 'end' | 'center';
}

const ACCENT: Record<string, { bar: string; iconBg: string; iconColor: string }> = {
  default: { bar: 'var(--line-strong)', iconBg: 'var(--secondary)',            iconColor: 'var(--ink-3)' },
  green:   { bar: 'var(--primary)',     iconBg: 'color-mix(in srgb, var(--primary) 10%, transparent)', iconColor: 'var(--primary)' },
  amber:   { bar: '#D97706',           iconBg: 'rgba(217, 119, 6, 0.1)',       iconColor: '#D97706' },
  red:     { bar: 'var(--destructive)', iconBg: 'color-mix(in srgb, var(--destructive) 10%, transparent)', iconColor: 'var(--destructive)' },
  blue:    { bar: '#1D6FB8',           iconBg: 'rgba(29, 111, 184, 0.1)',      iconColor: '#1D6FB8' },
};

export function MetricCard({ label, value, sub, icon, accent = 'default', onClick, hint, tooltipAlign }: MetricCardProps) {
  const a = ACCENT[accent];
  const interactive = !!onClick;

  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick!(); } } : undefined}
      className={
        'relative rounded-2xl bg-card border border-line-soft shadow-card transition-all duration-300 ' +
        (interactive ? 'card-hover cursor-pointer' : '')
      }
      style={{ borderLeftWidth: 3, borderLeftColor: a.bar }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] truncate opacity-70" style={{ color: a.iconColor }}>{label}</p>
              {hint && (
                <span
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <InfoTip title={label} body={hint} label={`What "${label}" means`} align={tooltipAlign} />
                </span>
              )}
            </div>
            <p className="text-[26px] font-bold tabular-nums leading-none tracking-tight" style={{ color: a.iconColor }}>
              {value}
            </p>
            <p className="text-[11px] mt-1.5 leading-none truncate opacity-70" style={{ color: a.iconColor }} aria-hidden={!sub}>
              {sub ?? <span className="select-none">&nbsp;</span>}
            </p>
          </div>

          {icon && (
            <div
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: a.iconBg, color: a.iconColor }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
