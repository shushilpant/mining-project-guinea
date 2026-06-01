// ============================================================
// ModuleIntro — a friendly "what is this page, and what can you do
// here" panel shown at the top of every module. Reads its copy from
// the content layer (guide.ts) so wording lives in one place.
//
//   • Fully static — works with no AI configured.
//   • Dismissible; the choice is remembered per-route (onboardingStore).
//     When dismissed it collapses to a slim "show guide" bar so a
//     returning user isn't nagged but can always bring it back.
//   • Offers an optional "Explain this page with AI" when a provider
//     is set up, reusing the existing grounded briefing card.
// ============================================================

import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Compass, X, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { moduleForPath } from '@/content/guide';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useExplainWithAI } from '@/hooks/useExplainWithAI';

export function ModuleIntro() {
  const location = useLocation();
  const guide = moduleForPath(location.pathname);

  const dismissed = useOnboardingStore((s) => (guide ? !!s.dismissedIntros[guide.route] : false));
  const dismissIntro = useOnboardingStore((s) => s.dismissIntro);
  const restoreIntro = useOnboardingStore((s) => s.restoreIntro);

  const { ready, explain } = useExplainWithAI();
  const rootRef = useRef<HTMLDivElement>(null);

  if (!guide) return null;

  if (dismissed) {
    return (
      <button
        id="page-guide"
        type="button"
        onClick={() => restoreIntro(guide.route)}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line-soft bg-surface-2 px-3 py-1.5 text-[12px] font-medium text-ink-3 transition hover:border-brand-600/40 hover:text-brand-700"
      >
        <HelpCircle size={14} aria-hidden />
        New here? Show what this page does
      </button>
    );
  }

  return (
    <div
      id="page-guide"
      ref={rootRef}
      data-ai-region={guide.plainName}
      className="relative mb-5 overflow-hidden rounded-2xl border border-brand-600/20 bg-brand-600/[0.04] p-5 transition-shadow duration-300"
    >
      <button
        type="button"
        onClick={() => dismissIntro(guide.route)}
        aria-label="Hide this guide"
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <X size={15} aria-hidden />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 text-brand-700">
          <Compass size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-bold tracking-tight text-ink">{guide.plainName}</h2>
            <span className="rounded-full border border-line-soft bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
              {guide.moduleCode ? `${guide.moduleCode} · ` : ''}{guide.official}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{guide.tagline}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 pl-12 sm:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">What you can do here</h3>
          <ul className="space-y-1.5">
            {guide.whatYouCanDo.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-3">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">How to read this page</h3>
          <p className="text-[12.5px] leading-relaxed text-ink-3">{guide.howToRead}</p>
          {ready && (
            <button
              type="button"
              onClick={(e) => explain(rootRef.current, e.currentTarget.getBoundingClientRect())}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-600/30 bg-brand-600/10 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-600/15"
            >
              <Sparkles size={12} aria-hidden />
              Explain this page with AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
