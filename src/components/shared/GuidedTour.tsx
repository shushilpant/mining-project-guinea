// ============================================================
// GuidedTour — a lightweight first-run orientation overlay.
//
// Shows once (tracked in onboardingStore.tourSeen) the first time a
// user reaches the app, and can be re-opened any time from the header
// HelpButton (which calls resetTour). Deliberately simple: a dimmed
// backdrop with centered step cards — no element spotlighting, so it
// can never point at something that isn't on screen.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Compass, LayoutDashboard, Globe2, Sparkles, BookOpen, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboardingStore';

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Compass,
    title: 'Welcome — here’s a 30-second tour',
    body: 'This platform helps you keep track of mining agreements and whether companies keep their promises. No prior training needed — every page explains itself.',
  },
  {
    icon: LayoutDashboard,
    title: 'Find your way around',
    body: 'The left sidebar lists every section in plain language — Overview, Mining Agreements, Risk Alerts, and more. Start on Overview for the big picture, then click into anything that needs a closer look.',
  },
  {
    icon: Globe2,
    title: 'Choose what you’re looking at',
    body: 'Use the country selector in the top bar to focus on one country or the whole region. Every number, chart, and alert updates to match your choice.',
  },
  {
    icon: Sparkles,
    title: 'Ask the AI for help',
    body: 'Open the AI assistant in the top bar, or right-click almost anything for an instant, plain-English explanation grounded in the real data. (First set it up under Settings & Data.)',
  },
  {
    icon: BookOpen,
    title: 'Every page teaches you',
    body: 'Each page opens with a “What is this page?” guide, and every chart has a “How to read this” (i) icon plus a plain-English takeaway. Hover any underlined term for its definition.',
  },
];

export function GuidedTour() {
  const tourSeen = useOnboardingStore((s) => s.tourSeen);
  const markTourSeen = useOnboardingStore((s) => s.markTourSeen);
  const [step, setStep] = useState(0);

  // Complete or skip → remember it, and reset to the first step so a later
  // re-open (via the Help button) starts fresh. Resetting here, in the
  // handler, avoids a setState-in-effect on open.
  const finish = useCallback(() => {
    setStep(0);
    markTourSeen();
  }, [markTourSeen]);

  useEffect(() => {
    if (tourSeen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tourSeen, finish]);

  if (tourSeen) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      onMouseDown={(e) => { if (e.target === e.currentTarget) finish(); }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-4">
            Getting started · {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={finish}
            aria-label="Skip the tour"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="px-6 py-6">
          <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/15 text-brand-700">
            <Icon size={22} aria-hidden />
          </span>
          <h2 className="text-[18px] font-bold tracking-tight text-ink">{s.title}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-3">{s.body}</p>
        </div>

        <div className="flex items-center justify-between border-t border-line-soft px-5 py-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={
                  'h-1.5 rounded-full transition-all ' +
                  (i === step ? 'w-5 bg-brand-600' : 'w-1.5 bg-line-strong')
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((n) => n - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-line-soft px-3 py-1.5 text-[12px] font-semibold text-ink-3 transition-colors hover:bg-foreground/5"
              >
                <ChevronLeft size={14} aria-hidden /> Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? finish() : setStep((n) => n + 1))}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-bold text-primary-foreground transition-colors hover:opacity-90"
            >
              {isLast ? 'Get started' : <>Next <ChevronRight size={14} aria-hidden /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
