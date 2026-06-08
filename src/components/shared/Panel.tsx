// ============================================================
// Panel + PanelHeader — the shared "section card" used across
// modules: a glass card with an accent-bar header (title,
// optional subtitle, "how to read this" tip, and right-aligned
// actions). Previously redefined locally in several pages.
// ============================================================
import type { ReactNode } from 'react';
import { InfoTip } from '@/components/shared/InfoTip';

/** Glass-card section wrapper. */
export function Panel({ children, className = '', aiRegion }: { children: ReactNode; className?: string; aiRegion?: string }) {
  return (
    // data-ai-region scopes the right-click "Explain this section" AI to this
    // panel instead of falling through to the page-level region.
    <section className={`glass-card flex flex-col ${className}`} data-ai-region={aiRegion}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title, subtitle, actions, accent = '#10B981', howToRead,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  accent?: string;
  howToRead?: string;
}) {
  return (
    <div className="px-6 py-5 flex items-center justify-between border-b border-line-soft bg-foreground/[0.01]">
      <div className="flex items-center gap-3">
        <span className="w-1 h-5 rounded-full shadow-glow" style={{ background: accent }} aria-hidden />
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[14px] font-bold tracking-wide text-foreground">{title}</h2>
            {howToRead && <InfoTip title="How to read this" body={howToRead} label={`How to read: ${title}`} />}
          </div>
          {subtitle && <p className="text-[12px] mt-0.5 text-ink-4 font-medium">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}
