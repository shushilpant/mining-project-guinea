import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Official / institutional name shown as a small tag beside the title. */
  badge?: string;
}

export function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-line">
      <div className="flex items-start gap-3.5">
        <span className="w-1 h-9 rounded-full shrink-0 mt-0.5 bg-gold-500" aria-hidden />
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-bold leading-tight text-ink tracking-snugger">{title}</h1>
            {badge && (
              <span className="rounded-full border border-line-soft bg-surface-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[13px] mt-1 font-medium text-ink-3">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 mt-1">{actions}</div>}
    </div>
  );
}
