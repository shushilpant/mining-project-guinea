import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accent?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  onClick?: () => void;
}

const ACCENT: Record<string, { bar: string; iconBg: string; iconColor: string; valueColor: string }> = {
  default: { bar: '#C7D3BE', iconBg: '#F0F4EC', iconColor: '#5A7567', valueColor: '#072B1E' },
  green:   { bar: '#047857', iconBg: '#E7F4EE', iconColor: '#047857', valueColor: '#065F46' },
  amber:   { bar: '#B45309', iconBg: '#FBF1E3', iconColor: '#B45309', valueColor: '#92400E' },
  red:     { bar: '#B91C1C', iconBg: '#FBEBEB', iconColor: '#B91C1C', valueColor: '#991B1B' },
  blue:    { bar: '#1D6FB8', iconBg: '#E8F1F8', iconColor: '#1D6FB8', valueColor: '#015534' },
};

export function MetricCard({ label, value, sub, icon, accent = 'default', onClick }: MetricCardProps) {
  const a = ACCENT[accent];
  const interactive = !!onClick;

  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick!(); } } : undefined}
      className={
        'relative flex overflow-hidden rounded-xl bg-surface border border-line shadow-xs count-up ' +
        (interactive ? 'card-hover cursor-pointer hover:shadow-md hover:border-line-strong' : '')
      }
    >
      {/* Restrained left accent rule */}
      <span className="w-[3px] shrink-0" style={{ background: a.bar }} aria-hidden />

      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2 text-ink-4">{label}</p>
            <p className="text-[26px] font-bold tabular-nums leading-none tracking-tightest" style={{ color: a.valueColor }}>
              {value}
            </p>
            {sub && <p className="text-[11px] mt-1.5 leading-tight text-ink-3">{sub}</p>}
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
