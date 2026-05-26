import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-line">
      <div className="flex items-start gap-3.5">
        <span className="w-1 h-9 rounded-full shrink-0 mt-0.5 bg-gold-500" aria-hidden />
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-ink tracking-snugger">{title}</h1>
          {subtitle && <p className="text-[13px] mt-1 font-medium text-ink-3">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 mt-1">{actions}</div>}
    </div>
  );
}
