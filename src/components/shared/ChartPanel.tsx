// ============================================================
// ChartPanel — the shared wrapper around every chart in the app.
//
// It turns a bare chart into something a first-timer can read:
//   • a plain-language title and one-line "what this shows" caption;
//   • a "How to read this" (i) popover (InfoTip);
//   • an optional plain-English takeaway strip below the chart;
//   • an "Explain with AI" button that opens the existing grounded
//     briefing card — but only when an AI provider is configured.
//
// The panel root carries the same data-ai-* attributes the right-click
// AI menu reads, so the button and a right-click resolve to identical
// context. Everything except the AI button renders with no AI set up.
// ============================================================

import { useRef, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoTip } from '@/components/shared/InfoTip';
import { useExplainWithAI } from '@/hooks/useExplainWithAI';

interface ChartPanelProps {
  /** Plain-language chart title. */
  title: string;
  /** One line: what this chart is showing, in everyday words. */
  caption?: string;
  /** Body of the "How to read this" popover. */
  howToRead?: ReactNode;
  /** A plain-English takeaway shown beneath the chart. */
  takeaway?: ReactNode;
  /** Accent bar colour. */
  accent?: string;
  /** Extra header actions (rendered left of the Explain button). */
  actions?: ReactNode;
  /** Accessible description of the chart for screen readers. */
  ariaLabel?: string;
  /** data-ai-* hooks so the AI layer can ground on this chart. */
  aiRegion?: string;
  aiEntity?: string;
  aiLabel?: string;
  /** Classes for the outer <section> (e.g. grid spans). */
  className?: string;
  /** Classes for the chart body wrapper (control height/padding). */
  bodyClassName?: string;
  children: ReactNode;
}

export function ChartPanel({
  title,
  caption,
  howToRead,
  takeaway,
  accent = 'var(--primary)',
  actions,
  ariaLabel,
  aiRegion,
  aiEntity,
  aiLabel,
  className,
  bodyClassName,
  children,
}: ChartPanelProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { ready: aiReady, explain } = useExplainWithAI();

  const explainWithAI = (e: React.MouseEvent<HTMLButtonElement>) => {
    explain(rootRef.current, e.currentTarget.getBoundingClientRect());
  };

  return (
    <section
      ref={rootRef}
      className={cn('glass-card flex flex-col', className)}
      data-ai-region={aiRegion}
      data-ai-entity={aiEntity}
      data-ai-label={aiLabel}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line-soft bg-foreground/[0.01] px-6 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 h-5 w-1 shrink-0 rounded-full shadow-glow" style={{ background: accent }} aria-hidden />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-[14px] font-bold tracking-wide text-foreground">{title}</h2>
              {howToRead && <InfoTip title="How to read this" body={howToRead} label={`How to read: ${title}`} />}
            </div>
            {caption && <p className="mt-0.5 text-[12px] font-medium leading-snug text-ink-4">{caption}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {aiReady && (
            <button
              type="button"
              onClick={explainWithAI}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-600/30 bg-brand-600/10 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-600/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
              title="Get an AI explanation of this chart, grounded in the current data"
            >
              <Sparkles size={12} aria-hidden />
              Explain with AI
            </button>
          )}
        </div>
      </div>

      <div
        className={cn('flex-1 p-5', !bodyClassName && 'min-h-[280px]', bodyClassName)}
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      {takeaway && (
        <div className="flex items-start gap-2 border-t border-line-soft bg-brand-600/[0.04] px-6 py-3">
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">In plain terms</span>
          <p className="text-[12px] leading-relaxed text-ink-3">{takeaway}</p>
        </div>
      )}
    </section>
  );
}
